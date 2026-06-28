import { chatWithData } from '../services/chatService';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function handleQuestion(question: string, history: Message[]): Promise<string> {
  return chatWithData(question, history);
}
