// src/app/app/admin/page.tsx
"use client";

import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function AdminWorkspacesPage() {
  const { isLoadingAuth, isLoadingProfile } = useAuth();
  
  // The main AppLayout handles the core auth/onboarding redirects.
  // We just need to handle the loading of the user session for this page's content.
  if (isLoadingAuth || isLoadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading workspace management...</p>
      </div>
    );
  }
  
  return (
    <div className="h-full">
      <AdminDashboard />
    </div>
  );
}
