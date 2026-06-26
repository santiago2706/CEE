import type { CSSProperties } from 'react';
import clsx from 'clsx';
import { CeciCompact } from './CeciAvatar';
import { useChatStore } from '@/store/chatStore';
import { useLayoutStore } from '@/store/layoutStore';

export function CeciFab() {
  const isOpen = useChatStore((s) => s.isOpen);
  const openChat = useChatStore((s) => s.openChat);
  const hasBottomBar = useLayoutStore((s) => s.hasBottomBar);
  const hasConsentBanner = useLayoutStore((s) => s.hasConsentBanner);
  const consentBannerHeight = useLayoutStore((s) => s.consentBannerHeight);
  // Offset inferior en móvil: el banner de cookies (altura real) tiene prioridad,
  // luego la barra de CTA móvil; en desktop (lg) siempre vuelve a bottom-6.
  const mobileBottom = hasConsentBanner
    ? `${consentBannerHeight + 16}px`
    : hasBottomBar
      ? '6rem'
      : '1.5rem';

  if (isOpen) return null;

  return (
    <button
      onClick={openChat}
      aria-label="Abrir chat CEE"
      style={{ '--fab-bottom': mobileBottom } as CSSProperties}
      className={clsx(
        'fixed right-[88px] z-[10000] border-none cursor-pointer flex items-center gap-2.5 h-14 rounded-[28px]',
        // Elevar sobre la barra de CTA móvil / banner de cookies cuando exista; en desktop siempre bottom-6.
        'bottom-[var(--fab-bottom)] lg:bottom-6',
        'bg-[#7B1E2E] hover:scale-[1.03] pl-2 pr-5 py-1',
        'animate-ceci-fab-entry shadow-clay-fab transition-all duration-300',
      )}
    >
      <span className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#5a1520]">
        <CeciCompact />
      </span>
      <span className="flex flex-col items-start text-white text-left leading-tight">
        <span className="text-[13px] font-bold">Asesor Virtual CEE</span>
        <span className="text-[10px] opacity-80">¿En qué te ayudo?</span>
      </span>
    </button>
  );
}
