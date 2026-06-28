import type { AIProvider } from './types';
import { GroqProvider } from './groq.provider';

export type { AIProvider };

export function createAIProvider(): AIProvider {
  const provider = (process.env.AI_PROVIDER ?? 'groq').toLowerCase().trim();

  if (provider === 'gemini') {
    throw new Error('GeminiProvider ya no está soportado. Usa AI_PROVIDER=groq.');
  }

  return new GroqProvider();
}
