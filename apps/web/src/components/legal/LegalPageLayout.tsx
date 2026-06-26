import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

export interface LegalTocItem {
  id: string;
  title: string;
}

interface LegalPageLayoutProps {
  title: string;
  /** Fecha de última actualización (placeholder hasta revisión legal). */
  lastUpdated: string;
  intro?: ReactNode;
  toc?: LegalTocItem[];
  children: ReactNode;
}

/**
 * Estructura común para las páginas legales (Privacidad, Términos, Cookies).
 * Incluye un aviso visible de "borrador pendiente de revisión legal", índice
 * navegable por anclas y un contenedor de contenido legible.
 */
export function LegalPageLayout({ title, lastUpdated, intro, toc, children }: LegalPageLayoutProps) {
  return (
    <section aria-labelledby="legal-page-title" className="bg-surface-cream py-12 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <header>
          <h1 id="legal-page-title" className="text-2xl font-bold text-foreground sm:text-3xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Última actualización: {lastUpdated}
          </p>
        </header>

        <div
          role="note"
          aria-label="Documento pendiente de revisión legal"
          className="mt-6 flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p className="text-sm leading-relaxed">
            <strong>Borrador pendiente de revisión legal.</strong> Este documento es una plantilla
            base y debe ser revisado y aprobado por el área legal antes de su publicación
            definitiva. Los campos entre corchetes (p. ej. [RAZÓN SOCIAL]) deben completarse.
          </p>
        </div>

        {intro && (
          <div className="mt-6 text-sm leading-relaxed text-muted-foreground">{intro}</div>
        )}

        {toc && toc.length > 0 && (
          <nav aria-label="Contenido" className="mt-8 rounded-lg border border-border bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Contenido
            </p>
            <ol className="mt-3 grid gap-2 text-sm">
              {toc.map((item, index) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="text-cee-red underline-offset-2 hover:underline"
                  >
                    {index + 1}. {item.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className="mt-10 space-y-10">{children}</div>
      </div>
    </section>
  );
}

interface LegalSectionProps {
  id: string;
  title: string;
  children: ReactNode;
}

export function LegalSection({ id, title, children }: LegalSectionProps) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-lg font-bold text-foreground sm:text-xl">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}
