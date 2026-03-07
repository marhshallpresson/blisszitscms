// src/components/dashboard/WelcomeDashboard.tsx
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SquarePen, Briefcase, Plus, Eye, Inbox, BarChart3, Settings, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { WorkspaceCreatorModal } from '@/components/modals/WorkspaceCreatorModal';
import { OnboardingModal } from '@/components/modals/OnboardingModal';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AiRecommendationCard } from '@/components/ai/AiRecommendationCard';
import { AiWorkspaceGeneratorModal } from '../modals/AiWorkspaceGeneratorModal';

interface WelcomeDashboardProps {
  isOnboardingCompleted: boolean;
}

export const WelcomeDashboard = ({ isOnboardingCompleted }: WelcomeDashboardProps) => {
  const { userProfile, updateUserProfile } = useAuth();
  const { workspaces, setCurrentWorkspaceId, isLoadingWorkspaces } = useWorkspace();
  const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false);
  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const router = useRouter();

  const handleNavigateToWorkspace = (workspaceId: string) => {
    setCurrentWorkspaceId(workspaceId);
    router.push(`/app/workspace/${workspaceId}`);
  };

  const handleSaveInterests = async (interests: string[]) => {
    try {
      await updateUserProfile({ interests });
      setIsOnboardingModalOpen(false);
    } catch (error) {
      console.error('Failed to save interests', error);
    }
  };

  const handleOpenOnboardingIfNeeded = () => {
    if (!userProfile?.interests || userProfile.interests.length === 0) {
      setIsOnboardingModalOpen(true);
    }
  };

  const recentWorkspaces = workspaces.slice(0, 3);
  const activeWorkspaceId = workspaces[0]?.id;

  return (
    <div className="space-y-8 h-full flex flex-col">
      <Card className="bg-gradient-to-br from-primary via-primary/80 to-accent text-primary-foreground p-6 md:p-8 rounded-xl shadow-xl flex-shrink-0">
        <CardHeader className="p-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <SquarePen className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0" />
              <div>
                <CardTitle className="text-2xl md:text-3xl font-bold font-headline">
                  {new Date().getHours() < 12
                    ? `Good morning, ${userProfile?.displayName || 'Creator'}`
                    : new Date().getHours() < 18
                      ? `Good afternoon, ${userProfile?.displayName || 'Creator'}`
                      : `Good evening, ${userProfile?.displayName || 'Creator'}`}
                </CardTitle>
                <CardDescription className="text-primary-foreground/80 text-base md:text-lg mt-1">
                  {isOnboardingCompleted
                    ? workspaces.length === 0
                      ? 'Your creative space awaits. Lets build your first workspace together.'
                      : `Ready to dive back in? You have ${workspaces.length} workspace${workspaces.length > 1 ? 's' : ''} waiting for you.`
                    : 'A few quick steps and we will tailor everything to your creative flow.'}
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={() => setIsAiGeneratorOpen(true)}
              size="lg"
              className="font-bold shadow-md hover:shadow-lg transition-shadow bg-background/20 hover:bg-background/30 text-primary-foreground mt-3 sm:mt-0 w-full sm:w-auto"
            >
              <Plus size={22} className="mr-2" /> Create New Workspace
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 flex-shrink-0">
        <Card className="lg:col-span-2 hover:shadow-lg transition-shadow border-border/70">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="font-headline text-xl flex items-center gap-2">
                <Briefcase size={22} className="text-primary" /> Recent Workspaces
              </CardTitle>
              {workspaces.length > 3 && (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/app/admin">View All</Link>
                </Button>
              )}
            </div>
            <CardDescription>Quickly jump back into your projects.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingWorkspaces ? (
              <p className="text-muted-foreground text-sm">Loading workspaces...</p>
            ) : recentWorkspaces.length > 0 ? (
              <ul className="space-y-3">
                {recentWorkspaces.map((workspace) => (
                  <li key={workspace.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-md hover:bg-muted">
                    <span className="font-medium text-card-foreground truncate pr-4">{workspace.name}</span>
                    <Button variant="ghost" size="sm" onClick={() => handleNavigateToWorkspace(workspace.id)}>
                      <Eye size={16} className="mr-1.5" /> Open
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm py-4 text-center">No workspaces yet. Create one to get started!</p>
            )}
          </CardContent>
        </Card>
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Quick Tools</CardTitle>
            <CardDescription>Jump to your most-used actions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/app/inbox">
                <Inbox className="mr-2 h-4 w-4" />
                Open Inbox
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/app/analytics">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href={activeWorkspaceId ? `/app/workspace/${activeWorkspaceId}` : '/app/admin'}>
                <CalendarDays className="mr-2 h-4 w-4" />
                Content Workspace
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/app/settings">
                <Settings className="mr-2 h-4 w-4" />
                Account Settings
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex-grow min-h-0">
        <AiRecommendationCard
          onOpenOnboardingModal={handleOpenOnboardingIfNeeded}
          isOnboardingCompleted={isOnboardingCompleted}
        />
      </div>

      <WorkspaceCreatorModal
        isOpen={isCreatorModalOpen}
        onClose={() => setIsCreatorModalOpen(false)}
        onWorkspaceCreated={(id) => {
          setIsCreatorModalOpen(false);
          if (id) handleNavigateToWorkspace(id);
        }}
      />
      <AiWorkspaceGeneratorModal
        isOpen={isAiGeneratorOpen}
        onClose={() => setIsAiGeneratorOpen(false)}
        onWorkspaceCreated={(id) => {
          setIsAiGeneratorOpen(false);
          if (id) handleNavigateToWorkspace(id);
        }}
      />
      <OnboardingModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
        onSaveInterests={handleSaveInterests}
      />
    </div>
  );
};
