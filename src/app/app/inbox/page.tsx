// src/app/app/inbox/page.tsx
"use client";

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { InboxView } from "@/components/inbox/InboxView";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

function InboxLoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full bg-background p-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Loading inbox...</p>
    </div>
  );
}

function InboxPageContent() {
  const { user, userProfile, isLoadingAuth, isLoadingProfile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const threadId = searchParams?.get('thread') ?? undefined;

  useEffect(() => {
    if (!isLoadingAuth && !user) {
      router.replace('/auth?mode=signin');
    } else if (!isLoadingProfile && user && userProfile?.onboardingCompleted === false) {
      router.replace('/onboarding');
    }
  }, [user, userProfile, isLoadingAuth, isLoadingProfile, router]);
  
  if (isLoadingAuth || isLoadingProfile || !user || !userProfile || userProfile.onboardingCompleted === false) {
    return <InboxLoadingState />;
  }
  
  return (
    <div className="h-full">
      <InboxView initialThreadId={threadId} />
    </div>
  );
}

export default function AppInboxPage() {
  return (
    <Suspense fallback={<InboxLoadingState />}>
      <InboxPageContent />
    </Suspense>
  );
}
