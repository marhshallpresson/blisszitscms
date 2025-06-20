// src/components/dashboard/WelcomeDashboard.tsx
"use client";

// This component is no longer the primary entry point for the corporate website.
// It's functionality is largely superseded by the new src/app/page.tsx (HomePage).
// Kept for reference or if parts are re-integrated into a client portal later.

// import type { Workspace } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// import { AiRecommendationCard } from '@/components/ai/AiRecommendationCard';
import { Plus, Briefcase, ChevronRight, Sparkles } from 'lucide-react';
// import { useWorkspace } from '@/contexts/WorkspaceContext';
// import { Skeleton } from '@/components/ui/skeleton';
// import { ClientFormattedDate } from '@/components/utils/ClientFormattedDate';
import Link from 'next/link';


interface WelcomeDashboardProps {
  // Props below are related to old CMS functionality, not corporate site
  // onSelectWorkspace: (id: string) => void;
  // onNewWorkspace: () => void;
  // onImportAiRecommendation: (title: string, description: string, caption?:string) => void;
  // onOpenOnboardingModal: () => void;
  // isOnboardingCompleted: boolean;
}

export const WelcomeDashboard = ({ 
  // onSelectWorkspace, 
  // onNewWorkspace, 
  // onImportAiRecommendation,
  // onOpenOnboardingModal,
  // isOnboardingCompleted
}: WelcomeDashboardProps) => {
  // const { workspaces, isLoadingWorkspaces } = useWorkspace();

  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <Sparkles className="w-24 h-24 text-primary mx-auto mb-6" />
      <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground mb-6">
        Welcome to Blisszits Corporate Site
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
        This is a placeholder for the old WelcomeDashboard. The main content is now on the homepage.
      </p>
      <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-3 shadow-lg">
        <Link href="/">Go to Homepage</Link>
      </Button>
      
      {/* Old CMS-related content is commented out or removed */}
      {/* 
      <Card className="bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground p-6 md:p-8 rounded-xl shadow-xl">
        ...
      </Card>
      
      <div>
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl md:text-3xl font-bold font-headline text-foreground">Your Workspaces</h2>
          <Button onClick={onNewWorkspace} size="lg" className="font-bold shadow-md hover:shadow-lg transition-shadow">
            <Plus size={20} className="mr-2" /> Create New Workspace
          </Button>
        </div>
        ... workspace listing logic ...
      </div>
      <AiRecommendationCard 
        onImportRecommendation={onImportAiRecommendation} 
        onOpenOnboardingModal={onOpenOnboardingModal}
        isOnboardingCompleted={isOnboardingCompleted}
      /> 
      */}
    </div>
  );
};
