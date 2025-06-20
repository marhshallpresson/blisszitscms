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
  const isDataLoading = isLoadingAuth || isLoadingProfile;

  useEffect(() => {
    if (isDataLoading) return;

    if (!user) {
      router.replace("/auth?mode=signin");
    } else if (userProfile?.onboardingCompleted) {
      router.replace("/app/dashboard");
    }
  }, [user, userProfile, isDataLoading, router]);

  if (isDataLoading || !user || userProfile?.onboardingCompleted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Verifying your profile...</p>
      </div>
    );
  }

  // If we reach here, user exists and is not onboarded
  return <OnboardingForm />;
}
