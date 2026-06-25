/**
 * Ceci Chatbot — Edge Function (Supabase / Deno)
 * Motor LLM con tool calling usando Groq API.
 */

import { corsHeaders } from "../_shared/cors.ts";
import { SYSTEM_PROMPT, TOOL_DEFINITIONS } from "./prompt.ts";
import { executeTool } from "./tools.ts";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY")!;
const GROQ_BASE_URL = "https://api.groq.com/openai/v1";

interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  name?: string;
  tool_call_id?: string;
  tool_calls?: {
    id: string;
    type: "function";
    function: {
      name: string;
      arguments: string;
    };
  }[];
}

async function callGroq(
  messages: ChatMessage[],
  tools?: typeof TOOL_DEFINITIONS,
  toolChoice?: "auto" | "none",
) {
  const body: Record<string, unknown> = {
    model: "llama-3.1-70b-versatile",
    messages,
    max_tokens: 1024,
    temperature: 0.7,
  };

  if (tools) {
    body.tools = tools;
    body.tool_choice = toolChoice ?? "auto";
  }

  const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error ${response.status}: ${err}`);
  }

  return response.json();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const incomingMessages: { role: string; content: string }[] = body.messages ?? [];

    const messages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...incomingMessages.map((m) => ({
        role: m.role as ChatMessage["role"],
        content: m.content,
      })),
    ];

    // Llamada inicial al LLM con herramientas
    let completion = await callGroq(messages, TOOL_DEFINITIONS, "auto");
    let assistantMessage: ChatMessage = completion.choices[0].message;

    // Si el LLM decide llamar herramientas, las ejecutamos
    while (assistantMessage.tool_calls?.length) {
      // Agregar la respuesta del asistente al historial
      messages.push(assistantMessage);

      // Ejecutar cada tool call
      for (const tc of assistantMessage.tool_calls) {
        const fnName = tc.function.name;
        let fnArgs: Record<string, unknown> = {};
        try {
          fnArgs = JSON.parse(tc.function.arguments);
        } catch {
          fnArgs = {};
        }

        const toolResult = await executeTool(fnName, fnArgs);

        messages.push({
          role: "tool",
          tool_call_id: tc.id,
          name: fnName,
          content: JSON.stringify(toolResult),
        });
      }

      // Llamar al LLM de nuevo con los resultados de las herramientas
      completion = await callGroq(messages, TOOL_DEFINITIONS, "auto");
      assistantMessage = completion.choices[0].message;
    }

    const reply = assistantMessage.content ?? "Lo siento, no pude procesar tu consulta. ¿Podrías reformularla?";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return new Response(JSON.stringify({ reply: `Error: ${message}` }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
