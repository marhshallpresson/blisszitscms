// src/components/layout/MobileSidebar.tsx
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { AppSidebar } from './AppSidebar';
import { AppLogo } from './AppLogo';

export const MobileSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="md:hidden flex items-center justify-between p-2 border-b bg-card shadow-sm">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72 bg-card">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SheetDescription className="sr-only">
            Main navigation menu for the application.
          </SheetDescription>
          <AppSidebar onNavigate={() => setIsOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="flex-1 flex justify-center">
        <AppLogo iconSize={24} showName={true} />
      </div>
      {/* A spacer to balance the header */}
      <div className="w-10"></div>
    </header>
  );
};
