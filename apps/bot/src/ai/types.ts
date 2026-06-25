export interface AIProvider {
  /**
   * Envía un mensaje de usuario junto con contexto de la BD y retorna la respuesta del modelo.
   * @param userMessage  Texto recibido por WhatsApp
   * @param context      Datos de Supabase formateados como string
   */
  chat(userMessage: string, context: string): Promise<string>;
}
