import { create } from 'zustand';

interface LayoutState {
  /**
   * Indica que hay una barra de acción fija en el borde inferior (p. ej. el CTA
   * móvil de la landing del programa). Los FAB flotantes (WhatsApp / chatbot) la
   * leen para elevarse y no taparla en móvil.
   */
  hasBottomBar: boolean;
  setHasBottomBar: (value: boolean) => void;
  /**
   * Indica que el banner de consentimiento de cookies está visible en el borde
   * inferior. Los FAB flotantes (WhatsApp / chatbot) lo leen para elevarse y no
   * quedar tapados por el banner en móvil.
   */
  hasConsentBanner: boolean;
  setHasConsentBanner: (value: boolean) => void;
  /**
   * Altura real (px) que ocupa el banner de cookies en el borde inferior. Los
   * FAB la usan para elevarse exactamente lo necesario en móvil. 0 cuando no hay
   * banner visible.
   */
  consentBannerHeight: number;
  setConsentBannerHeight: (value: number) => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  hasBottomBar: false,
  setHasBottomBar: (value) => set({ hasBottomBar: value }),
  hasConsentBanner: false,
  setHasConsentBanner: (value) => set({ hasConsentBanner: value }),
  consentBannerHeight: 0,
  setConsentBannerHeight: (value) => set({ consentBannerHeight: value }),
}));
