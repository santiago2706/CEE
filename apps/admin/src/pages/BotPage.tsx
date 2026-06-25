import { MessageCircle } from 'lucide-react';

export default function BotPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-cee-red/10">
        <MessageCircle className="h-10 w-10 text-cee-red" />
      </div>
      <div>
        <h1 className="text-2xl font-bold">Bot WhatsApp</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          El panel de administración del bot está en construcción.
          El servidor bot ya está activo en <code className="rounded bg-muted px-1 py-0.5">apps/bot</code>.
        </p>
      </div>
    </div>
  );
}
