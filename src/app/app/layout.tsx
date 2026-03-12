// src/app/app/layout.tsx
"use client";

import { ReactNode, useState } from 'react';
import { DesktopSidebar } from '@/components/layout/DesktopSidebar';
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';
import { AppHeader } from '@/components/layout/AppHeader'; // Import AppHeader

export default function AppLayout({ children }: { children: ReactNode }) {
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false); // New state for mobile sidebar

  return (
    <WorkspaceProvider>
      <div className="flex h-screen bg-background text-foreground">
        <DesktopSidebar
          isOpen={isDesktopSidebarOpen}
          onClose={() => setIsDesktopSidebarOpen(false)}
          onOpen={() => setIsDesktopSidebarOpen(true)} // Pass onOpen prop
        />
        <div className="relative flex flex-1 flex-col overflow-hidden">
          <AppHeader
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
            onToggleDesktopSidebar={() => setIsDesktopSidebarOpen(prev => !prev)}
            isDesktopSidebarOpen={isDesktopSidebarOpen}
          />
          <MobileSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
          <main className="flex-1 overflow-y-auto bg-secondary/50">
            <div
              className="mx-auto w-full max-w-[1400px] px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8"
            >
              {children}
            </div>
          </main>
        </div>
      </div>
    </WorkspaceProvider>
  );
}
