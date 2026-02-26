// src/app/app/layout.tsx
"use client";

import { ReactNode } from 'react';
import { DesktopSidebar } from '@/components/layout/DesktopSidebar';
import { MobileSidebar } from '@/components/layout/MobileSidebar';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <DesktopSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <MobileSidebar />
        <main className="flex-1 overflow-y-auto bg-secondary/50">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
