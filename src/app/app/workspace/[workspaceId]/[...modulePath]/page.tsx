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
import { QueueMonitor } from '@/components/publishing/QueueMonitor';
import { PublishingLogsTable } from '@/components/publishing/PublishingLogsTable';
import { PublishingErrorDetail } from '@/components/publishing/PublishingErrorDetail';

const STATUS_LABEL: Record<'live' | 'mvp' | 'planned', string> = {
  live: 'Live',
  mvp: 'Development',
  planned: 'Planned',
};

export default function WorkspaceModuleCatchAllPage() {
  const { user, userProfile, isLoadingAuth, isLoadingProfile } = useAuth();
  const {
    setCurrentWorkspaceId,
    currentWorkspaceId,
    contentItems,
    isLoadingContent,
    publishJobs,
    isLoadingPublishJobs,
    scheduleContentItemForPublishing,
    runDuePublishJobs,
    retryPublishJob,
  } = useWorkspace();
  const router = useRouter();
  const params = useParams();

  const workspaceId = (params?.workspaceId as string | undefined) ?? '';
  const moduleSegments = (params?.modulePath as string[] | undefined) ?? [];
  const moduleKey = moduleSegments.join('/');

  const dynamicModule = (() => {
    if (moduleSegments[0] === 'content' && moduleSegments.length === 2) {
      return {
        title: 'Content Item Details',
        description: 'Inspect post variants, approval notes, and publishing history for a single content item.',
        status: 'mvp' as const,
      };
    }
    if (moduleSegments[0] === 'publishing' && moduleSegments[1] === 'errors' && moduleSegments[2]) {
      return {
        title: 'Publishing Error Detail',
        description: 'Investigate failure reasons and trigger corrective retry actions for a single job.',
        status: 'mvp' as const,
      };
    }
    if (moduleSegments[0] === 'inbox' && moduleSegments[1]) {
      return {
        title: 'Inbox Thread Detail',
        description: 'Review thread history, reply state, and internal routing notes for this conversation.',
        status: 'mvp' as const,
      };
    }
    if (moduleSegments[0] === 'approvals' && moduleSegments[1]) {
      return {
        title: 'Approval Detail',
        description: 'Review one content item and apply approve/reject workflow actions.',
        status: 'live' as const,
      };
    }
    if (moduleSegments[0] === 'assets' && moduleSegments[1]) {
      return {
        title: 'Asset Detail',
        description: 'Inspect media metadata, linked posts, and usage history.',
        status: 'planned' as const,
      };
    }
    return null;
  })();

  const moduleDef = WORKSPACE_MODULE_MAP[moduleKey] ?? dynamicModule ?? {
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
    } else if (!isLoadingProfile && user && userProfile?.onboardingCompleted === false) {
      router.replace('/onboarding');
    }
  }, [user, userProfile, isLoadingAuth, isLoadingProfile, router]);

  if (isLoadingAuth || isLoadingProfile || !user || !userProfile || userProfile.onboardingCompleted === false) {
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

  if (moduleKey === 'publishing/queue') {
    const queueItems = contentItems.filter((item) => item.status === 'scheduled' || item.status === 'approved');
    return (
      <QueueMonitor
        queueItems={queueItems}
        publishJobs={publishJobs}
        isLoadingPublishJobs={isLoadingPublishJobs}
        onRunDueJobs={runDuePublishJobs}
        onRetryJob={retryPublishJob}
        onSchedulePublish={(item) => scheduleContentItemForPublishing(item.id, item.dueDate)}
      />
    );
  }

  if (
    moduleKey === 'analytics/overview' ||
    moduleKey === 'analytics/posts' ||
    moduleKey === 'analytics/channels' ||
    moduleKey === 'analytics/reports'
  ) {
    return <AnalyticsDashboard />;
  }

  if (moduleKey === 'publishing/logs') {
    return <PublishingLogsTable workspaceId={workspaceId} jobs={publishJobs} items={contentItems} />;
  }

  if (moduleKey === 'publishing/errors') {
    const failedJobs = publishJobs.filter((job) => job.status === 'failed' || job.status === 'dead_letter');
    return <PublishingLogsTable workspaceId={workspaceId} jobs={failedJobs} items={contentItems} />;
  }

  if (moduleSegments[0] === 'publishing' && moduleSegments[1] === 'errors' && moduleSegments[2]) {
    const targetJob = publishJobs.find((job) => job.id === moduleSegments[2]);
    if (!targetJob) {
      return (
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Publishing Error Detail</CardTitle>
            <CardDescription>No job found for id: {moduleSegments[2]}</CardDescription>
          </CardHeader>
        </Card>
      );
    }
    const item = contentItems.find((contentItem) => contentItem.id === targetJob.contentItemId);
    return <PublishingErrorDetail workspaceId={workspaceId} job={targetJob} item={item} onRetry={retryPublishJob} />;
  }

  if (moduleSegments[0] === 'inbox') {
    return <InboxView initialThreadId={moduleSegments[1]} />;
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/70 bg-card/80">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle className="text-3xl font-headline">{moduleDef.title}</CardTitle>
            <Badge variant={moduleDef.status === 'live' ? 'default' : 'secondary'}>{STATUS_LABEL[moduleDef.status]}</Badge>
          </div>
          <CardDescription>{moduleDef.description}</CardDescription>
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
