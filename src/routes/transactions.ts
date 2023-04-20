import { randomUUID } from 'node:crypto';
import { z, ZodError } from 'zod';
import { knex } from '../lib/knex';
import type { FastifyInstance } from 'fastify';
import { checkSessionIdExists } from '../middlewares/check-session-id-exists';

export const transactionsRoutes = async (app: FastifyInstance) => {
  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies;

      const transactions = await knex('transactions')
        .where('session_id', '=', sessionId)
        .select();

      return { transactions };
    },
  );

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      try {
        const { sessionId } = request.cookies;

        const findOneTransactionRequestParamSchema = z.object({
          id: z
            .string({ required_error: 'id is a required request param' })
            .uuid({ message: 'id should be a uuid' }),
        });

        const { id } = findOneTransactionRequestParamSchema.parse(request.params);

        const transaction = await knex('transactions')
          .where({ id, session_id: sessionId })
          .first();

        return { transaction };
      } catch (error) {
        if (error instanceof ZodError) {
          return reply
            .status(400)
            .send({ error: error.errors.map((error) => error.message) });
        }
      }
    },
  );

  app.get(
    '/summary',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies;

      const summary = await knex('transactions')
        .where({ session_id: sessionId })
        .sum('amount', { as: 'amount' })
        .first();

      return { summary };
    },
  );

  app.post('/', async (request, reply) => {
    try {
      const createOneTransactionBodySchema = z.object({
        title: z.string({ required_error: 'title is a required field' }),
        amount: z.number({ required_error: 'amount is a required field' }),
        type: z.enum(['credit', 'debit'], { required_error: 'type is a required field' }),
      });

      const { title, amount, type } = createOneTransactionBodySchema.parse(request.body);

      let sessionId = request.cookies.sessionId;

      if (!sessionId) {
        sessionId = randomUUID();

        reply.cookie('sessionId', sessionId, {
          path: '/',
          maxAge: 1000 * 60 * 60 * 24 * 7, //7 days
        });
      }

      await knex('transactions').insert({
        id: randomUUID(),
        title,
        amount: type === 'credit' ? amount : amount * -1,
        session_id: sessionId,
      });

      return reply.status(201).send();
    } catch (error) {
      if (error instanceof ZodError) {
        return reply
          .status(400)
          .send({ error: error.errors.map((error) => error.message) });
      }
    }
  });
};
