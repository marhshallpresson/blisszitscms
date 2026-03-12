// src/components/layout/DesktopSidebar.tsx
"use client";

import { AppSidebar } from "./AppSidebar";
import { cn } from "@/lib/utils";

interface DesktopSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void; // New prop for opening the sidebar
}

export const DesktopSidebar = ({ isOpen, onClose, onOpen }: DesktopSidebarProps) => {
  return (
    <div
      className={cn(
        "hidden md:flex md:flex-shrink-0 h-screen transition-all duration-200",
        isOpen ? "w-72" : "w-0 overflow-hidden"
      )}
    >
      {isOpen && <AppSidebar showDesktopCloseButton onCloseSidebar={onClose} />}
    </div>
  );
};
