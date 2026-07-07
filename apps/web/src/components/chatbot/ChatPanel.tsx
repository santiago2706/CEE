import { useEffect, useRef, useCallback } from 'react';
import { useChatStore } from '@/store/chatStore';
import { chatbotService } from '@/services/chatbot.service';
import { ChatHeader } from './ChatHeader';
import { ChatMessageBubble } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { QuickActions } from './QuickActions';
import { TypingIndicator } from './TypingIndicator';
import { CeciFullBody } from './CeciAvatar';

function isNearBottom(el: HTMLElement): boolean {
  return el.scrollHeight - el.scrollTop - el.clientHeight < 120;
}

function isDesktop(): boolean {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

export function ChatPanel() {
  const isOpen = useChatStore((s) => s.isOpen);
  const messages = useChatStore((s) => s.messages);
  const isTyping = useChatStore((s) => s.isTyping);
  const closeChat = useChatStore((s) => s.closeChat);
  const msgContainerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Scroll inteligente: solo baja si el usuario ya está cerca del fondo
  useEffect(() => {
    const el = msgContainerRef.current;
    if (!el) return;
    if (isNearBottom(el) || messages.length <= 1) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, isTyping]);

  // Escape cierra el chat
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeChat();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, closeChat]);

  // Bloquear scroll de la página en móvil cuando el chat está abierto
  useEffect(() => {
    if (!isOpen) return;
    const isMobile = window.matchMedia('(max-width: 420px)').matches;
    if (!isMobile) return;

    document.documentElement.classList.add('cee-chat-abierto');
    return () => {
      document.documentElement.classList.remove('cee-chat-abierto');
    };
  }, [isOpen]);

  // Ajustar panel al teclado virtual en móvil
  const ajustarMovil = useCallback(() => {
    const panel = panelRef.current;
    if (!panel || !isDesktop()) return;
    const vv = window.visualViewport;
    if (!vv) return;

    const esMovil = window.matchMedia('(max-width: 420px)').matches;
    if (!esMovil || !isOpen) {
      panel.style.top = '';
      panel.style.bottom = '';
      panel.style.height = '';
      return;
    }
    panel.style.top = vv.offsetTop + 'px';
    panel.style.bottom = 'auto';
    panel.style.height = vv.height + 'px';
  }, [isOpen]);

  useEffect(() => {
    if (!window.visualViewport) return;
    window.visualViewport.addEventListener('resize', ajustarMovil);
    window.visualViewport.addEventListener('scroll', ajustarMovil);
    return () => {
      window.visualViewport?.removeEventListener('resize', ajustarMovil);
      window.visualViewport?.removeEventListener('scroll', ajustarMovil);
    };
  }, [ajustarMovil]);

  if (!isOpen) return null;

  const showWelcome = messages.length === 0;

  return (
    <div
      ref={panelRef}
      className="fixed bottom-6 right-6 top-[80px] z-40 w-[360px] max-w-[calc(100vw-3rem)] flex flex-col rounded-[20px] border-[1.5px] border-[#C9972C] bg-white shadow-holo-panel animate-ceci-panel-in chat-panel chat-panel-scan overflow-hidden"
      style={{ fontFamily: "'Exo 2', 'Inter', sans-serif" }}
    >
      <ChatHeader />

      <div ref={msgContainerRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 py-3.5 flex flex-col gap-2 bg-white custom-scrollbar">
        {showWelcome ? (
          <div className="flex flex-col items-center text-center px-3 py-1 animate-ceci-hero-in">
            <div className="w-[150px] h-[176px] mb-1">
              <CeciFullBody />
            </div>
            <h3 className="text-base font-extrabold text-[#7B1E2E] tracking-wide">¡Hola! Soy Ceci</h3>
            <p className="text-xs text-[#5b6b7c] mt-0.5 tracking-wide">Tu asistente del CEE · FIIS-UNI</p>

            <div className="mt-3" />
            <QuickActions />
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <ChatMessageBubble key={msg.id} message={msg} />
            ))}
            {isTyping && <TypingIndicator />}
          </>
        )}
      </div>

      <ChatInput onSend={chatbotService.sendMessage} disabled={isTyping} />
    </div>
  );
}
