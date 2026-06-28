import { useCallback, useEffect, useRef, useState } from 'react';
import { Bot, Send, User, Zap } from 'lucide-react';
import type { CourseCategory, CourseModality } from '@cee/types';
import { cn } from '@/lib/utils';
import { coursesService } from '@/services/coursesService';
import { salesRecordsService } from '@/services/salesRecordsService';
import { certificatesService } from '@/services/certificatesService';

// ─── Groq types ───────────────────────────────────────────────────────────────

interface GroqToolCall {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
}

interface GroqMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: GroqToolCall[];
  tool_call_id?: string;
}

interface GroqResponse {
  choices: Array<{
    message: GroqMessage;
    finish_reason: 'stop' | 'tool_calls' | 'length';
  }>;
}

// ─── Chat message (display only) ─────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ts: Date;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY as string | undefined;
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const timeFmt = new Intl.DateTimeFormat('es-PE', { hour: '2-digit', minute: '2-digit' });

const SYSTEM_PROMPT =
  `Eres el asistente administrativo del Centro de Especialización Ejecutiva (CEE-FIIS) \
de la Universidad Nacional de Ingeniería (UNI). Tu rol es ayudar al personal a gestionar \
cursos, inscripciones y certificados usando las herramientas disponibles.
Responde siempre en español. Sé conciso, profesional y amigable.
Cuando el usuario solicite una acción sobre el sistema, usa la herramienta apropiada.
Tras ejecutar una herramienta, confirma el resultado de forma clara.
Los cursos nuevos se crean en estado Borrador. Los precios son en soles peruanos (S/).`;

const WELCOME: Message = {
  id: 'welcome',
  role: 'assistant',
  content:
    '¡Hola! Soy el asistente administrativo del CEE-FIIS. ' +
    'Puedo gestionar cursos, inscripciones y certificados. ¿En qué puedo ayudarte hoy?',
  ts: new Date(),
};

const QUICK_ACTIONS = [
  '¿Qué cursos están disponibles?',
  'Ver inscripciones pendientes',
  'Registrar nueva inscripción',
  'Emitir certificado para un alumno',
];

const TOOL_LABELS: Record<string, string> = {
  create_course:     'Crear curso',
  register_sale:     'Registrar inscripción',
  issue_certificate: 'Emitir certificado',
  query_sales:       'Consultar inscripciones',
  query_courses:     'Consultar cursos',
};

// ─── Tool definitions ─────────────────────────────────────────────────────────

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'create_course',
      description: 'Crea un nuevo curso en el sistema del CEE (estado inicial: Borrador).',
      parameters: {
        type: 'object',
        properties: {
          title:         { type: 'string',  description: 'Título completo del curso' },
          category:      { type: 'string',  enum: ['Ingeniería', 'Gestión', 'Tecnología', 'Habilidades Blandas', 'Finanzas'] },
          modality:      { type: 'string',  enum: ['Virtual', 'Presencial', 'Híbrido'] },
          price:         { type: 'number',  description: 'Precio en soles (S/)' },
          description:   { type: 'string',  description: 'Descripción detallada del curso' },
          academicHours: { type: 'number',  description: 'Total de horas académicas (opcional)' },
        },
        required: ['title', 'category', 'modality', 'price', 'description'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'register_sale',
      description: 'Registra la inscripción de un alumno a un curso.',
      parameters: {
        type: 'object',
        properties: {
          studentName: { type: 'string', description: 'Nombre completo del alumno' },
          courseName:  { type: 'string', description: 'Nombre del curso' },
          amount:      { type: 'number', description: 'Monto pagado en soles (S/)' },
          notes:       { type: 'string', description: 'Notas adicionales (opcional)' },
        },
        required: ['studentName', 'courseName', 'amount'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'issue_certificate',
      description: 'Emite un certificado para un alumno (estado inicial: Borrador).',
      parameters: {
        type: 'object',
        properties: {
          studentName: { type: 'string', description: 'Nombre completo del alumno' },
          courseId:    { type: 'string', description: 'ID del curso (ej. c001) o nombre del curso' },
        },
        required: ['studentName', 'courseId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'query_sales',
      description: 'Consulta las inscripciones registradas con filtros opcionales.',
      parameters: {
        type: 'object',
        properties: {
          courseFilter: { type: 'string', description: 'Filtrar por nombre de curso (opcional)' },
          statusFilter: { type: 'string', enum: ['completed', 'pending', 'refunded'], description: 'Filtrar por estado (opcional)' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'query_courses',
      description: 'Obtiene la lista de todos los cursos del CEE.',
      parameters: { type: 'object', properties: {} },
    },
  },
];

// ─── Groq API call ────────────────────────────────────────────────────────────

async function callGroq(messages: GroqMessage[]): Promise<GroqResponse> {
  if (!GROQ_API_KEY) {
    throw new Error(
      'Clave de API no configurada. Agrega VITE_GROQ_API_KEY al archivo .env.local del panel admin.',
    );
  }
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({ model: GROQ_MODEL, messages, tools: TOOLS, tool_choice: 'auto', temperature: 0.3 }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Error Groq API ${res.status}: ${txt.slice(0, 200)}`);
  }
  return res.json() as Promise<GroqResponse>;
}

// ─── Tool executor ────────────────────────────────────────────────────────────

async function executeTool(name: string, args: Record<string, unknown>): Promise<string> {
  switch (name) {
    case 'create_course': {
      const { data } = await coursesService.createCourse({
        title:               args.title as string,
        description:         args.description as string,
        price:               Number(args.price),
        category:            args.category as CourseCategory,
        modality:            args.modality as CourseModality,
        moodleCourseId:      0,
        status:              'draft',
        syllabusFileName:    null,
        syllabusFile:        null,
        durationWeeks:       null,
        scheduleDescription: null,
        startDate:           null,
        maxStudents:         null,
        minStudents:         null,
        alertDaysBefore:     null,
      });
      return (
        `Curso creado: "${data.title}" | Categoría: ${data.category} | ` +
        `Modalidad: ${data.modality} | Precio: S/ ${data.price} | Estado: Borrador | ID: ${data.id}`
      );
    }

    case 'register_sale': {
      const { data: courseList } = await coursesService.getCourses();
      const matched = courseList.find((c) =>
        c.title.toLowerCase().includes((args.courseName as string).toLowerCase()),
      );
      const { data } = await salesRecordsService.createSale({
        studentName: args.studentName as string,
        courseId:    matched?.id ?? '',
        courseName:  matched?.title ?? (args.courseName as string),
        amount:      Number(args.amount),
        status:      'pending',
        notes:       (args.notes as string | null | undefined) ?? null,
      });
      return `Inscripción registrada: ${data.studentName} → "${data.courseName}" | Monto: S/ ${data.amount} | Estado: Pendiente`;
    }

    case 'issue_certificate': {
      const { data: courseList } = await coursesService.getCourses();
      const courseRef = args.courseId as string;
      const course =
        courseList.find((c) => c.id === courseRef) ??
        courseList.find((c) => c.title.toLowerCase().includes(courseRef.toLowerCase()));
      const { data } = await certificatesService.createCertificate({
        studentName: args.studentName as string,
        courseId:    course?.id ?? courseRef,
        courseName:  course?.title ?? courseRef,
        issuedAt:    new Date().toISOString().slice(0, 10),
      });
      return (
        `Certificado emitido: ${data.certificateNumber} | ` +
        `Alumno: ${data.studentName} | Curso: ${data.courseName} | Estado: Borrador`
      );
    }

    case 'query_sales': {
      const { data: sales } = await salesRecordsService.getSales();
      const cf = (args.courseFilter as string | undefined) ?? '';
      const sf = (args.statusFilter as string | undefined) ?? '';
      const filtered = sales.filter((s) => {
        const mc = !cf || s.courseName.toLowerCase().includes(cf.toLowerCase());
        const ms = !sf || s.status === sf;
        return mc && ms;
      });
      if (filtered.length === 0) return 'No se encontraron inscripciones con esos filtros.';
      const STATUS_LABEL: Record<string, string> = { completed: 'Completado', pending: 'Pendiente', refunded: 'Reembolsado' };
      const lines = filtered
        .slice(0, 8)
        .map((s) => `- ${s.studentName ?? '—'} → ${s.courseName} | ${STATUS_LABEL[s.status] ?? s.status} | S/ ${s.amount}`);
      return `${filtered.length} inscripción(es) encontrada(s):\n${lines.join('\n')}${filtered.length > 8 ? `\n… y ${filtered.length - 8} más.` : ''}`;
    }

    case 'query_courses': {
      const { data: courses } = await coursesService.getCourses();
      if (courses.length === 0) return 'No hay cursos registrados en el sistema.';
      const STATUS_LABEL: Record<string, string> = { published: 'Publicado', draft: 'Borrador', review: 'En Revisión' };
      const lines = courses.map(
        (c) => `- [${STATUS_LABEL[c.status] ?? c.status}] ${c.title} | ${c.modality} | S/ ${c.price} | ID: ${c.id}`,
      );
      return `${courses.length} curso(s):\n${lines.join('\n')}`;
    }

    default:
      return `Herramienta desconocida: ${name}`;
  }
}

// ─── UI components ────────────────────────────────────────────────────────────

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

function ToolRunning({ status }: { status: string }) {
  return (
    <div className="flex items-end gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#682222]">
        <Zap className="h-4 w-4 text-white" />
      </span>
      <div className="rounded-2xl rounded-bl-sm bg-amber-50 px-4 py-3 text-sm">
        <div className="flex items-center gap-2 text-amber-800">
          <span className="h-2 w-2 animate-ping rounded-full bg-amber-500" />
          <span className="font-medium">{status}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SecretariaChat() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [toolStatus, setToolStatus] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Persistent Groq conversation history (not display state — no re-render needed)
  const groqHistoryRef = useRef<GroqMessage[]>([
    { role: 'system', content: SYSTEM_PROMPT },
  ]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, toolStatus]);

  const send = useCallback(async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: msg, ts: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    if (!text) setInput('');
    setLoading(true);
    setToolStatus(null);

    // Append user turn to the persistent Groq history
    const history = groqHistoryRef.current;
    history.push({ role: 'user', content: msg });

    try {
      let continueLoop = true;

      while (continueLoop) {
        const response = await callGroq(history);
        const choice = response.choices[0];
        if (!choice) throw new Error('Respuesta inesperada de la API.');

        const assistantMsg = choice.message;
        history.push(assistantMsg);

        if (choice.finish_reason === 'tool_calls' && assistantMsg.tool_calls?.length) {
          // Execute each tool and push the result back to history
          for (const call of assistantMsg.tool_calls) {
            const label = TOOL_LABELS[call.function.name] ?? call.function.name;
            setToolStatus(`Ejecutando: ${label}…`);

            let result: string;
            try {
              const args = JSON.parse(call.function.arguments) as Record<string, unknown>;
              result = await executeTool(call.function.name, args);
            } catch (err) {
              result = `Error al ejecutar ${label}: ${err instanceof Error ? err.message : 'error desconocido'}`;
            }

            history.push({ role: 'tool', tool_call_id: call.id, content: result });
          }
          setToolStatus(null);
          // Loop: send tool results back so Groq generates the final text answer
        } else {
          // Final text answer
          continueLoop = false;
          const reply = assistantMsg.content ?? 'Acción completada.';
          setMessages((prev) => [
            ...prev,
            { id: crypto.randomUUID(), role: 'assistant', content: reply, ts: new Date() },
          ]);
        }
      }
    } catch (err) {
      // Remove the user message we just pushed to history if there's an error
      // so it doesn't corrupt future turns
      history.pop();
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `⚠️ ${err instanceof Error ? err.message : 'Error desconocido. Intenta de nuevo.'}`,
          ts: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
      setToolStatus(null);
    }
  }, [input, loading]);

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  const modelLabel = GROQ_MODEL.split('-').slice(0, 3).join('-');

  return (
    // CAMBIO 1: max-w-[800px] centrado, misma altura calculada
    <div
      className="mx-auto flex max-w-[800px] flex-col gap-3"
      style={{ height: 'calc(100vh - 3rem)' }}
    >
      {/* ── Header ── */}
      <div className="flex shrink-0 items-center gap-3 rounded-lg bg-[#682222] px-5 py-3.5 shadow-sm">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
          <Bot className="h-5 w-5 text-white" />
        </span>
        <div>
          <p className="text-sm font-semibold text-white">Asistente CEE-FIIS</p>
          <p className="text-[10px] text-white/60">Gestión de cursos, inscripciones y certificados</p>
        </div>
        <span className="ml-auto flex items-center gap-1.5 text-xs text-white/70">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          {modelLabel}
        </span>
      </div>

      {/* ── Área de mensajes con scroll interno ── */}
      <div className="flex-1 overflow-y-auto rounded-lg bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-4">
          {messages.map((msg) => <Bubble key={msg.id} msg={msg} />)}
          {loading && (toolStatus ? <ToolRunning status={toolStatus} /> : <TypingDots />)}
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

      {/* ── Input fijo al fondo ── */}
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
