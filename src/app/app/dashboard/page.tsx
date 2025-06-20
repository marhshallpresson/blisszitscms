// src/app/app/dashboard/page.tsx
"use client";

import { WelcomeDashboard } from "@/components/dashboard/WelcomeDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function AppDashboardPage() {
  const { userProfile, isLoadingProfile } = useAuth();
  
  // The main AppLayout handles the core auth/onboarding redirects.
  // We just need to handle the loading of the profile specific to this page's content.
  if (isLoadingProfile || !userProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <WelcomeDashboard
        isOnboardingCompleted={userProfile.onboardingCompleted}
      />
    </div>
  );
}
