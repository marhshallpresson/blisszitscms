// src/app/app/layout.tsx
"use client";

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppLogo } from '@/components/layout/AppLogo';
import { Loader2, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, userProfile, isLoadingAuth, isLoadingProfile } = useAuth();
  const router = useRouter();
  const isDataLoading = isLoadingAuth || isLoadingProfile;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isDataLoading) return;

    if (!user) {
      router.replace('/auth?mode=signin');
    } else if (user && !userProfile?.onboardingCompleted) {
      router.replace('/onboarding');
    }
  }, [user, userProfile, isDataLoading, router]);

  if (isDataLoading || !user || !userProfile?.onboardingCompleted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Verifying your session...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <AppSidebar />
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-2 border-b bg-card shadow-sm">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 bg-card">
              {/* By passing a function to AppSidebar, we can close the mobile menu on navigation */}
              <AppSidebar onNavigate={() => setMobileMenuOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="flex-1 flex justify-center">
            <AppLogo iconSize={24} showName={true} />
          </div>
           {/* A spacer to balance the header */}
          <div className="w-10"></div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-secondary/50">
          {children}
        </main>
      </div>
    </div>
  );
}
