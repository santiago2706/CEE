import { CONTACT_INFO } from '@/constants/contact.constants';
import { WhatsAppIcon } from '@/components/shared/WhatsAppIcon';

export function WhatsAppFab() {
  return (
    <a
      href={CONTACT_INFO.whatsappUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:scale-100"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
