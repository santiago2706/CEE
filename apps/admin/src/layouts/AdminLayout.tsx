import { Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/toast';
import { Sidebar } from '@/components/layout/Sidebar';
import { NotificationBell } from '@/components/shared/NotificationBell';

export function AdminLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* ── Header con campana de notificaciones ── */}
        <header className="flex h-12 shrink-0 items-center justify-end gap-2 border-b border-gray-100 bg-white px-6">
          <NotificationBell />
        </header>
        <main className="flex-1 overflow-auto bg-[#f5f5f5] p-6">
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  );
}
