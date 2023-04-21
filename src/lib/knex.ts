import { knex as setupKnex, Knex } from 'knex';
import { env } from '../env';

export const config = {
  client: env.BATABASE_CLIENT,
  connection:
    env.BATABASE_CLIENT === 'sqlite'
      ? {
          filename: env.DATABASE_URL,
        }
      : env.DATABASE_URL,
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './database/migrations',
  },
} as Knex.Config;

export const knex = setupKnex(config);
