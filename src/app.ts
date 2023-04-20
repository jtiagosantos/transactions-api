import fastify from 'fastify';
import cookie from '@fastify/cookie';

import { transactionsRoutes } from './routes/transactions';
import { logs } from './logs';

export const app = fastify();

app.addHook('preHandler', logs);

app.register(cookie);
app.register(transactionsRoutes, {
  prefix: 'transactions',
});
