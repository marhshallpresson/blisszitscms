// src/app/app/layout.tsx
"use client";

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Loader2 } from 'lucide-react';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, isLoadingAuth, userProfile, isLoadingProfile } = useAuth();
  const router = useRouter();
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

  useEffect(() => {
    if (!isLoadingAuth && !isLoadingProfile) {
      setAuthCheckComplete(true);
      if (!user) {
        router.replace('/auth?mode=signin');
      } else if (userProfile && !userProfile.onboardingCompleted) {
        router.replace('/onboarding');
      } else if (!userProfile && user && !isLoadingProfile) {
        // Edge case: user exists but profile doesn't (e.g., after failed onboarding step)
        console.warn("AppLayout: User authenticated but profile missing or incomplete. Redirecting to onboarding.");
        router.replace('/onboarding');
      }
    }
  }, [user, userProfile, isLoadingAuth, isLoadingProfile, router]);

  if (!authCheckComplete || isLoadingAuth || (isLoadingProfile && !userProfile && user)) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading your app...</p>
      </div>
    );
  }

  if (!user || (userProfile && !userProfile.onboardingCompleted) || (!userProfile && user)) {
    // This state should ideally be brief before redirection from useEffect takes place.
    // If userProfile is null even after loading, it means onboarding is needed or something is wrong.
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Verifying session and profile...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-secondary/50">
        {children}
      </main>
    </div>
  );
}
