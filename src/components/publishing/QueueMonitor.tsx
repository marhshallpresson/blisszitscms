"use client";

import { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, Loader2, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClientFormattedDate } from '@/components/utils/ClientFormattedDate';
import { getNetworkCapability } from '@/lib/network-capabilities';
import type { ContentItem, PublishJob } from '@/contexts/WorkspaceContext';

interface QueueMonitorProps {
  queueItems: ContentItem[];
  publishJobs: PublishJob[];
  isLoadingPublishJobs: boolean;
  onRunDueJobs: () => Promise<void> | void;
  onRetryJob: (jobId: string) => Promise<void> | void;
  onSchedulePublish?: (item: ContentItem) => Promise<void> | void;
  onMarkAsPublished?: (item: ContentItem) => void;
  onEditContent?: (item: ContentItem) => void;
}

export function QueueMonitor({
  queueItems,
  publishJobs,
  isLoadingPublishJobs,
  onRunDueJobs,
  onRetryJob,
  onSchedulePublish,
  onMarkAsPublished,
  onEditContent,
}: QueueMonitorProps) {
  const [isRunningQueue, setIsRunningQueue] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const sortedJobs = useMemo(
    () => [...publishJobs].sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()),
    [publishJobs]
  );

  const stats = useMemo(() => {
    const pending = sortedJobs.filter((job) => job.status === 'queued' || job.status === 'claimed' || job.status === 'processing' || job.status === 'retrying').length;
    const failed = sortedJobs.filter((job) => job.status === 'failed').length;
    const deadLetter = sortedJobs.filter((job) => job.status === 'dead_letter').length;
    const published = sortedJobs.filter((job) => job.status === 'published').length;
    return { pending, failed, deadLetter, published };
  }, [sortedJobs]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Ready to schedule</p>
            <p className="mt-1 text-2xl font-bold">{queueItems.filter((item) => item.status === 'approved').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Pending jobs</p>
            <p className="mt-1 text-2xl font-bold">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Published jobs</p>
            <p className="mt-1 text-2xl font-bold">{stats.published}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Failed / dead-letter</p>
            <p className="mt-1 text-2xl font-bold">{stats.failed + stats.deadLetter}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Queue approved content, run due jobs, and retry failed jobs without duplicating posts.
        </p>
        <Button
          size="sm"
          variant="secondary"
          disabled={isRunningQueue}
          onClick={async () => {
            setIsRunningQueue(true);
            try {
              await onRunDueJobs();
            } finally {
              setIsRunningQueue(false);
            }
          }}
        >
          {isRunningQueue ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          Run Due Jobs
        </Button>
      </div>

      {queueItems.length > 0 ? (
        queueItems.map((item) => (
          <Card key={item.id} className="border-l-4 border-l-primary p-4">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-3">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    {item.status === 'scheduled' ? 'Scheduled for' : 'Ready to schedule'}:{' '}
                    <ClientFormattedDate date={item.dueDate} />
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {item.status === 'scheduled' && onMarkAsPublished ? (
                  <Button size="sm" variant="outline" onClick={() => onMarkAsPublished(item)}>
                    Publish Now
                  </Button>
                ) : null}
                {item.status === 'approved' && onSchedulePublish ? (
                  <Button size="sm" onClick={() => onSchedulePublish(item)}>
                    Queue Publish Jobs
                  </Button>
                ) : null}
                {onEditContent ? (
                  <Button size="sm" variant="ghost" onClick={() => onEditContent(item)}>
                    Reschedule
                  </Button>
                ) : null}
              </div>
            </div>
          </Card>
        ))
      ) : (
        <div className="rounded-xl border-2 border-dashed py-14 text-center italic text-muted-foreground">
          The publishing queue is empty.
        </div>
      )}

      <Card className="border-border/70 bg-card/80">
        <CardHeader>
          <CardTitle className="text-lg">Publish Jobs</CardTitle>
          <CardDescription>Worker status per network with retries and capability-safe fallback messaging.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingPublishJobs ? (
            <p className="text-sm text-muted-foreground">Loading publish jobs...</p>
          ) : sortedJobs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No publish jobs yet.</p>
          ) : (
            <div className="space-y-3">
              {sortedJobs.map((job) => {
                const capability = getNetworkCapability(job.network);
                const isRetrying = activeJobId === job.id;
                return (
                  <div key={job.id} className="rounded-md border border-border/60 p-3">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-medium capitalize">{job.network}</p>
                        <p className="text-xs text-muted-foreground">
                          Scheduled:{' '}
                          <ClientFormattedDate
                            date={job.scheduledFor}
                            options={{ month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }}
                          />
                        </p>
                        {job.lastError ? <p className="mt-1 text-xs text-destructive">{job.lastError}</p> : null}
                        {!capability?.canPublish ? (
                          <p className="mt-1 text-xs text-amber-600">
                            Direct publishing is disabled for now
                          </p>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            job.status === 'published'
                              ? 'default'
                              : job.status === 'failed' || job.status === 'dead_letter'
                                ? 'destructive'
                                : 'secondary'
                          }
                        >
                          {job.status}
                        </Badge>
                        {job.status === 'published' ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : null}
                        {job.status === 'failed' || job.status === 'dead_letter' ? <AlertCircle className="h-4 w-4 text-destructive" /> : null}
                        {job.status === 'failed' || job.status === 'dead_letter' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isRetrying}
                            onClick={async () => {
                              setActiveJobId(job.id);
                              try {
                                await onRetryJob(job.id);
                              } finally {
                                setActiveJobId(null);
                              }
                            }}
                          >
                            {isRetrying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Retry
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
