import type { AIProvider } from './types';

// Placeholder: implementar cuando se añada @anthropic-ai/sdk al package.json
export class ClaudeProvider implements AIProvider {
  async chat(_userMessage: string, _context: string): Promise<string> {
    throw new Error(
      'ClaudeProvider aún no está implementado. Cambia AI_PROVIDER=gemini en el .env o añade @anthropic-ai/sdk.',
    );
  }
}
