import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  DATABASE_URL: z.string({
    required_error: 'DATABASE_URL is a required environment variable',
  }),
  PORT: z.number().default(3333),
});

export const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
  console.error('❌ Invalid environment variables!');
  _env.error.issues.forEach((error) => console.error(error));

  process.exit(1);
}

export const env = _env.data;
