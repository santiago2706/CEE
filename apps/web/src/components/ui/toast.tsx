import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useToastStore, type ToastVariant } from '@/store/toastStore';
import { cn } from '@/lib/utils';

const variantStyles: Record<ToastVariant, string> = {
  success: 'border-green-600/30 bg-green-50 text-green-900',
  error: 'border-destructive/30 bg-red-50 text-red-900',
  info: 'border-border bg-card text-card-foreground',
};

const variantIcons: Record<ToastVariant, typeof Info> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2"
      role="region"
      aria-label="Notificaciones"
    >
      {toasts.map((item) => {
        const Icon = variantIcons[item.variant];
        return (
          <div
            key={item.id}
            role="status"
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-lg border p-4 shadow-lg',
              variantStyles[item.variant],
            )}
          >
            <Icon className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold">{item.title}</p>
              {item.description && <p className="mt-1 text-sm opacity-90">{item.description}</p>}
            </div>
            <button
              type="button"
              aria-label="Cerrar notificación"
              onClick={() => dismiss(item.id)}
              className="shrink-0 rounded-md p-1 opacity-60 transition hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
