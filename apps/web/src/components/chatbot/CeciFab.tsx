import clsx from 'clsx';
import { CeciCompact } from './CeciAvatar';
import { useChatStore } from '@/store/chatStore';

export function CeciFab() {
  const isOpen = useChatStore((s) => s.isOpen);
  const openChat = useChatStore((s) => s.openChat);

  if (isOpen) return null;

  return (
    <button
      onClick={openChat}
      aria-label="Abrir chat CEE"
      className={clsx(
        'fixed bottom-6 right-[88px] z-[10000] border-none cursor-pointer flex items-center gap-2.5 h-14 rounded-[28px]',
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
