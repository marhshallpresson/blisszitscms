// src/app/onboarding/page.tsx
"use client";

import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const { user, userProfile, isLoadingAuth, isLoadingProfile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoadingAuth || isLoadingProfile) return;
    if (user && userProfile?.onboardingCompleted) {
      // If user is already onboarded, send them to the dashboard.
      router.replace('/app/dashboard');
    }
    if (!user) {
      router.replace('/auth?mode=signin');
    }
  }, [user, userProfile, isLoadingAuth, isLoadingProfile, router]);
  
  if (isLoadingAuth || isLoadingProfile) {
     return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If there's no user, the form itself doesn't make sense.
  // A redirect to login should happen, but we can show a message briefly.
  if (!user) {
    return (
       <div className="flex h-screen w-screen items-center justify-center bg-background">
         <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Render the form if the user exists and is not yet onboarded
  return <OnboardingForm />;
}
