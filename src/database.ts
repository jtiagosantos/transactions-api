import { knex as setupKnex, Knex } from 'knex';

export const config = {
  client: 'sqlite',
  connection: {
    filename: './database/app.db',
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './database/migrations',
  },
} as Knex.Config;

export const knex = setupKnex(config);
