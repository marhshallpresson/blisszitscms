
"use client";

import type { Workspace } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AiRecommendationCard } from '@/components/ai/AiRecommendationCard';
import { Plus, Briefcase, ChevronRight } from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Skeleton } from '@/components/ui/skeleton';
import { ClientFormattedDate } from '@/components/utils/ClientFormattedDate';

interface WelcomeDashboardProps {
  onSelectWorkspace: (id: string) => void;
  onNewWorkspace: () => void;
}

export const WelcomeDashboard = ({ onSelectWorkspace, onNewWorkspace }: WelcomeDashboardProps) => {
  const { workspaces, isLoadingWorkspaces } = useWorkspace();

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-4xl font-bold text-foreground font-headline">Welcome, Creator!</h1>
      <p className="text-lg text-muted-foreground mt-2 font-body">Ready to create some magic? Select a workspace or create a new one to begin.</p>
      
      <div className="mt-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold font-headline text-foreground">Your Workspaces</h2>
          <Button onClick={onNewWorkspace} className="font-bold">
            <Plus size={20} className="mr-2" /> New Workspace
          </Button>
        </div>

        {isLoadingWorkspaces ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="w-full">
                <CardHeader>
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-4 w-1/2" />
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
                className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Briefcase className="w-10 h-10 text-primary bg-primary/10 p-2 rounded-lg"/>
                    <span className="text-sm font-semibold text-muted-foreground">{ws.contentCount || 0} Posts</span>
                  </div>
                  <CardTitle className="mt-4 font-headline text-foreground">{ws.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="line-clamp-2 h-12 text-muted-foreground">{ws.description || "No description provided."}</CardDescription>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Created: <ClientFormattedDate date={ws.createdAt as Date} /></span>
                  <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors"/>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl bg-card">
            <Briefcase size={48} className="mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold font-headline text-card-foreground">No workspaces yet</h3>
            <p className="mt-1 text-muted-foreground font-body">Create your first workspace to start planning your content.</p>
            <Button onClick={onNewWorkspace} className="mt-6 font-bold">
              <Plus size={20} className="mr-2" /> Create Workspace
            </Button>
          </div>
        )}
      </div>
      <AiRecommendationCard />
    </div>
  );
};
