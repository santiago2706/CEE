import { useState } from 'react';
import { useChatStore } from '@/store/chatStore';

const WHATSAPP_URL = 'https://wa.me/51966644502';

export function LeadCapture() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const markLeadCaptured = useChatStore((s) => s.markLeadCaptured);

  function handleSubmit() {
    if (!email.trim()) return;
    setSubmitted(true);
    markLeadCaptured();
    // En modo real, aquí se podría enviar a Supabase via Edge Function
  }

  if (submitted) {
    return (
      <div className="px-4 py-2">
        <div className="bg-[#F5F0ED] rounded-xl p-3 text-center text-sm">
          <span className="text-2xl">✅</span>
          <p className="mt-1 text-muted-foreground">
            ¡Gracias! Te enviaremos la información a <strong>{email}</strong>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-2">
      <div className="bg-[#F5F0ED] rounded-xl p-3 flex flex-col gap-2">
        <p className="text-xs text-muted-foreground">
          Déjame tu correo para enviarte el brochure completo:
        </p>
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            className="flex-1 bg-white rounded-lg px-3 py-1.5 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-cee-red/20"
          />
          <button
            onClick={handleSubmit}
            disabled={!email.trim()}
            className="px-3 py-1.5 text-xs font-medium bg-cee-red text-white rounded-lg hover:bg-cee-red-light disabled:opacity-40 transition-colors"
          >
            Enviar
          </button>
        </div>
        <button
          onClick={() => window.open(WHATSAPP_URL, '_blank')}
          className="text-xs text-[#25D366] hover:underline self-start"
        >
          O escríbenos por WhatsApp →
        </button>
      </div>
    </div>
  );
}
