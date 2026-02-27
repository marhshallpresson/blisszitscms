// src/app/app/layout.tsx
"use client";

import { ReactNode, useState } from 'react';
import { DesktopSidebar } from '@/components/layout/DesktopSidebar';
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

export default function AppLayout({ children }: { children: ReactNode }) {
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-background text-foreground" suppressHydrationWarning>
      <DesktopSidebar isOpen={isDesktopSidebarOpen} onClose={() => setIsDesktopSidebarOpen(false)} />
      <div className="flex flex-col flex-1 overflow-hidden relative" suppressHydrationWarning>
        {!isDesktopSidebarOpen && (
          <div className="hidden md:block absolute top-4 left-4 z-20" suppressHydrationWarning>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setIsDesktopSidebarOpen(true)}
              aria-label="Open side menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        )}
        <MobileSidebar />
        <main className="flex-1 overflow-y-auto bg-secondary/50">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 w-full" suppressHydrationWarning>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
