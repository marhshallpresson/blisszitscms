// src/app/onboarding/page.tsx
"use client";

import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const { user, isLoadingAuth, userProfile, isLoadingProfile } = useAuth();
  const router = useRouter();
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

  useEffect(() => {
    if (!isLoadingAuth && !isLoadingProfile) { // Wait for both auth and profile checks
      setAuthCheckComplete(true);
      if (!user) {
        router.replace("/auth?mode=signin"); 
      } else if (userProfile?.onboardingCompleted) {
        router.replace("/dashboard"); 
      }
      // If user exists and onboarding is not complete, stay on this page
    }
  }, [user, isLoadingAuth, userProfile, isLoadingProfile, router]);

  if (!authCheckComplete || isLoadingAuth || isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // Render OnboardingForm only if user is authenticated and onboarding is not yet complete.
  // The useEffect above handles redirects if these conditions aren't met after loading.
  if (user && !userProfile?.onboardingCompleted) {
    return <OnboardingForm />;
  }

  // Fallback / intermediate state before redirection occurs from useEffect
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <p className="text-muted-foreground">Verifying your session...</p>
      <Loader2 className="h-8 w-8 animate-spin text-primary ml-2" />
    </div>
  );
}
