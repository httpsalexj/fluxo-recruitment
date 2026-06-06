import type { Response } from 'express';

const clients = new Set<Response>();

export function registerRealtimeClient(res: Response) {
  clients.add(res);
  res.write(`event: connected\ndata: ${JSON.stringify({ ok: true })}\n\n`);

  const heartbeat = setInterval(() => {
    res.write(`event: ping\ndata: ${Date.now()}\n\n`);
  }, 25_000);

  return () => {
    clearInterval(heartbeat);
    clients.delete(res);
  };
}

export function broadcast(event: string, data: unknown) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of clients) client.write(payload);
}
