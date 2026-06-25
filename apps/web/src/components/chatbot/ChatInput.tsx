import { useState, useRef, useEffect, type KeyboardEvent } from 'react';

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: Props) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex gap-2 items-end px-3 py-2.5 border-t-[1.5px] border-[#e8d5d8] bg-white flex-shrink-0">
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Escribe tu pregunta..."
        disabled={disabled}
        className="flex-1 border-2 border-[#e8d5d8] rounded-[18px] px-3.5 py-2.5 text-sm text-[#2d1a1e] bg-[#FDF6F0] placeholder:text-[#8a6a70] focus:outline-none focus:border-[#7B1E2E] focus:bg-white focus:shadow-[0_0_0_3px_rgba(123,30,46,0.1)] transition-all disabled:opacity-50"
      />
      <button
        onClick={handleSend}
        disabled={disabled || !text.trim()}
        aria-label="Enviar"
        className="flex items-center justify-center h-10 w-10 rounded-full bg-[#7B1E2E] border-none cursor-pointer flex-shrink-0 shadow-[0_3px_0_#5a1520] hover:bg-[#9b2437] hover:-translate-y-0.5 hover:shadow-[0_5px_0_#5a1520] active:translate-y-0.5 active:shadow-[0_1px_0_#5a1520] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </div>
  );
}
