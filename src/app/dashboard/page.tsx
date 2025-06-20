// src/app/dashboard/page.tsx
"use client";

import { WelcomeDashboard } from "@/components/dashboard/WelcomeDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  const { user, isLoadingAuth, userProfile, isLoadingProfile } = useAuth();
  const router = useRouter();
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

  useEffect(() => {
    if (!isLoadingAuth && !isLoadingProfile) {
      setAuthCheckComplete(true);
      if (!user) {
        router.replace("/auth?mode=signin");
      } else if (userProfile && !userProfile.onboardingCompleted) { // Ensure profile is loaded before checking onboarding
        router.replace("/onboarding");
      }
    }
  }, [user, isLoadingAuth, userProfile, isLoadingProfile, router]);

  if (!authCheckComplete || isLoadingAuth || isLoadingProfile && !userProfile) { // Show loader if still loading initial auth/profile
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  if (!user) { // This case should ideally be caught by useEffect redirect, but good as a fallback
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <p className="text-destructive mb-4">Access Denied. Please sign in.</p>
        <Button asChild>
          <Link href="/auth?mode=signin">Go to Sign In</Link>
        </Button>
      </div>
    );
  }
  
  // If user is authenticated, but onboarding is not complete and profile is loaded
  // This check ensures that if the initial redirect in useEffect didn't catch it (e.g., due to timing)
  // the user is still sent to onboarding.
  if (userProfile && !userProfile.onboardingCompleted) {
    // This will be quickly redirected by the useEffect, but good to have a state for it.
     return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Redirecting to onboarding...</p>
      </div>
    );
  }

  return (
    <div className="p-0 md:p-0"> {/* Reduced padding to allow WelcomeDashboard to control its own padding */}
      <WelcomeDashboard
        isOnboardingCompleted={userProfile?.onboardingCompleted || false}
      />
      {/* WorkspaceCreatorModal and its trigger are removed from here.
          Workspace creation might be initiated from an "Admin" or "Manage Workspaces" section if that's its primary role.
      */}
    </div>
  );
}
