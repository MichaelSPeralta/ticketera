import fs from 'fs-extra';
import path from 'path';

export interface Ticket {
  id: string;
  orgId: string;
  title: string;
  description: string;
  contactEmail: string;
  status: 'open' | 'in_progress' | 'pending_client' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  contextId?: string;
}

export interface ConversationContext {
  id: string;
  ticketId: string;
  messages: Array<{
    role: 'user' | 'agent' | 'system';
    content: string;
    timestamp: string;
  }>;
  metadata: Record<string, any>;
}

export interface Organization {
  id: string;
  name: string;
  apiKey: string;
}

export class Storage {
  private dataDir: string;

  constructor(dataDir?: string) {
    this.dataDir = dataDir || path.join(process.cwd(), 'data');
    fs.ensureDirSync(this.dataDir);
  }

  private getPath(collection: string) {
    return path.join(this.dataDir, `${collection}.json`);
  }

  private async read<T>(collection: string): Promise<T[]> {
    const filePath = this.getPath(collection);
    if (!fs.existsSync(filePath)) {
      return [];
    }
    return fs.readJSON(filePath);
  }

  private async write<T>(collection: string, data: T[]): Promise<void> {
    const filePath = this.getPath(collection);
    await fs.writeJSON(filePath, data, { spaces: 2 });
  }

  // Organizations
  async getOrganizations(): Promise<Organization[]> {
    return this.read<Organization>('organizations');
  }

  async createOrganization(org: Organization): Promise<void> {
    const orgs = await this.getOrganizations();
    orgs.push(org);
    await this.write('organizations', orgs);
  }

  // Tickets
  async getTickets(orgId?: string): Promise<Ticket[]> {
    const tickets = await this.read<Ticket>('tickets');
    if (orgId) {
      return tickets.filter(t => t.orgId === orgId);
    }
    return tickets;
  }

  async getTicket(id: string): Promise<Ticket | undefined> {
    const tickets = await this.getTickets();
    return tickets.find(t => t.id === id);
  }

  async createTicket(ticket: Ticket): Promise<void> {
    const tickets = await this.read<Ticket>('tickets');
    tickets.push(ticket);
    await this.write('tickets', tickets);
  }

  async updateTicket(id: string, updates: Partial<Ticket>): Promise<void> {
    const tickets = await this.read<Ticket>('tickets');
    const index = tickets.findIndex(t => t.id === id);
    if (index !== -1) {
      tickets[index] = { ...tickets[index], ...updates, updatedAt: new Date().toISOString() };
      await this.write('tickets', tickets);
    }
  }

  // Context
  async getContext(id: string): Promise<ConversationContext | undefined> {
    const contexts = await this.read<ConversationContext>('contexts');
    return contexts.find(c => c.id === id);
  }

  async saveContext(context: ConversationContext): Promise<void> {
    const contexts = await this.read<ConversationContext>('contexts');
    contexts.push(context);
    await this.write('contexts', contexts);
  }
}
