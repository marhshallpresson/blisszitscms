// src/components/ui/sidebar.tsx
"use client"

// NOTE: This component is a remnant of a previous, more complex UI.
// It is no longer in use and has been replaced by the more streamlined
// AppSidebar, DesktopSidebar, and MobileSidebar components in /src/components/layout.
// This file is kept for reference and can be safely removed in a future cleanup.

import * as React from "react"

function SidebarProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

const useSidebar = () => {
  console.warn("useSidebar is deprecated. Please use the new layout components.");
  return {};
};

export {
  SidebarProvider,
  useSidebar,
}

