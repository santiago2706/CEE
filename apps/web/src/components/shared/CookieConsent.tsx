import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ROUTES } from '@/constants/routes';
import { useConsentStore } from '@/store/consentStore';
import { useLayoutStore } from '@/store/layoutStore';

/**
 * Banner de consentimiento de datos/cookies.
 *
 * - Aparece solo si el usuario aún no decidió (o si cambió `CONSENT_VERSION`).
 * - Registra la preferencia por categorías en `consentStore` (localStorage).
 * - Se sitúa por encima de los FAB (z-[10050] > CeciFab z-[10000]) y eleva los
 *   FAB en móvil mientras está visible, midiendo su altura real
 *   (`layoutStore.consentBannerHeight`) para no taparlos.
 * - Accesible: región etiquetada, foco gestionado, trampa de foco y teclado.
 */
export function CookieConsent() {
  const decided = useConsentStore((s) => s.decided);
  const acceptAll = useConsentStore((s) => s.acceptAll);
  const rejectAll = useConsentStore((s) => s.rejectAll);
  const setCategories = useConsentStore((s) => s.setCategories);
  const storedAnalytics = useConsentStore((s) => s.analytics);
  const storedMarketing = useConsentStore((s) => s.marketing);
  const setHasConsentBanner = useLayoutStore((s) => s.setHasConsentBanner);
  const setConsentBannerHeight = useLayoutStore((s) => s.setConsentBannerHeight);

  const [showSettings, setShowSettings] = useState(false);
  // Inicializar desde el store para no sobreescribir preferencias previas al reabrir.
  const [analytics, setAnalytics] = useState(storedAnalytics);
  const [marketing, setMarketing] = useState(storedMarketing);
  const bannerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const visible = !decided;

  // Sincronizar visibilidad y altura real del banner con el layout (para los FAB).
  useEffect(() => {
    if (!visible) {
      setHasConsentBanner(false);
      setConsentBannerHeight(0);
      return;
    }
    setHasConsentBanner(true);
    // Reflejar el último estado guardado al (re)abrir.
    setAnalytics(storedAnalytics);
    setMarketing(storedMarketing);

    const el = bannerRef.current;
    if (!el) return;
    const update = () => setConsentBannerHeight(el.offsetHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      observer.disconnect();
      setHasConsentBanner(false);
      setConsentBannerHeight(0);
    };
  }, [visible, storedAnalytics, storedMarketing, setHasConsentBanner, setConsentBannerHeight]);

  // Llevar el foco al banner cuando aparece, para usuarios de teclado/lectores.
  useEffect(() => {
    if (visible) headingRef.current?.focus();
  }, [visible]);

  if (!visible) return null;

  const handleSavePreferences = () => {
    setCategories({ analytics, marketing });
  };

  // Trampa de foco: mantener el tabulado dentro del banner mientras esté visible.
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab') return;
    const el = bannerRef.current;
    if (!el) return;
    const focusables = el.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      ref={bannerRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-consent-heading"
      onKeyDown={handleKeyDown}
      className="fixed inset-x-0 bottom-0 z-[10050] p-3 sm:p-4 lg:left-6 lg:right-auto lg:max-w-md"
    >
      <div className="rounded-xl border border-border bg-card p-4 shadow-2xl sm:p-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cee-red/10 text-cee-red">
            <Cookie className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2
              id="cookie-consent-heading"
              ref={headingRef}
              tabIndex={-1}
              className="text-sm font-bold text-foreground focus-visible:outline-none"
            >
              Tu privacidad nos importa
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Usamos cookies y datos para mejorar tu experiencia, atender tus consultas y enviarte
              información sobre nuestros programas. Puedes aceptarlas todas, rechazarlas o
              configurarlas. Más detalles en nuestra{' '}
              <Link
                to={ROUTES.PRIVACY}
                className="font-medium text-cee-red underline-offset-2 hover:underline"
              >
                Política de Privacidad
              </Link>{' '}
              y{' '}
              <Link
                to={ROUTES.COOKIES}
                className="font-medium text-cee-red underline-offset-2 hover:underline"
              >
                Política de Cookies
              </Link>
              .
            </p>
          </div>
        </div>

        {showSettings && (
          <div className="mt-4 grid gap-3 rounded-lg border border-border bg-muted/40 p-3">
            <div className="flex items-start gap-3">
              <Checkbox id="consent-necessary" checked disabled className="mt-0.5" />
              <Label htmlFor="consent-necessary" className="cursor-not-allowed">
                <span className="block text-sm font-semibold text-foreground">Necesarias</span>
                <span className="block text-xs font-normal text-muted-foreground">
                  Imprescindibles para el funcionamiento del sitio. Siempre activas.
                </span>
              </Label>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox
                id="consent-analytics"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="mt-0.5"
              />
              <Label htmlFor="consent-analytics" className="cursor-pointer">
                <span className="block text-sm font-semibold text-foreground">Analítica</span>
                <span className="block text-xs font-normal text-muted-foreground">
                  Nos ayudan a entender el uso del sitio para mejorarlo.
                </span>
              </Label>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox
                id="consent-marketing"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
                className="mt-0.5"
              />
              <Label htmlFor="consent-marketing" className="cursor-pointer">
                <span className="block text-sm font-semibold text-foreground">Marketing</span>
                <span className="block text-xs font-normal text-muted-foreground">
                  Permiten enviarte comunicaciones relevantes sobre programas.
                </span>
              </Label>
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          {showSettings ? (
            <Button type="button" className="h-11 flex-1" onClick={handleSavePreferences}>
              Guardar preferencias
            </Button>
          ) : (
            <Button type="button" className="h-11 flex-1" onClick={acceptAll}>
              Aceptar todas
            </Button>
          )}
          <Button type="button" variant="outline" className="h-11 flex-1" onClick={rejectAll}>
            Rechazar
          </Button>
          {!showSettings && (
            <Button
              type="button"
              variant="ghost"
              className="h-11 flex-1"
              onClick={() => setShowSettings(true)}
            >
              Configurar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
