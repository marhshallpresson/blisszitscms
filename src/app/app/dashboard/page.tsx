// src/app/app/dashboard/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WelcomeDashboard } from "@/components/dashboard/WelcomeDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function AppDashboardPage() {
  const { user, userProfile, isLoadingAuth, isLoadingProfile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoadingAuth && !user) {
      router.replace('/auth?mode=signin');
    } else if (!isLoadingProfile && user && !userProfile?.onboardingCompleted) {
      router.replace('/onboarding');
    }
  }, [user, userProfile, isLoadingAuth, isLoadingProfile, router]);
  
  if (isLoadingAuth || isLoadingProfile || !user || !userProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full bg-background p-4" suppressHydrationWarning>
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="h-full" suppressHydrationWarning>
      <WelcomeDashboard
        isOnboardingCompleted={userProfile.onboardingCompleted}
      />
    </div>
  );
}
