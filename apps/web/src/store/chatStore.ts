import { create } from 'zustand';
import type { ChatMessage, ChatContext } from '@/types/chatbot.types';

interface ChatState {
  isOpen: boolean;
  messages: ChatMessage[];
  isTyping: boolean;
  highlightWhatsApp: boolean;
  context: ChatContext;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setTyping: (typing: boolean) => void;
  incrementPriceQuery: () => void;
  markLeadCaptured: () => void;
  setLastCourseMentioned: (name: string) => void;
  triggerWhatsAppHighlight: () => void;
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export const useChatStore = create<ChatState>((set) => ({
  isOpen: false,
  messages: [],
  isTyping: false,
  highlightWhatsApp: false,
  context: {
    lastCourseMentioned: null,
    priceQueriesCount: 0,
    hasCapturedLead: false,
  },

  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false }),
  toggleChat: () => set((s) => ({ isOpen: !s.isOpen })),

  addMessage: (msg) =>
    set((s) => ({
      messages: [
        ...s.messages,
        { ...msg, id: uid(), timestamp: Date.now() },
      ],
    })),

  setTyping: (typing) => set({ isTyping: typing }),

  incrementPriceQuery: () =>
    set((s) => ({
      context: {
        ...s.context,
        priceQueriesCount: s.context.priceQueriesCount + 1,
      },
    })),

  markLeadCaptured: () =>
    set((s) => ({
      context: { ...s.context, hasCapturedLead: true, priceQueriesCount: 0 },
    })),

  setLastCourseMentioned: (name) =>
    set((s) => ({
      context: { ...s.context, lastCourseMentioned: name },
    })),

  triggerWhatsAppHighlight: () => {
    set({ highlightWhatsApp: true });
    setTimeout(() => set({ highlightWhatsApp: false }), 4000);
  },
}));
