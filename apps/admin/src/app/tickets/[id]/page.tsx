'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import Link from 'next/link';

interface Message {
  role: string;
  content: string;
  timestamp: string;
}

interface TicketDetail {
  ticket: {
    id: string;
    title: string;
    description: string;
    contactEmail: string;
    status: string;
    priority: string;
    createdAt: string;
  };
  context: {
    messages: Message[];
    metadata: any;
  } | null;
}

export default function TicketPage() {
  const { id } = useParams();
  const [data, setData] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchTicket();
  }, [id]);

  async function fetchTicket() {
    try {
      const res = await fetch(`http://localhost:3001/tickets/${id}`, {
        headers: {
          'Authorization': 'test_api_key_123'
        }
      });
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Error fetching ticket:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-8 text-center">Cargando...</div>;
  if (!data) return <div className="p-8 text-center">Ticket no encontrado</div>;

  const { ticket, context } = data;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/" className="text-sm text-primary hover:underline">← Volver al Dashboard</Link>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-2xl">{ticket.title}</CardTitle>
              <CardDescription>Reportado por {ticket.contactEmail}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="default">{ticket.status}</Badge>
              <Badge variant="outline">{ticket.priority}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert">
              <p className="whitespace-pre-wrap text-muted-foreground">{ticket.description}</p>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              ID: {ticket.id} • Creado el {new Date(ticket.createdAt).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        {context && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contexto de la Conversación</CardTitle>
              <CardDescription>Historial del agente AI previo al ticket.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {context.messages.map((msg, idx) => (
                  <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                      msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : msg.role === 'agent'
                          ? 'bg-muted'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      <div className="font-semibold text-[10px] uppercase mb-1 opacity-70">
                        {msg.role}
                      </div>
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
              
              {context.metadata && (
                <div className="mt-6 pt-6 border-t border-dashed">
                  <h4 className="text-sm font-semibold mb-2">Metadatos de sesión</h4>
                  <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                    {JSON.stringify(context.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
