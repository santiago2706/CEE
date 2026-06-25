import { useEffect, useRef } from 'react';
import { useChatStore } from '@/store/chatStore';
import { chatbotService } from '@/services/chatbot.service';
import { ChatHeader } from './ChatHeader';
import { ChatMessageBubble } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { QuickActions } from './QuickActions';
import { TypingIndicator } from './TypingIndicator';
import { CeciFullBody } from './CeciAvatar';

export function ChatPanel() {
  const isOpen = useChatStore((s) => s.isOpen);
  const messages = useChatStore((s) => s.messages);
  const isTyping = useChatStore((s) => s.isTyping);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const showWelcome = messages.length === 0;

  return (
    <div className="fixed bottom-6 right-6 top-[80px] z-40 w-[360px] max-w-[calc(100vw-3rem)] flex flex-col rounded-[20px] border-[3px] border-[rgba(123,30,46,0.12)] bg-white shadow-clay-panel animate-ceci-panel-in chat-panel overflow-hidden"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <ChatHeader />

      {/* Messages area */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3.5 flex flex-col gap-2 bg-[#FDF6F0] custom-scrollbar">
        {showWelcome ? (
          <div className="flex flex-col items-center text-center px-3 py-1 animate-ceci-hero-in">
            {/* Ceci full body with wave */}
            <div className="w-[100px] h-[110px] sm:w-[130px] sm:h-[138px] mb-1">
              <CeciFullBody />
            </div>
            <h3 className="text-base font-extrabold text-[#7B1E2E] mt-0.5">¡Hola! Soy Ceci</h3>
            <p className="text-xs text-[#8a6a70] mt-0.5">Tu asistente virtual del CEE · FIIS-UNI</p>

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
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={chatbotService.sendMessage} disabled={isTyping} />
    </div>
  );
}
