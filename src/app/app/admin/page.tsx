// src/app/app/admin/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function AdminWorkspacesPage() {
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
