import TelegramBot from 'node-telegram-bot-api';

import { envClientSchema } from './environment';
import { WorkingTimeCounterRepositoryInterface } from './WorkingTimeCounterRepositoryInterface';
import { WorkingTimeCounterRepository } from './WorkingTimeCounterRepository';
import { createDbConnection } from './createDbConnection';

function formatProductCaption(product: Product) {
  return `*${product.name}*\nПодробнее: ${product.description}`;
}

export type Product = {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  parse_mode?: 'Markdown' | 'Markdown2' | 'HTML';
};

const products: Product[] = [
  {
    id: 1,
    name: 'Добавить часы',
    description: 'Добавить отработанные часы за выбранный месяц',
    imageUrl:
      'https://thumbs.dreamstime.com/b/%D0%B1%D0%B8%D0%B7%D0%BD%D0%B5%D1%81%D0%BC%D0%B5%D0%BD-%D0%B2-%D0%BA%D0%BE%D0%BD%D1%86%D0%B5%D0%BF%D1%86%D0%B8%D0%B8-%D0%BA%D0%BE%D0%BD%D1%82%D1%80%D0%BE%D0%BB%D1%8F-%D0%B2%D1%80%D0%B5%D0%BC%D0%B5%D0%BD%D0%B8-210055625.jpg',
    parse_mode: 'Markdown',
  },
  {
    id: 2,
    name: 'Посмотреть ранее введенные часы',
    description: 'Посмотреть отработанные часы за выбранный месяц',
    imageUrl: 'https://wallpapersgood.ru/wallpapers/main2/201727/1499165645595b73cd2742b5.88006733.jpg',
    parse_mode: 'Markdown',
  },
];

const telegramBotCommands: TelegramBot.BotCommand[] = [
  { command: 'start', description: 'Запуск бота' },
  { command: 'ref', description: 'Получить реферальную ссылку' },
  { command: 'menu', description: 'Меню-клавиатура' },
  { command: 'addtime', description: 'Добавить часы' },
  { command: 'myhours', description: 'Посмотреть ранее введенные часы' },
  { command: 'help', description: 'Раздел помощи' },
];

class WorkingTimeCounterBot {
  constructor(
    private readonly telegramBot: TelegramBot,
    private readonly workingTimeCounterRepository: WorkingTimeCounterRepositoryInterface,
  ) {}

  async launch(): Promise<void> {
    console.log('[WorkingTimeCounterBot.launch] init..');

    this.telegramBot.setMyCommands(telegramBotCommands);
    await this.onUserInputTextHandler();
  }

  private async onUserInputTextHandler(): Promise<void> {
    this.telegramBot.on('text', async (msg) => {
      // const msgWait = await bot.sendMessage(msg.chat.id, `Бот генерирует ответ...`);
      const chatId = msg.chat.id;
      const response = 'Привет! 👋🏻 Вы запустили бота!\n\nЗдесь есть вот такие возможности:';
      // Проходимся по массиву products методом map и создаем сами карточки //
      const messageOptions = products.map((product) => {
        return {
          chat_id: chatId,
          photo: product.imageUrl,
          caption: formatProductCaption(product),
          parse_mode: product.parse_mode,
        };
      });

      try {
        if (msg.text && msg.text.startsWith('/start')) {
          await this.telegramBot.sendMessage(chatId, response);

          // Отправляем сообщение с карточками продуктов
          await Promise.all(
            messageOptions.map((options, index) => {
              return this.telegramBot.sendMessage(options.chat_id, options.caption, {
                // parse_mode: options.parse_mode,
                parse_mode: 'HTML',
                reply_markup: {
                  inline_keyboard: [[{ text: 'Взаимодействовать', callback_data: `product_${index}` }]],
                },
              });
            }),
          );

          if (msg.text.length > 6) {
            const refID = msg.text.slice(7);

            await this.telegramBot.sendMessage(msg.chat.id, `Вы зашли по ссылке пользователя с ID ${refID}`);
          }
        } else if (msg.text == '/ref') {
          await this.telegramBot.sendMessage(msg.chat.id, `${envClientSchema.URL_TO_BOT}?start=${msg.from?.id}`);
        } else if (msg.text == '/help') {
          await this.telegramBot.sendMessage(msg.chat.id, 'Раздел помощи');
        } else if (msg.text == '/addtime') {
          await this.workingTimeCounterRepository.addWorkingTime({
            hours: 5,
            months: 5,
            userUuid: '123',
          });
          await this.telegramBot.sendMessage(msg.chat.id, 'Время успешно добавлено!');
        } else if (msg.text == '/myhours') {
          await this.workingTimeCounterRepository.getWorkingTime('123');
          await this.telegramBot.sendMessage(msg.chat.id, 'В процессе разработки,\nпопробуй что-нибудь другое');
        } else {
          await this.telegramBot.sendMessage(msg.chat.id, 'Я тебя не понял, давай еще раз.');
        }
      } catch (error) {
        console.log('error: ' + error);
      }
    });
  }
}

(async () => {
  const telegramToken = envClientSchema.BOT_TOKEN;
  const telegramBot = new TelegramBot(telegramToken, { polling: true });

  const dbConnection = await createDbConnection();
  const workingTimeCounterRepository = new WorkingTimeCounterRepository(
    dbConnection,
  );

  const workingTimeCounterBot = new WorkingTimeCounterBot(telegramBot, workingTimeCounterRepository);
  await workingTimeCounterBot.launch();
})().then(() => {
  console.log('Telegram bot is launched');
});
