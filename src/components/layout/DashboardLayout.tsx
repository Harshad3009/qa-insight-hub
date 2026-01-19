import { SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { GlobalDateFilter } from './GlobalDateFilter';
import { GlobalUploadButton } from './GlobalUploadButton';
import {RealTimeListener} from "@/components/layout/RealTimeListener.tsx";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <main className="flex-1 flex flex-col">
        <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-card/30 backdrop-blur-sm sticky top-0 z-10">
          <SidebarTrigger />
          <div className="flex items-center gap-3">
            <RealTimeListener />
            <GlobalUploadButton />
            <GlobalDateFilter />
            <ThemeToggle />
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
