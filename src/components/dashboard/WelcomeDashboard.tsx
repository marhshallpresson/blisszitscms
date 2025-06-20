
"use client";

import type { Workspace } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AiRecommendationCard } from '@/components/ai/AiRecommendationCard';
import { Plus, Briefcase, ChevronRight, Sparkles } from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Skeleton } from '@/components/ui/skeleton';
import { ClientFormattedDate } from '@/components/utils/ClientFormattedDate';

interface WelcomeDashboardProps {
  onSelectWorkspace: (id: string) => void;
  onNewWorkspace: () => void;
  onImportAiRecommendation: (title: string, description: string, caption?:string) => void;
  onOpenOnboardingModal: () => void;
  isOnboardingCompleted: boolean;
}

export const WelcomeDashboard = ({ 
  onSelectWorkspace, 
  onNewWorkspace, 
  onImportAiRecommendation,
  onOpenOnboardingModal,
  isOnboardingCompleted
}: WelcomeDashboardProps) => {
  const { workspaces, isLoadingWorkspaces } = useWorkspace();

  return (
    <div className="space-y-8 md:space-y-10">
      <Card className="bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground p-6 md:p-8 rounded-xl shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-headline">Welcome, Creator!</h1>
            <p className="text-base md:text-lg mt-2 opacity-90 font-body">
              Ready to supercharge your content? Dive into a workspace or ignite some AI magic.
            </p>
          </div>
          <Sparkles className="w-16 h-16 md:w-20 md:h-20 text-primary-foreground/50 hidden sm:block" />
        </div>
      </Card>
      
      <div>
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl md:text-3xl font-bold font-headline text-foreground">Your Workspaces</h2>
          <Button onClick={onNewWorkspace} size="lg" className="font-bold shadow-md hover:shadow-lg transition-shadow">
            <Plus size={20} className="mr-2" /> Create New Workspace
          </Button>
        </div>

        {isLoadingWorkspaces ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="w-full shadow-md border-border/70">
                <CardHeader>
                  <Skeleton className="h-7 w-3/4 bg-muted" />
                  <Skeleton className="h-4 w-1/3 mt-2 bg-muted/80" />
                </CardHeader>
                <CardContent className="pt-0">
                  <Skeleton className="h-4 w-full mb-2 bg-muted/70" />
                  <Skeleton className="h-4 w-5/6 bg-muted/70" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-4 w-1/2 bg-muted/60" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : workspaces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map(ws => (
              <Card 
                key={ws.id} 
                onClick={() => onSelectWorkspace(ws.id)} 
                className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between bg-card border-border/70 hover:border-primary/50 shadow-lg"
                role="button"
                tabIndex={0}
                aria-label={`Open workspace: ${ws.name}`}
                onKeyDown={(e) => e.key === 'Enter' && onSelectWorkspace(ws.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <Briefcase className="w-9 h-9 text-primary bg-primary/10 p-2 rounded-lg mb-2"/>
                    <span className="text-xs font-semibold text-muted-foreground">{ws.contentCount || 0} Item{ws.contentCount !==1 ? 's' : ''}</span>
                  </div>
                  <CardTitle className="font-headline text-xl text-card-foreground">{ws.name}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 flex-grow">
                  <CardDescription className="line-clamp-2 h-10 text-muted-foreground font-body text-sm">{ws.description || "No description provided."}</CardDescription>
                </CardContent>
                <CardFooter className="flex justify-between items-center pt-3 border-t mt-auto">
                  <span className="text-xs text-muted-foreground">
                    Created: <ClientFormattedDate date={ws.createdAt as Date} options={{ year: 'numeric', month: 'short', day: 'numeric' }} />
                  </span>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors"/>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 md:py-20 border-2 border-dashed border-border/60 rounded-xl bg-card/30">
            <Briefcase size={48} className="mx-auto text-muted-foreground opacity-60" />
            <h3 className="mt-5 text-xl md:text-2xl font-semibold font-headline text-card-foreground">Your content stage is empty!</h3>
            <p className="mt-2 text-muted-foreground font-body max-w-md mx-auto text-sm md:text-base">Create your first workspace to organize projects, plan content, and bring your ideas to life.</p>
            <Button onClick={onNewWorkspace} size="lg" className="mt-6 md:mt-8 font-bold shadow-md hover:shadow-lg">
              <Plus size={20} className="mr-2" /> Create First Workspace
            </Button>
          </div>
        )}
      </div>
      <AiRecommendationCard 
        onImportRecommendation={onImportAiRecommendation} 
        onOpenOnboardingModal={onOpenOnboardingModal}
        isOnboardingCompleted={isOnboardingCompleted}
      />
    </div>
  );
};
