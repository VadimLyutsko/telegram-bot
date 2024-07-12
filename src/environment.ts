import z from 'zod';

const envSchema = z.object({
  BOT_TOKEN: z.string(),
  DATABASE_HOST: z.string().default('localhost'),
  DATABASE_PORT: z.string().default('3306'),
  DATABASE_USER: z.string().default('root'),
  DATABASE_PASSWORD: z.string().default('password'),
  DATABASE_NAME: z.string(),
  URL_TO_BOT: z.string(),
  URL_TO_IMG: z.string(),
});

export const envClientSchema = envSchema.parse(process.env);
