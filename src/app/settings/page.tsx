
// src/app/settings/page.tsx (Redirector)
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function SettingsRedirectPage() {
  const { user, isLoadingAuth, userProfile, isLoadingProfile } = useAuth();
  const router = useRouter();

 useEffect(() => {
    if (!isLoadingAuth && !isLoadingProfile) {
      if (!user) {
        router.replace("/auth?mode=signin");
      } else if (userProfile && !userProfile.onboardingCompleted) {
        router.replace("/onboarding");
      } else if (userProfile && userProfile.onboardingCompleted) {
        router.replace("/app/settings"); // Go to new app settings
      } else if (!userProfile && user && !isLoadingProfile) { 
        console.warn("SettingsRedirectPage: User authenticated but profile missing. Redirecting to onboarding.");
        router.replace("/onboarding");
      }
    }
  }, [user, isLoadingAuth, userProfile, isLoadingProfile, router]);


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Redirecting to settings...</p>
    </div>
  );
}
