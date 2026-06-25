import Groq from 'groq-sdk';
import type { AIProvider } from './types';

const SYSTEM_PROMPT =
  'Eres el asistente virtual del CEE-FIIS (Centro de Extensión y Educación de la Facultad de ' +
  'Ingeniería Industrial y de Sistemas de la UNI). Respondes consultas sobre cursos disponibles, ' +
  'precios, inscripciones y pagos. Siempre responde en español, de forma amigable y concisa. ' +
  'Si no tienes información suficiente, deriva al usuario a secretaría.';

export class GroqProvider implements AIProvider {
  private client: Groq;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY es obligatorio para usar GroqProvider.');
    this.client = new Groq({ apiKey });
  }

  async chat(userMessage: string, context: string): Promise<string> {
    const userContent = context
      ? `Información actualizada de la base de datos del CEE:\n${context}\n\n---\nConsulta: ${userMessage}`
      : userMessage;

    const response = await this.client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
      max_tokens: 512,
      temperature: 0.4,
    });

    return (
      response.choices[0]?.message?.content ??
      'Lo siento, no pude generar una respuesta en este momento.'
    );
  }
}
