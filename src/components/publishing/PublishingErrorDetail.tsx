import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClientFormattedDate } from '@/components/utils/ClientFormattedDate';
import type { ContentItem, PublishJob } from '@/contexts/WorkspaceContext';

interface PublishingErrorDetailProps {
  workspaceId: string;
  job: PublishJob;
  item?: ContentItem;
  onRetry: (jobId: string) => Promise<void> | void;
}

export function PublishingErrorDetail({ workspaceId, job, item, onRetry }: PublishingErrorDetailProps) {
  return (
    <Card className="border-destructive/40 bg-card">
      <CardHeader>
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <CardTitle>Publishing Error Detail</CardTitle>
          <Badge variant="destructive">{job.status}</Badge>
        </div>
        <CardDescription>Inspect the failure reason and re-run this job after correcting integration state.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p>
          <span className="font-medium">Content:</span> {item?.title ?? 'Unknown content item'}
        </p>
        <p>
          <span className="font-medium">Network:</span> <span className="capitalize">{job.network}</span>
        </p>
        <p>
          <span className="font-medium">Scheduled:</span>{' '}
          <ClientFormattedDate
            date={job.scheduledFor}
            options={{ month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }}
          />
        </p>
        <p>
          <span className="font-medium">Attempts:</span> {job.attemptCount}/{job.maxAttempts}
        </p>
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-destructive">
          {job.lastError || 'No error payload found.'}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => onRetry(job.id)}>
            Retry job
          </Button>
          <Button asChild variant="ghost">
            <Link href={`/app/workspace/${workspaceId}/publishing/logs`}>Back to logs</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
