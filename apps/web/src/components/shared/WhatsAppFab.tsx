import { CONTACT_INFO } from '@/constants/contact.constants';
import { WhatsAppIcon } from '@/components/shared/WhatsAppIcon';
<<<<<<< HEAD
import { useChatStore } from '@/store/chatStore';
import clsx from 'clsx';

export function WhatsAppFab() {
  const highlightWhatsApp = useChatStore((s) => s.highlightWhatsApp);
  const chatOpen = useChatStore((s) => s.isOpen);

  return (
    <a
      href={CONTACT_INFO.whatsappUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="Escríbenos por WhatsApp"
<<<<<<< HEAD
      className={clsx(
        'fixed z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:scale-100',
        chatOpen ? 'bottom-6 left-6' : 'bottom-6 right-6',
        highlightWhatsApp && 'animate-ceci-wa-pulse',
=======
      className={cn(
        'fixed right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:scale-100',
        isHome ? 'bottom-20 lg:bottom-6' : 'bottom-6',
>>>>>>> 8456b59545f7d8fa0ae7dfd67d90763bd384ff9f
      )}
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
