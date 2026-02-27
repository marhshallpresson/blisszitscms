"use client";

import Link from 'next/link';
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { WORKSPACE_MODULE_MAP } from '@/lib/workspace-module-map';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarView } from '@/components/content/CalendarView';
import { IdeaBoard } from '@/components/content/IdeaBoard';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { InboxView } from '@/components/inbox/InboxView';

const STATUS_LABEL: Record<'live' | 'mvp' | 'planned', string> = {
  live: 'Live',
  mvp: 'MVP',
  planned: 'Planned',
};

export default function WorkspaceModuleCatchAllPage() {
  const { user, userProfile, isLoadingAuth, isLoadingProfile } = useAuth();
  const { setCurrentWorkspaceId, currentWorkspaceId, contentItems, isLoadingContent } = useWorkspace();
  const router = useRouter();
  const params = useParams();

  const workspaceId = params.workspaceId as string;
  const moduleSegments = (params.modulePath as string[] | undefined) ?? [];
  const moduleKey = moduleSegments.join('/');
  const module = WORKSPACE_MODULE_MAP[moduleKey] ?? {
    title: moduleSegments.length ? moduleSegments.join(' / ') : 'Workspace module',
    description: 'This module route is reserved for upcoming implementation work.',
    status: 'planned' as const,
  };

  useEffect(() => {
    if (workspaceId && currentWorkspaceId !== workspaceId) {
      setCurrentWorkspaceId(workspaceId);
    }
  }, [workspaceId, currentWorkspaceId, setCurrentWorkspaceId]);

  useEffect(() => {
    if (!isLoadingAuth && !user) {
      router.replace('/auth?mode=signin');
    } else if (!isLoadingProfile && user && !userProfile?.onboardingCompleted) {
      router.replace('/onboarding');
    }
  }, [user, userProfile, isLoadingAuth, isLoadingProfile, router]);

  if (isLoadingAuth || isLoadingProfile || !user || !userProfile?.onboardingCompleted) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center p-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-3 text-muted-foreground">Loading module...</p>
      </div>
    );
  }

  if (moduleKey === 'content/calendar') {
    return <CalendarView contentItems={contentItems} isLoading={isLoadingContent} onViewDetails={() => {}} />;
  }

  if (moduleKey === 'content/board') {
    return <IdeaBoard />;
  }

  if (moduleKey === 'analytics/overview') {
    return <AnalyticsDashboard />;
  }

  if (moduleKey === 'inbox') {
    return <InboxView />;
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/70 bg-card/80">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle className="text-3xl font-headline">{module.title}</CardTitle>
            <Badge variant={module.status === 'live' ? 'default' : 'secondary'}>{STATUS_LABEL[module.status]}</Badge>
          </div>
          <CardDescription>{module.description}</CardDescription>
        </CardHeader>
      </Card>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Workspace route</CardTitle>
          <CardDescription>
            Path: <span className="font-mono">/app/workspace/{workspaceId}/{moduleSegments.join('/')}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href={`/app/workspace/${workspaceId}`}>Open workspace hub</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/app/workspace/${workspaceId}/publishing/queue`}>Publishing queue</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/app/workspace/${workspaceId}/analytics/overview`}>Analytics overview</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/app/workspace/${workspaceId}/inbox`}>Inbox</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
