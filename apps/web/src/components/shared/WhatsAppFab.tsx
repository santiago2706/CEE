import type { CSSProperties } from "react";
import clsx from "clsx";
import { CONTACT_INFO } from "@/constants/contact.constants";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { useChatStore } from "@/store/chatStore";
import { useLayoutStore } from "@/store/layoutStore";

// Orden de apilamiento de elementos flotantes: MobileStickyCta (z-40) < WhatsAppFab (z-50) < CeciFab/ChatPanel (z-[10000]) < CookieConsent (z-[10050]).
export function WhatsAppFab() {
  const highlightWhatsApp = useChatStore((s) => s.highlightWhatsApp);
  const chatOpen = useChatStore((s) => s.isOpen);
  const hasBottomBar = useLayoutStore((s) => s.hasBottomBar);
  const hasConsentBanner = useLayoutStore((s) => s.hasConsentBanner);
  const consentBannerHeight = useLayoutStore((s) => s.consentBannerHeight);
  // Offset inferior en móvil: el banner de cookies (altura real) tiene prioridad,
  // luego la barra de CTA móvil; en desktop (lg) siempre vuelve a bottom-6.
  const mobileBottom = hasConsentBanner
    ? `${consentBannerHeight + 16}px`
    : hasBottomBar
      ? "6rem"
      : "1.5rem";

  return (
    <a
      href={CONTACT_INFO.whatsappUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="Escríbenos por WhatsApp"
      style={{ "--fab-bottom": mobileBottom } as CSSProperties}
      className={clsx(
        "fixed z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:scale-100",
        "bottom-[var(--fab-bottom)] lg:bottom-6",
        chatOpen ? "left-6" : "right-6",
        highlightWhatsApp && "animate-ceci-wa-pulse",
      )}
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
