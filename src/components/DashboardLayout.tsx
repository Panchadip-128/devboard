import Sidebar from '@/components/Sidebar';
import { CommandPalette } from '@/components/CommandPalette';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <main className="ml-64 flex-1">
        {children}
      </main>
      <CommandPalette />
    </div>
  );
}
