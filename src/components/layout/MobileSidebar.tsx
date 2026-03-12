// src/components/layout/MobileSidebar.tsx
"use client";

import { Sheet, SheetContent } from '@/components/ui/sheet';
import { AppSidebar } from './AppSidebar';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSidebar = ({ isOpen, onClose }: MobileSidebarProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="p-0 w-72 bg-card">
        <AppSidebar onNavigate={onClose} />
      </SheetContent>
    </Sheet>
  );
};
