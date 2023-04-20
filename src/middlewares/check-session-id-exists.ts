import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';

export const checkSessionIdExists = async (
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction,
) => {
  const sessionId = request.cookies.sessionId;

  if (!sessionId) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }

  done();
};
