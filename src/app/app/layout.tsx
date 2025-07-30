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
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-secondary/50">
          {children}
        </main>
      </div>
    </div>
  );
}
