import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { ChatMessage, CardCourse } from '@/types/chatbot.types';
import { mockCatalogo } from '@/mocks/data/chatbot.mock';
import { chatbotService } from '@/services/chatbot.service';

interface Props {
  message: ChatMessage;
}

function parseContent(text: string): ReactNode {
  const parts: ReactNode[] = [];
  let i = 0;
  let key = 0;

  function pushText(s: string) {
    if (s) parts.push(<span key={key++}>{s}</span>);
  }

  function pushJsx(el: ReactNode) {
    parts.push(el);
  }

  while (i < text.length) {
    if (text.slice(i).startsWith('**')) {
      const end = text.indexOf('**', i + 2);
      if (end !== -1) {
        pushJsx(<strong key={key++}>{parseContent(text.slice(i + 2, end))}</strong>);
        i = end + 2;
        continue;
      }
    }

    if (text[i] === '*' && text[i + 1] !== '*' && text[i - 1] !== '*') {
      const end = text.indexOf('*', i + 1);
      if (end !== -1) {
        pushJsx(<em key={key++}>{text.slice(i + 1, end)}</em>);
        i = end + 1;
        continue;
      }
    }

    if (text[i] === '[') {
      const close = text.indexOf(']', i + 1);
      const parenOpen = text.indexOf('(', close + 1);
      const parenClose = text.indexOf(')', parenOpen + 1);
      if (close !== -1 && parenOpen === close + 1 && parenClose !== -1) {
        pushJsx(
          <a key={key++} href={text.slice(parenOpen + 1, parenClose)} target="_blank" rel="noreferrer" className="text-[#C9972C] underline hover:text-[#a87f1d]">
            {text.slice(i + 1, close)}
          </a>,
        );
        i = parenClose + 1;
        continue;
      }
    }

    // [chip:texto](query) → chip inline clickeable
    if (text[i] === '[' && text.slice(i + 1, i + 6) === 'chip:') {
      const close = text.indexOf(']', i + 1);
      const parenOpen = text.indexOf('(', close + 1);
      const parenClose = text.indexOf(')', parenOpen + 1);
      if (close !== -1 && parenOpen === close + 1 && parenClose !== -1) {
        const chipText = text.slice(i + 6, close);
        const query = text.slice(parenOpen + 1, parenClose);
        pushJsx(
          <button
            key={key++}
            onClick={() => chatbotService.sendMessage(query)}
            className="inline-block mt-2 border-[1.5px] border-[#C9972C] text-[#C9972C] bg-white rounded-2xl px-3 py-1.5 text-xs font-semibold hover:bg-[#C9972C] hover:text-white transition-colors cursor-pointer"
          >
            {chipText}
          </button>,
        );
        i = parenClose + 1;
        continue;
      }
    }

    const waMatch = text.slice(i).match(/^\+51\s?\d{3}\s?\d{3}\s?\d{3}/);
    if (waMatch) {
      const num = waMatch[0].replace(/\s/g, '');
      pushJsx(<a key={key++} href={`https://wa.me/${num.replace('+', '')}`} target="_blank" rel="noreferrer" className="text-[#25D366] font-semibold underline hover:text-green-700">{waMatch[0]}</a>);
      i += waMatch[0].length;
      continue;
    }

    const emMatch = text.slice(i).match(/^[\w.-]+@[\w.-]+\.\w+/);
    if (emMatch) {
      pushJsx(<a key={key++} href={`mailto:${emMatch[0]}`} className="text-[#C9972C] underline hover:text-[#a87f1d]">{emMatch[0]}</a>);
      i += emMatch[0].length;
      continue;
    }

    const urlMatch = text.slice(i).match(/^https?:\/\/[^\s)]+/);
    if (urlMatch) {
      const url = urlMatch[0];
      pushJsx(<a key={key++} href={url} target="_blank" rel="noreferrer" className="text-[#C9972C] underline hover:text-[#a87f1d]">{url.length > 40 ? url.slice(0, 37) + '...' : url}</a>);
      i += url.length;
      continue;
    }

    pushText(text[i]);
    i++;
  }

  return parts;
}

/** Tarjetas de cursos en carrusel horizontal — sin imágenes, con acento de color */
function CourseCardCarousel({ courses }: { courses: CardCourse[] }) {
  const colors = ['#7B1E2E', '#C9972C', '#1a5276', '#1e8449', '#6c3483'];

  return (
    <div className="flex gap-2 overflow-x-auto mt-2.5 -mx-1 px-1 pb-1.5 scroll-snap-x scrollbar-none">
      {courses.map((c, i) => (
        <div
          key={c.id || i}
          className="flex-shrink-0 w-[150px] snap-start bg-white border-[1.5px] border-[#e8d5d8] rounded-[14px] flex flex-col overflow-hidden"
        >
          {/* Barra de color superior */}
          <div
            className="h-1.5 w-full flex-shrink-0"
            style={{ backgroundColor: colors[i % colors.length] }}
          />
          <div className="p-2.5 flex flex-col gap-1.5 flex-1">
            <span className="text-[12.5px] font-bold text-[#7B1E2E] leading-snug line-clamp-2">
              {c.name}
            </span>
            {c.price > 0 && (
              <span className="text-[13px] font-bold text-[#C9972C]">
                S/ {c.price.toFixed(2)}
              </span>
            )}
            {c.slug ? (
              <Link
                to={`/programas/${c.slug}`}
                className="mt-auto text-center text-[11.5px] font-semibold bg-[#7B1E2E] text-white py-1.5 rounded-[10px] hover:bg-[#9b2437] transition-colors"
              >
                Ver más
              </Link>
            ) : (
              <button
                onClick={() => chatbotService.sendMessage(`¿Qué cursos tienen de ${c.name}?`)}
                className="mt-auto text-center text-[11.5px] font-semibold bg-[#7B1E2E] text-white py-1.5 rounded-[10px] hover:bg-[#9b2437] transition-colors"
              >
                Ver cursos
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function detectCourseActions(text: string): { slug: string; name: string }[] {
  const lower = text.toLowerCase();
  const found = new Map<string, string>();
  for (const curso of mockCatalogo.cursos) {
    const slug = curso.slug;
    if (lower.includes(curso.nombre_curso.toLowerCase()) && !found.has(slug)) {
      found.set(slug, curso.nombre_curso);
    }
  }
  return Array.from(found.entries()).map(([slug, name]) => ({ slug, name }));
}

export function ChatMessageBubble({ message }: Props) {
  const isBot = message.role === 'bot';
  const lines = message.text.split('\n');

  // Tarjetas explícitas desde el motor mock
  const attachedCourses = message.actions
    ?.filter((a): a is { type: 'courses'; courses: CardCourse[] } => a.type === 'courses')
    .flatMap((a) => a.courses) ?? [];

  // Detección automática de cursos en el texto
  const detectedCourses = isBot ? detectCourseActions(message.text) : [];

  return (
    <div className={`flex items-end gap-1.5 ${isBot ? '' : 'flex-row-reverse'} animate-ceci-message-in`}>
      <div
        className={`max-w-[85%] px-3.5 py-2.5 text-[13.5px] leading-relaxed break-words ${
          isBot
            ? 'bg-white text-[#2d1a1e] rounded-[18px_18px_18px_4px] border-[1.5px] border-[#e8d5d8] shadow-clay-bubble'
            : 'bg-[#7B1E2E] text-white rounded-[18px_18px_4px_18px] shadow-[0_3px_0_#5a1520,0_4px_12px_rgba(123,30,46,0.2)]'
        }`}
      >
        <div className="chat-message-content">
          {lines.map((line, idx) => (
            <span key={idx}>
              {idx > 0 && <br />}
              {parseContent(line)}
            </span>
          ))}
        </div>

        {/* Tarjetas del catálogo — carrusel */}
        {attachedCourses.length > 0 && (
          <CourseCardCarousel courses={attachedCourses} />
        )}

        {/* Botones de curso detectados automáticamente */}
        {attachedCourses.length === 0 && detectedCourses.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2.5 border-t border-[#e8d5d8]/60">
            {detectedCourses.map((c) => (
              <Link
                key={c.slug}
                to={`/programas/${c.slug}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-[11.5px] font-semibold bg-[#7B1E2E] text-white rounded-[10px] hover:bg-[#9b2437] transition-colors"
              >
                Ver: {c.name.length > 35 ? c.name.slice(0, 32) + '...' : c.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
