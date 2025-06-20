
// src/app/(app)/settings/page.tsx -> src/app/app/settings/page.tsx
"use client";

import { ProfileDashboard } from "@/components/profile/ProfileDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AppSettingsPage() {
  const { user, isLoadingAuth, userProfile, isLoadingProfile } = useAuth();
  const router = useRouter();
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

  useEffect(() => {
    if (!isLoadingAuth && !isLoadingProfile) {
      setAuthCheckComplete(true);
      if (!user) {
        router.replace("/auth?mode=signin");
      } else if (userProfile && !userProfile.onboardingCompleted) {
         router.replace("/onboarding");
      } else if (!userProfile && user && !isLoadingProfile) { 
        // This case handles if a user is authenticated but somehow profile creation failed
        // or if there's a race condition. Send to onboarding to attempt profile creation.
        console.warn("AppSettingsPage: User is authenticated but profile is missing. Redirecting to onboarding.");
        router.replace("/onboarding");
      }
    }
  }, [user, isLoadingAuth, userProfile, isLoadingProfile, router]);

  if (!authCheckComplete || isLoadingAuth || (isLoadingProfile && !userProfile && user)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full bg-background p-4">
        <p className="text-destructive mb-4">Access Denied. Please sign in.</p>
        <Button asChild>
          <Link href="/auth?mode=signin">Go to Sign In</Link>
        </Button>
      </div>
    );
  }
  
  if (userProfile && userProfile.onboardingCompleted) {
    return (
      <div className="h-full">
        <ProfileDashboard />
      </div>
    );
  }

  // Fallback loading state while useEffect determines the redirect.
  return (
    <div className="flex flex-col items-center justify-center min-h-full bg-background p-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Verifying profile status...</p>
    </div>
  );
}
