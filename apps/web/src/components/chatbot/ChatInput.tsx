import { useState, useRef, useEffect, type KeyboardEvent } from 'react';

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: Props) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      inputRef.current?.focus();
    }
  }, []);

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  return (
    <div className="flex gap-2 items-end px-3 py-2.5 border-t border-[#d9e6f2] bg-white flex-shrink-0">
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Escribe tu pregunta..."
        disabled={disabled}
        className="flex-1 border-[1.5px] border-[#d9e6f2] rounded-[18px] px-3.5 py-2.5 text-sm text-[#16222e] bg-[#f4f9fd] placeholder:text-[#5b6b7c] focus:outline-none focus:border-[#7B1E2E] focus:bg-white focus:shadow-[0_0_0_3px_rgba(123,30,46,0.15),0_0_12px_rgba(123,30,46,0.18)] transition-all disabled:opacity-50"
      />
      <button
        onClick={handleSend}
        disabled={disabled || !text.trim()}
        aria-label="Enviar"
        className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-[#8e2438] to-[#5a1520] border border-[rgba(92,212,255,0.3)] cursor-pointer flex-shrink-0 shadow-[0_3px_10px_rgba(90,21,32,0.35)] hover:from-[#9b2437] hover:to-[#6d1a29] hover:-translate-y-0.5 hover:shadow-[0_6px_14px_rgba(90,21,32,0.4),0_0_14px_rgba(56,189,248,0.45)] active:translate-y-0.5 active:shadow-[0_2px_6px_rgba(90,21,32,0.35)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </div>
  );
}
