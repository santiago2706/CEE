import { Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/toast';
import { Sidebar } from '@/components/layout/Sidebar';

export function AdminLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-[#f5f5f5] p-6">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}
