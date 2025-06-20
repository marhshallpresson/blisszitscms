
// src/components/dashboard/WelcomeDashboard.tsx
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Sparkles, Settings, Briefcase, Plus, Eye } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace, type Workspace } from '@/contexts/WorkspaceContext';
import { WorkspaceCreatorModal } from '@/components/modals/WorkspaceCreatorModal';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { AiRecommendationCard } from '@/components/ai/AiRecommendationCard';

interface WelcomeDashboardProps {
  isOnboardingCompleted: boolean;
}

export const WelcomeDashboard = ({ isOnboardingCompleted }: WelcomeDashboardProps) => {
  const { userProfile } = useAuth();
  const { workspaces, setCurrentWorkspaceId, isLoadingWorkspaces } = useWorkspace();
  const [isWorkspaceCreatorOpen, setIsWorkspaceCreatorOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleNewWorkspace = () => setIsWorkspaceCreatorOpen(true);

  const handleNavigateToWorkspace = (workspaceId: string) => {
    setCurrentWorkspaceId(workspaceId);
    router.push(`/app/workspace/${workspaceId}`);
    toast({ title: "Workspace Selected", description: "Navigating to workspace..." });
  };

  const recentWorkspaces = workspaces.slice(0, 3); 

  return (
    <div className="container mx-auto px-0 py-0 space-y-8 md:space-y-10 h-full flex flex-col">
      <Card className="bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground p-6 md:p-8 rounded-xl shadow-xl flex-shrink-0">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Sparkles className="w-10 h-10 md:w-12 md:h-12" />
              <div>
                <CardTitle className="text-3xl md:text-4xl font-bold font-headline">
                  Welcome, {userProfile?.displayName || "Creator"}!
                </CardTitle>
                <CardDescription className="text-primary-foreground/80 text-base md:text-lg mt-1">
                  {isOnboardingCompleted ? "Your app dashboard is ready. What's next?" : "Complete your onboarding to get started."}
                </CardDescription>
              </div>
            </div>
            <Button 
              onClick={handleNewWorkspace} 
              size="lg" 
              className="font-bold shadow-md hover:shadow-lg transition-shadow bg-background/20 hover:bg-background/30 text-primary-foreground mt-3 sm:mt-0 w-full sm:w-auto"
            >
              <Plus size={22} className="mr-2" /> Create New Workspace
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 flex-shrink-0">
        <Card className="lg:col-span-1 hover:shadow-lg transition-shadow border-border/70">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center gap-2">
              <Settings size={22} className="text-primary"/> Account Settings
            </CardTitle>
            <CardDescription>
              Update your profile, password, and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full md:w-auto bg-secondary hover:bg-secondary/80 text-secondary-foreground">
              <Link href="/app/settings">Go to Settings</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2 hover:shadow-lg transition-shadow border-border/70">
          <CardHeader>
             <div className="flex justify-between items-center">
                <CardTitle className="font-headline text-xl flex items-center gap-2">
                  <Briefcase size={22} className="text-primary"/> Recent Workspaces
                </CardTitle>
                <Button variant="outline" size="sm" asChild>
                    <Link href="/app/admin">View All</Link>
                </Button>
             </div>
            <CardDescription>
              Quickly jump back into your projects or manage all workspaces.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingWorkspaces ? (
                 <p className="text-muted-foreground">Loading workspaces...</p>
            ) : recentWorkspaces.length > 0 ? (
              <ul className="space-y-3">
                {recentWorkspaces.map(ws => (
                  <li key={ws.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-md hover:bg-muted">
                    <span className="font-medium text-card-foreground">{ws.name}</span>
                    <Button variant="ghost" size="sm" onClick={() => handleNavigateToWorkspace(ws.id)}>
                        <Eye size={16} className="mr-1.5"/> Open
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No workspaces yet. Create one to get started!</p>
            )}
          </CardContent>
           <CardFooter>
             <Button onClick={handleNewWorkspace} className="w-full md:w-auto" variant="outline">
                <Plus size={16} className="mr-2"/> Create Workspace
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="flex-grow min-h-0">
          <AiRecommendationCard />
      </div>

      <WorkspaceCreatorModal
        isOpen={isWorkspaceCreatorOpen}
        onClose={() => setIsWorkspaceCreatorOpen(false)}
        onWorkspaceCreated={(id) => {
          setIsWorkspaceCreatorOpen(false); 
          if (id) {
            handleNavigateToWorkspace(id);
          }
        }}
      />
    </div>
  );
};
