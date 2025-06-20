
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
    if (!isLoadingAuth && !isLoadingProfile) {
      setAuthCheckComplete(true);
      if (!user) {
        router.replace("/auth?mode=signin"); 
      } else if (userProfile?.onboardingCompleted) {
        router.replace("/app/dashboard"); // Redirect to app dashboard
      }
    }
  }, [user, isLoadingAuth, userProfile, isLoadingProfile, router]);

  if (!authCheckComplete || isLoadingAuth || isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (user && !userProfile?.onboardingCompleted) {
    return <OnboardingForm />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <p className="text-muted-foreground">Verifying your session...</p>
      <Loader2 className="h-8 w-8 animate-spin text-primary ml-2" />
    </div>
  );
}
