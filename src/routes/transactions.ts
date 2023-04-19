import { randomUUID } from 'node:crypto';
import { z, ZodError } from 'zod';
import { knex } from '../lib/knex';
import type { FastifyInstance } from 'fastify';

export const transactionsRoutes = async (app: FastifyInstance) => {
  app.post('/', async (request, reply) => {
    try {
      const createTransactionBodySchema = z.object({
        title: z.string({ required_error: 'title is a required field' }),
        amount: z.number({ required_error: 'amount is a required field' }),
        type: z.enum(['credit', 'debit'], { required_error: 'type is a required field' }),
      });

      const { title, amount, type } = createTransactionBodySchema.parse(request.body);

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
