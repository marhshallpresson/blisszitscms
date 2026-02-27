// src/app/app/inbox/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { InboxView } from "@/components/inbox/InboxView";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function AppInboxPage() {
  const { user, userProfile, isLoadingAuth, isLoadingProfile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoadingAuth && !user) {
      router.replace('/auth?mode=signin');
    } else if (!isLoadingProfile && user && !userProfile?.onboardingCompleted) {
      router.replace('/onboarding');
    }
  }, [user, userProfile, isLoadingAuth, isLoadingProfile, router]);
  
  if (isLoadingAuth || isLoadingProfile || !user || !userProfile?.onboardingCompleted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading inbox...</p>
      </div>
    );
  }
  
  return (
    <div className="h-full">
      <InboxView />
    </div>
  );
}
