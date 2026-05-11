import Fastify from 'fastify';
import cors from '@fastify/cors';
import { Storage, Ticket, ConversationContext } from '@ticketera/storage';
import { z } from 'zod';
import { nanoid } from 'nanoid';

import path from 'path';

const fastify = Fastify({ logger: true });
const storage = new Storage(path.join(__dirname, '../../../data'));

fastify.register(cors, {
  origin: '*',
});

// Auth Middleware
fastify.addHook('preHandler', async (request, reply) => {
  const apiKey = request.headers['authorization'];
  if (!apiKey) {
    return;
  }
  
  const orgs = await storage.getOrganizations();
  const org = orgs.find(o => o.apiKey === apiKey);
  
  if (org) {
    (request as any).org = org;
  }
});

const TicketSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  contactEmail: z.string().email(),
  context: z.object({
    messages: z.array(z.object({
      role: z.enum(['user', 'agent', 'system']),
      content: z.string(),
      timestamp: z.string()
    })),
    metadata: z.record(z.any()).optional()
  }).optional()
});

// Endpoints
fastify.post('/tickets', async (request, reply) => {
  const org = (request as any).org;
  if (!org) {
    return reply.status(401).send({ error: 'Invalid API Key' });
  }

  const result = TicketSchema.safeParse(request.body);
  if (!result.success) {
    return reply.status(400).send({ error: result.error });
  }

  const { title, description, contactEmail, context } = result.data;
  const ticketId = nanoid();
  const contextId = context ? nanoid() : undefined;

  const ticket: Ticket = {
    id: ticketId,
    orgId: org.id,
    title,
    description,
    contactEmail,
    status: 'open',
    priority: 'medium',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    contextId
  };

  await storage.createTicket(ticket);

  if (context && contextId) {
    const conversationContext: ConversationContext = {
      id: contextId,
      ticketId,
      messages: context.messages,
      metadata: context.metadata || {}
    };
    await storage.saveContext(conversationContext);
  }

  return { success: true, ticketId };
});

fastify.get('/tickets', async (request, reply) => {
  const org = (request as any).org;
  if (!org) {
    return reply.status(401).send({ error: 'Invalid API Key' });
  }

  const tickets = await storage.getTickets(org.id);
  return { tickets };
});

fastify.get('/tickets/:id', async (request, reply) => {
  const org = (request as any).org;
  if (!org) {
    return reply.status(401).send({ error: 'Invalid API Key' });
  }

  const { id } = request.params as { id: string };
  const ticket = await storage.getTicket(id);

  if (!ticket || ticket.orgId !== org.id) {
    return reply.status(404).send({ error: 'Ticket not found' });
  }

  let context = null;
  if (ticket.contextId) {
    context = await storage.getContext(ticket.contextId);
  }

  return { ticket, context };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    console.log('Server is running on http://localhost:3001');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
