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
      } else if (!userProfile?.onboardingCompleted) {
        router.replace("/onboarding"); 
      }
    }
  }, [user, isLoadingAuth, userProfile, isLoadingProfile, router]);

  if (!authCheckComplete || isLoadingAuth || isLoadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <p className="text-destructive mb-4">Access Denied. Please sign in.</p>
        <Button asChild>
          <Link href="/auth?mode=signin">Go to Sign In</Link>
        </Button>
      </div>
    );
  }
  
  // Ensure userProfile is available before rendering ProfileDashboard,
  // or ProfileDashboard needs to handle null userProfile gracefully (which it does by checking user)
  if (!userProfile && !isLoadingProfile) {
      // This scenario implies an issue or the user somehow bypassed onboarding check
      // or profile creation failed silently.
      console.warn("SettingsPage: User is authenticated but profile is missing. Redirecting to onboarding.");
      router.replace("/onboarding");
      return (
         <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Profile data missing, redirecting...</p>
        </div>
      );
  }


  return (
    <div className="p-4 md:p-8">
      <ProfileDashboard />
    </div>
  );
}
