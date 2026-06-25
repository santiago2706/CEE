import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import { handleMessage } from './handlers/message';
import { createAIProvider } from './ai';

const app = express();
app.use(express.json());

// CORS — permite que el panel admin llame a /api/chat desde localhost
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
app.options('*', (_req: Request, res: Response) => {
  res.sendStatus(204);
});

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PORT = process.env.PORT ?? 3000;

if (!VERIFY_TOKEN) {
  console.error('VERIFY_TOKEN no está definido en las variables de entorno.');
  process.exit(1);
}

// Verificación del webhook de Meta (desafío GET)
app.get('/webhook', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verificado por Meta.');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Recepción de mensajes (POST)
app.post('/webhook', (req: Request, res: Response) => {
  // Responder 200 inmediatamente para que Meta no reintente
  res.sendStatus(200);

  const body = req.body as WhatsAppWebhookBody;

  if (body.object !== 'whatsapp_business_account') return;

  const messages = body.entry?.[0]?.changes?.[0]?.value?.messages;
  if (!messages?.length) return;

  const message = messages[0];

  // Solo procesar mensajes de texto por ahora
  if (message.type !== 'text' || !message.text?.body) return;

  const from = message.from;
  const text = message.text.body;

  console.log(`Mensaje recibido de ${from}: "${text}"`);

  handleMessage(from, text).catch((err) => {
    console.error(`Error al procesar mensaje de ${from}:`, err);
  });
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'CEE Bot' });
});

// Endpoint REST para el Asistente CEE del panel admin
let _chatProvider: ReturnType<typeof createAIProvider> | null = null;
function getChatProvider(): ReturnType<typeof createAIProvider> {
  if (!_chatProvider) _chatProvider = createAIProvider();
  return _chatProvider;
}

app.post('/api/chat', (req: Request, res: Response) => {
  const { message } = req.body as { message?: string };

  if (!message?.trim()) {
    res.status(400).json({ error: 'El campo "message" es requerido.' });
    return;
  }

  let provider: ReturnType<typeof createAIProvider>;
  try {
    provider = getChatProvider();
  } catch (err) {
    console.error('[api/chat] Error al inicializar provider:', err);
    res.status(500).json({ error: 'Proveedor AI no configurado correctamente.' });
    return;
  }

  provider
    .chat(message.trim(), '')
    .then((reply) => {
      res.json({ reply });
    })
    .catch((err: unknown) => {
      console.error('[api/chat] Error al procesar mensaje:', err);
      res.status(500).json({ error: 'Error al procesar la consulta.' });
    });
});

app.listen(PORT, () => {
  console.log(`Bot CEE corriendo en el puerto ${PORT}`);
});

// ---------- Tipos del payload de Meta ----------

interface WhatsAppTextMessage {
  from: string;
  id: string;
  timestamp: string;
  type: 'text';
  text: { body: string };
}

interface WhatsAppWebhookBody {
  object: string;
  entry?: {
    changes?: {
      value?: {
        messages?: WhatsAppTextMessage[];
      };
    }[];
  }[];
}
