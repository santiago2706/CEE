import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Send, User } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── types ──────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ts: Date;
}

// ─── constants ───────────────────────────────────────────────────────────────

const timeFmt = new Intl.DateTimeFormat('es-PE', { hour: '2-digit', minute: '2-digit' });

const BOT_URL = (import.meta.env.VITE_BOT_URL as string | undefined) ?? 'http://localhost:3000';

const QUICK_ACTIONS = [
  '¿Qué cursos hay disponibles?',
  '¿Cuáles son los precios?',
  '¿Cómo me inscribo?',
  'Ver certificaciones',
];

const WELCOME: Message = {
  id: 'welcome',
  role: 'assistant',
  content: '¡Hola! Soy el asistente del CEE-FIIS. ¿En qué puedo ayudarte hoy?',
  ts: new Date(),
};

// ─── burbujas — tamaño cómodo ────────────────────────────────────────────────

function Bubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  return (
    <div className={cn('flex items-end gap-2.5', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <span
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-gray-200' : 'bg-[#682222]',
        )}
      >
        {isUser
          ? <User className="h-4 w-4 text-gray-600" />
          : <Bot className="h-4 w-4 text-white" />}
      </span>
      <div
        className={cn(
          'max-w-[72%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'rounded-br-sm bg-[#682222] text-white'
            : 'rounded-bl-sm bg-gray-100 text-gray-900',
        )}
      >
        <p className="whitespace-pre-wrap">{msg.content}</p>
        <p className={cn('mt-1 text-[10px]', isUser ? 'text-right text-white/60' : 'text-gray-400')}>
          {timeFmt.format(msg.ts)}
        </p>
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-end gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#682222]">
        <Bot className="h-4 w-4 text-white" />
      </span>
      <div className="rounded-2xl rounded-bl-sm bg-gray-100 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

// ─── página principal ────────────────────────────────────────────────────────

export default function SecretariaChat() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = useCallback(async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: msg, ts: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    if (!text) setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${BOT_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { reply: string };
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content: data.reply, ts: new Date() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'No pude conectarme al servidor. Verifica que el servicio esté activo e inténtalo de nuevo.',
          ts: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  return (
    // Sin max-width — ocupa todo el espacio disponible
    // Altura: viewport menos p-6 del main (1.5rem top + 1.5rem bottom = 3rem)
    <div className="flex flex-col gap-3" style={{ height: 'calc(100vh - 3rem)' }}>

      {/* ── Header — solo ícono + nombre + estado ── */}
      <div className="flex shrink-0 items-center gap-3 rounded-lg bg-[#682222] px-5 py-3.5 shadow-sm">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
          <Bot className="h-5 w-5 text-white" />
        </span>
        <p className="text-sm font-semibold text-white">Asistente CEE-FIIS</p>
        <span className="ml-auto flex items-center gap-1.5 text-xs text-white/80">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          En línea
        </span>
      </div>

      {/* ── Área de mensajes ── */}
      <div className="flex-1 overflow-y-auto rounded-lg bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-4">
          {messages.map((msg) => <Bubble key={msg.id} msg={msg} />)}
          {loading && <TypingDots />}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Quick actions ── */}
      <div className="flex shrink-0 flex-wrap gap-2 px-1">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action}
            type="button"
            disabled={loading}
            onClick={() => void send(action)}
            className="rounded-full border border-[#682222]/30 bg-white px-3.5 py-1 text-xs font-medium text-[#682222] transition-colors duration-200 hover:bg-[#682222] hover:text-white disabled:opacity-40"
          >
            {action}
          </button>
        ))}
      </div>

      {/* ── Input — mínimo 52 px de altura ── */}
      <div
        className="flex shrink-0 items-end gap-3 rounded-lg bg-white px-3 py-3 shadow-sm"
        style={{ borderBottom: '3px solid #682222' }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          rows={2}
          placeholder="Escribe tu consulta... (Enter para enviar, Shift+Enter para nueva línea)"
          disabled={loading}
          className="min-h-[52px] flex-1 resize-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-[#682222] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#682222]/40 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={() => void send()}
          disabled={!input.trim() || loading}
          aria-label="Enviar mensaje"
          className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-lg bg-[#682222] text-white transition-colors hover:bg-[#4F1A1A] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
