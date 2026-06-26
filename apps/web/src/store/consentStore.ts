import { create } from 'zustand';

/**
 * Versión del modelo de consentimiento. Incrementar cuando cambien las
 * políticas/categorías para volver a solicitar el consentimiento al usuario.
 */
export const CONSENT_VERSION = 1;

const STORAGE_KEY = 'cee_cookie_consent';

interface StoredConsent {
  version: number;
  timestamp: string;
  analytics: boolean;
  marketing: boolean;
}

interface ConsentState {
  /** `false` mientras el usuario no haya decidido (o la versión sea obsoleta). */
  decided: boolean;
  /** Categoría siempre activa; el sitio no funciona sin ella. */
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  setCategories: (categories: { analytics: boolean; marketing: boolean }) => void;
  /** Reabre el banner (p. ej. desde "Preferencias de cookies" en el footer). */
  reopen: () => void;
}

function readStored(): StoredConsent | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConsent;
    // Si la versión guardada no coincide, tratamos como "no decidido".
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function persist(analytics: boolean, marketing: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: StoredConsent = {
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
      analytics,
      marketing,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // localStorage no disponible (modo privado, cuota, etc.): el consentimiento
    // vivirá solo en memoria durante la sesión.
  }
}

const stored = readStored();

export const useConsentStore = create<ConsentState>((set) => ({
  decided: stored !== null,
  necessary: true,
  analytics: stored?.analytics ?? false,
  marketing: stored?.marketing ?? false,
  acceptAll: () => {
    persist(true, true);
    set({ decided: true, analytics: true, marketing: true });
  },
  rejectAll: () => {
    persist(false, false);
    set({ decided: true, analytics: false, marketing: false });
  },
  setCategories: ({ analytics, marketing }) => {
    persist(analytics, marketing);
    set({ decided: true, analytics, marketing });
  },
  reopen: () => set({ decided: false }),
}));
