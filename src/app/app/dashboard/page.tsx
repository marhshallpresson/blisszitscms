
// src/app/(app)/dashboard/page.tsx -> src/app/app/dashboard/page.tsx
"use client";

import { WelcomeDashboard } from "@/components/dashboard/WelcomeDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AppDashboardPage() {
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
      }
    }
  }, [user, isLoadingAuth, userProfile, isLoadingProfile, router]);

  if (!authCheckComplete || isLoadingAuth || (isLoadingProfile && !userProfile && user)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading dashboard...</p>
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
  
  if (userProfile && !userProfile.onboardingCompleted) {
     return (
      <div className="flex flex-col items-center justify-center min-h-full bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Redirecting to onboarding...</p>
      </div>
    );
  }

  return (
    <div className="h-full"> {/* Ensure WelcomeDashboard can fill height if needed */}
      <WelcomeDashboard
        isOnboardingCompleted={userProfile?.onboardingCompleted || false}
      />
    </div>
  );
}
