// src/app/dashboard/page.tsx
"use client";

import { WelcomeDashboard } from "@/components/dashboard/WelcomeDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Modals that might be triggered from WelcomeDashboard or its children
import { WorkspaceCreatorModal } from '@/components/modals/WorkspaceCreatorModal';
// OnboardingModal is now a page, so it's not typically opened from here
// import { OnboardingModal } from '@/components/modals/OnboardingModal'; 

export default function DashboardPage() {
  const { user, isLoadingAuth, userProfile, isLoadingProfile } = useAuth();
  const router = useRouter();
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

  const [isWorkspaceCreatorOpen, setIsWorkspaceCreatorOpen] = useState(false);

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
        <p className="text-muted-foreground">Loading dashboard...</p>
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
  
  const handleNewWorkspace = () => setIsWorkspaceCreatorOpen(true);
  
  // These handlers are placeholders and need full implementation within WelcomeDashboard or here
  const handleSelectWorkspace = (id: string) => {
    console.log("Selected workspace (from DashboardPage):", id);
    // router.push(`/workspace/${id}`); // Example: navigate to a dynamic workspace route
  };
  const handleImportAiRecommendation = (title: string, description: string, caption?:string) => {
    console.log("Importing AI Recommendation (from DashboardPage):", {title, description, caption});
  };

  return (
    <div className="p-4 md:p-8">
      <WelcomeDashboard
        onSelectWorkspace={handleSelectWorkspace}
        onNewWorkspace={handleNewWorkspace}
        onImportAiRecommendation={handleImportAiRecommendation}
        onOpenOnboardingModal={() => { /* This might be deprecated if onboarding is page-only */ }}
        isOnboardingCompleted={userProfile?.onboardingCompleted || false}
      />
       <WorkspaceCreatorModal
        isOpen={isWorkspaceCreatorOpen}
        onClose={() => setIsWorkspaceCreatorOpen(false)}
        onWorkspaceCreated={(id) => {
          console.log("Workspace created with ID:", id);
          // Optionally, select this workspace or refresh list
          setIsWorkspaceCreatorOpen(false); 
          // router.push(`/workspace/${id}`); // Example navigation
        }}
      />
    </div>
  );
}
