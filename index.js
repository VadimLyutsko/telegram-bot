const { commands } = require('./options');
const { sequelize } = require('./db');
// const UserModel = require('./models');
const { DataTypes } = require('sequelize');

const UserModel = sequelize.define('user', {
  id: { type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true },
  chatId: { type: DataTypes.STRING, unique: true },
  right: { type: DataTypes.INTEGER, defaultValue: 0 },
  wrong: { type: DataTypes.INTEGER, defaultValue: 0 },
});

// 👇
const URL_TO_BOT = 'https://t.me/WorkingTimeCounter_Bot';

const TelegramBot = require('node-telegram-bot-api');
// подключаем (инициализируем) библиотеку, которую установили ранее
// const token = 'Указываем в кавычках токен, который выдал Телеграм'
const token = '7429393887:AAH721lZwiUE2PfRPj9gBpgqnlfa2Vu9yX4';

// задаем токен, сам API-ключ храним в отдельном файле //
const bot = new TelegramBot(token, { polling: true });
// создаем bot, polling в значении true необходим для получения обновлений с серверов ТГ, чтобы бот работал корректно//

bot.on('polling_error', (err) => console.log(err.data.error.message));
// обработаем ошибку polling'а, выведем в консоль сообщение ошибки, если она вообще будет //

function formatProductCaption(product) {
  return `*${product.name}*\nПодробнее: ${product.description}`;
}
// функция formatProductCaption принимает переменную product и возвращает название, цену, описание, но вы можете добавлять другие необходимые поля//
const products = [
  {
    id: 1,
    name: 'Добавить часы',
    description: 'Добавить отработанные часы за выбранный месяц',
    imageUrl:
      'https://thumbs.dreamstime.com/b/%D0%B1%D0%B8%D0%B7%D0%BD%D0%B5%D1%81%D0%BC%D0%B5%D0%BD-%D0%B2-%D0%BA%D0%BE%D0%BD%D1%86%D0%B5%D0%BF%D1%86%D0%B8%D0%B8-%D0%BA%D0%BE%D0%BD%D1%82%D1%80%D0%BE%D0%BB%D1%8F-%D0%B2%D1%80%D0%B5%D0%BC%D0%B5%D0%BD%D0%B8-210055625.jpg',
  },
  {
    id: 2,
    name: 'Посмотреть ранее введенные часы',
    description: 'Посмотреть отработанные часы за выбранный месяц',
    imageUrl: 'https://wallpapersgood.ru/wallpapers/main2/201727/1499165645595b73cd2742b5.88006733.jpg',
  },
];
// создаем массив products, в котором лежат товары с нужными нам переменными: id, name, price, description, imageUrl //
//   bot.onText(/\/start/, async (msg) => {
bot.on('text', async (msg) => {
  // const msgWait = await bot.sendMessage(msg.chat.id, `Бот генерирует ответ...`);
  const chatId = msg.chat.id;
  const response = 'Привет! 👋🏻 Вы запустили бота!\n\nЗдесь есть вот такие возможности:';
  // Проходимся по массиву products методом map и создаем сами карточки //
  const messageOptions = products.map((product) => {
    return {
      chat_id: chatId,
      photo: product.imageUrl,
      caption: formatProductCaption(product),
      parse_mode: 'Markdown',
    };
  });

  try {
    if (msg.text.startsWith('/start')) {
      // setTimeout(async () => {

      // await bot.editMessageText('Ответ получен!', {

      //     chat_id: msgWait.chat.id,
      //     message_id: msgWait.message_id

      // });

      // }, 5000);

      // Вместо удаления сообщения и отправки нового сделаем отправку сообщения о генерации, а затем через 5 секунд отредактируем это сообщение на наш ответ //

      await bot.sendMessage(chatId, response);

      // Отправляем сообщение с карточками продуктов
      await Promise.all(
        messageOptions.map((options, index) => {
          return bot.sendMessage(options.chat_id, options.caption, {
            parse_mode: options.parse_mode,
            reply_markup: {
              inline_keyboard: [[{ text: 'Взаимодействовать', callback_data: `product_${index}` }]],
            },
          });
        }),
      );

      if (msg.text.length > 6) {
        const refID = msg.text.slice(7);

        await bot.sendMessage(msg.chat.id, `Вы зашли по ссылке пользователя с ID ${refID}`);
      }
    } else if (msg.text == '/ref') {
      await bot.sendMessage(msg.chat.id, `${URL_TO_BOT}?start=${msg.from.id}`);
    } else if (msg.text == '/help') {
      const user = await UserModel.findOne({ chatId });
      await bot.sendMessage(
        msg.chat.id,
        `Раздел помощи,в игре у тебя правильных ответов ${user.right}, неправильных ${user.wrong}`,
      );
    } else if (msg.text == '/addtime' || msg.text == '/myhours') {
      await bot.sendMessage(msg.chat.id, 'В процессе разработки,\nпопробуй что-нибудь другое');
    } else {
      await bot.sendMessage(msg.chat.id, 'Я тебя не понял, давай еще раз.');
    }
  } catch (error) {
    console.log('error: ' + error);
  }
});

bot.on('callback_query', async (query) => {
  console.log('Здесь сообщение');
  const user = await UserModel.findOne({ chatId });
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data === 'back') {
    // Отправляем карточки продуктов при запросе через inline keyboard
    user.right += 1;
    return sendProductList(chatId, 'Вы вернулись в меню,\nздесь есть вот такие возможности:');
  }

  const productId = data.split('_')[1];
  const selectedProduct = products[productId];

  if (selectedProduct) {
    await bot.sendPhoto(chatId, selectedProduct.imageUrl, {
      caption: formatProductCaption(selectedProduct),
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[{ text: 'Назад в меню', callback_data: 'back' }]],
      },
    });
  }
});

async function sendProductList(chatId, response) {
  await bot.sendMessage(chatId, response);

  const messageOptions = products.map((product, index) => {
    return {
      chat_id: chatId,
      photo: product.imageUrl,
      caption: formatProductCaption(product),
      parse_mode: 'Markdown',
      callback_data: `product_${index}`, // Изменяем значение callback_data value
    };
  });

  await Promise.all(
    messageOptions.map((options, index) => {
      return bot.sendMessage(options.chat_id, options.caption, {
        parse_mode: options.parse_mode,
        reply_markup: {
          inline_keyboard: [[{ text: 'Показатель детали', callback_data: options.callback_data }]],
        },
      });
    }),
  );
}

// Добавление команд в меню бота //

bot.setMyCommands(commands);

console.log('Бот запускается...');

// -----------------------------------------

// else if (msg.text == '/menu') {
//   await bot.sendMessage(msg.chat.id, `Меню бота`, {
//     reply_markup: {
//       keyboard: [
//         ['⭐️ Картинка', '⭐️ Видео'],
//         ['⭐️ Аудио', '⭐️ Голосовое сообщение'],
//         [{ text: '⭐️ Контакт', request_contact: true }, '⭐️ Геолокация'],
//         ['❌ Закрыть меню'],
//       ],
//       resize_keyboard: true,
//     },
//   });
// } else if (msg.text == '❌ Закрыть меню') {
//   await bot.sendMessage(msg.chat.id, 'Меню закрыто', {
//     reply_markup: {
//       remove_keyboard: true,
//     },
//   });
// } else if (msg.text == '⭐️ Картинка') {
//   await bot.sendPhoto(msg.chat.id, URL_TO_IMG);
// } else if (msg.text == '⭐️ Аудио') {
//   await bot.sendAudio(msg.chat.id, './audio.mp3', {
//     caption: '<b>⭐️ Аудио</b>',
//     parse_mode: 'HTML',
//   });
// } else if (msg.text == '⭐️ Контакт') {
//   //Скидываем контакт
//   await bot.sendContact(msg.chat.id, process.env.CONTACT, `Контакт`, {
//     reply_to_message_id: msg.message_id,
//   });
// }

bot.on('audio', async (audio) => {
  try {
    await bot.sendAudio(audio.chat.id, audio.audio.file_id, {
      caption: `Название файла: ${audio.audio.file_name}\nВес файла: ${audio.audio.file_size} байт\nДлительность аудио: ${audio.audio.duration} секунд`,
    });
  } catch (error) {
    console.log(error);
  }
});
