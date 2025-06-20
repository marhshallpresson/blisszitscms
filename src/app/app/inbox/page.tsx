// src/app/app/inbox/page.tsx
"use client";

import { InboxView } from "@/components/inbox/InboxView";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function AppInboxPage() {
  const { isLoadingAuth, isLoadingProfile } = useAuth();

  // The main AppLayout handles the core auth/onboarding redirects.
  // We just need to handle the loading of the user session for this page's content.
  if (isLoadingAuth || isLoadingProfile) {
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
