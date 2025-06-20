// src/app/app/layout.tsx
"use client";

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { DesktopSidebar } from '@/components/layout/DesktopSidebar';
import { MobileSidebar } from '@/components/layout/MobileSidebar';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, userProfile, isLoadingAuth, isLoadingProfile } = useAuth();
  const router = useRouter();
  const isDataLoading = isLoadingAuth || isLoadingProfile;

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
