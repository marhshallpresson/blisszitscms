// src/components/layout/DesktopSidebar.tsx
"use client";

import { AppSidebar } from "./AppSidebar";

export const DesktopSidebar = () => {
  return (
    <div className="hidden md:flex md:flex-shrink-0 h-screen w-72">
      <AppSidebar />
    </div>
  );
};
