import { GoogleGenAI } from '@google/genai';
import type { AIProvider } from './types';

const SYSTEM_PROMPT = `Eres el asistente virtual del CEE-FIIS (Centro de Extensión y Educación de la Facultad de Ingeniería Industrial y de Sistemas de la UNI). Respondes consultas sobre cursos disponibles, precios, inscripciones y pagos. Siempre responde en español, de forma amigable y concisa. Si no tienes información suficiente, deriva al usuario a secretaría.`;

export class GeminiProvider implements AIProvider {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY es obligatorio para usar GeminiProvider.');
    this.ai = new GoogleGenAI({ apiKey });
  }

  async chat(userMessage: string, context: string): Promise<string> {
    const contents = context
      ? `Información actualizada de la base de datos del CEE:\n${context}\n\n---\nConsulta del usuario: ${userMessage}`
      : userMessage;

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        maxOutputTokens: 512,
        temperature: 0.4,
      },
    });

    return response.text ?? 'Lo siento, no pude generar una respuesta en este momento.';
  }
}
