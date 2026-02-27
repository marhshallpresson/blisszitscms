// src/app/app/analytics/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function AppAnalyticsPage() {
  const { user, userProfile, isLoadingAuth, isLoadingProfile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoadingAuth && !user) {
      router.replace('/auth?mode=signin');
    } else if (!isLoadingProfile && user && !userProfile?.onboardingCompleted) {
      router.replace('/onboarding');
    }
  }, [user, userProfile, isLoadingAuth, isLoadingProfile, router]);
  
  if (isLoadingAuth || isLoadingProfile || !user || !userProfile?.onboardingCompleted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <AnalyticsDashboard />
    </div>
  );
}
