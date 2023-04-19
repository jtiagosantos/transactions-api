import { randomUUID } from 'node:crypto';
import { z, ZodError } from 'zod';
import { knex } from '../lib/knex';
import type { FastifyInstance } from 'fastify';

export const transactionsRoutes = async (app: FastifyInstance) => {
  app.get('/', async () => {
    const transactions = await knex('transactions').select();

    return { transactions };
  });

  app.get('/:id', async (request, reply) => {
    try {
      const findOneTransactionRequestParamSchema = z.object({
        id: z
          .string({ required_error: 'id is a required request param' })
          .uuid({ message: 'id should be a uuid' }),
      });

      const { id } = findOneTransactionRequestParamSchema.parse(request.params);

      const transaction = await knex('transactions').where({ id }).first();

      return { transaction };
    } catch (error) {
      if (error instanceof ZodError) {
        return reply
          .status(400)
          .send({ error: error.errors.map((error) => error.message) });
      }
    }
  });

  app.get('/summary', async () => {
    const summary = await knex('transactions').sum('amount', { as: 'amount' }).first();

    return { summary };
  });

  app.post('/', async (request, reply) => {
    try {
      const createOneTransactionBodySchema = z.object({
        title: z.string({ required_error: 'title is a required field' }),
        amount: z.number({ required_error: 'amount is a required field' }),
        type: z.enum(['credit', 'debit'], { required_error: 'type is a required field' }),
      });

      const { title, amount, type } = createOneTransactionBodySchema.parse(request.body);

      await knex('transactions').insert({
        id: randomUUID(),
        title,
        amount: type === 'credit' ? amount : amount * -1,
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
