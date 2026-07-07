import type { VercelRequest, VercelResponse } from '@vercel/node';
import { chatRateLimiter } from './_lib/rateLimiter';
import { chatWithData, type Message } from './_lib/chatService';
import { ApiError } from './_lib/errors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido.' });
    return;
  }

  if (!chatRateLimiter(req, res)) return;

  const { question, history } = req.body as { question?: string; history?: Message[] };

  if (!question?.trim()) {
    res.status(400).json({ error: `El campo "question" es requerido. Recibido: ${JSON.stringify(req.body)}` });
    return;
  }

  try {
    const answer = await chatWithData(question.trim(), history ?? []);
    res.status(200).json({ reply: answer });
  } catch (err) {
    console.error('[api/chat] Error al procesar consulta:', err);
    const code = err instanceof ApiError ? err.code : 'unknown_error';
    const message = err instanceof ApiError ? err.message : 'Error al procesar la consulta.';
    res.status(500).json({ error: message, code });
  }
}
