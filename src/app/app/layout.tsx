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
      <div className="relative flex flex-1 flex-col overflow-hidden" suppressHydrationWarning>
        {!isDesktopSidebarOpen && (
          <div className="absolute left-3 top-3 z-20 hidden md:block lg:left-4 lg:top-4" suppressHydrationWarning>
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
          <div
            className="mx-auto w-full max-w-[1400px] px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8"
            suppressHydrationWarning
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
