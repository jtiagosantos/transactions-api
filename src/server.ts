import fastify from 'fastify';
import { env } from './env';
import cookie from '@fastify/cookie';

import { transactionsRoutes } from './routes/transactions';
import { logs } from './logs';

const app = fastify();

app.addHook('preHandler', logs);

app.register(cookie);
app.register(transactionsRoutes, {
  prefix: 'transactions',
});

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('HTTP Server Running');
  });
