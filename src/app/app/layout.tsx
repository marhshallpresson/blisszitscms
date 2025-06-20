// src/app/app/layout.tsx
"use client";

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Loader2 } from 'lucide-react';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, userProfile, isLoadingAuth, isLoadingProfile } = useAuth();
  const router = useRouter();
  const isDataLoading = isLoadingAuth || isLoadingProfile;

  useEffect(() => {
    // Don't do anything while data is loading to prevent premature redirects
    if (isDataLoading) return;

    // Once loading is complete, check conditions and redirect if necessary
    if (!user) {
      router.replace('/auth?mode=signin');
    } else if (!userProfile?.onboardingCompleted) {
      // This handles both new users and existing users who haven't completed onboarding
      router.replace('/onboarding');
    }
  }, [user, userProfile, isDataLoading, router]);

  // Show a loader screen while authentication and profile data are being fetched.
  // This also acts as a loading screen during the redirection process.
  if (isDataLoading || !user || !userProfile?.onboardingCompleted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Verifying your session...</p>
      </div>
    );
  }

  // If loading is complete and all checks pass, render the app layout
  return (
    <div className="flex h-screen bg-background text-foreground">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-secondary/50">
        {children}
      </main>
    </div>
  );
}
