import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { PageTransition } from '@/components/layout/PageTransition';
import { Toaster } from '@/components/ui/toast';
import { MemberPromo } from '@/components/shared/MemberPromo';
import { WhatsAppFab } from '@/components/shared/WhatsAppFab';
import { CookieConsent } from '@/components/shared/CookieConsent';
import { Chatbot } from '@/components/chatbot/Chatbot';

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <MemberPromo />
      <main className="flex-1">
        <PageTransition />
      </main>
      <Footer />
      <Toaster />
      <WhatsAppFab />
      <Chatbot />
      <CookieConsent />
    </div>
  );
}
