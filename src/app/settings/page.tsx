// src/app/settings/page.tsx
"use client";

import { ProfileDashboard } from "@/components/profile/ProfileDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SettingsPage() {
  const { user, isLoadingAuth, userProfile, isLoadingProfile } = useAuth();
  const router = useRouter();
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

  useEffect(() => {
    if (!isLoadingAuth && !isLoadingProfile) {
      setAuthCheckComplete(true);
      if (!user) {
        router.replace("/auth?mode=signin");
      } else {
        // User is authenticated, check profile and onboarding status
        if (!userProfile || !userProfile.onboardingCompleted) {
          if (!userProfile) {
            console.warn("SettingsPage: User is authenticated but profile is missing. Redirecting to onboarding.");
          }
          router.replace("/onboarding");
        }
        // If user exists, profile exists, and onboarding is completed, allow rendering ProfileDashboard
      }
    }
  }, [user, isLoadingAuth, userProfile, isLoadingProfile, router]);

  if (!authCheckComplete || isLoadingAuth || (isLoadingProfile && !userProfile)) { // Show loader if still loading auth or initial profile
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  if (!user) {
    // This case should ideally be caught by useEffect redirect, but good as a fallback
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <p className="text-destructive mb-4">Access Denied. Please sign in.</p>
        <Button asChild>
          <Link href="/auth?mode=signin">Go to Sign In</Link>
        </Button>
      </div>
    );
  }
  
  // If userProfile is loaded and onboarding is completed, render the dashboard
  // The redirect for incomplete onboarding is handled by useEffect
  if (userProfile && userProfile.onboardingCompleted) {
    return (
      <div className="p-4 md:p-8">
        <ProfileDashboard />
      </div>
    );
  }

  // Fallback loading state while useEffect determines the redirect for onboarding.
  // This state should be brief.
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Verifying profile status...</p>
    </div>
  );
}
