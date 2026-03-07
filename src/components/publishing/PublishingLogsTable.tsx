import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ClientFormattedDate } from '@/components/utils/ClientFormattedDate';
import type { ContentItem, PublishJob } from '@/contexts/WorkspaceContext';

interface PublishingLogsTableProps {
  workspaceId: string;
  jobs: PublishJob[];
  items: ContentItem[];
}

export function PublishingLogsTable({ workspaceId, jobs, items }: PublishingLogsTableProps) {
  const getItemTitle = (contentItemId: string) => items.find((item) => item.id === contentItemId)?.title ?? 'Untitled post';

  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle>Publishing Logs</CardTitle>
        <CardDescription>Audit publish attempts, retries, and external reference IDs by network.</CardDescription>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No publish jobs yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Content</TableHead>
                <TableHead>Network</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead>External Ref</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{getItemTitle(job.contentItemId)}</TableCell>
                  <TableCell className="capitalize">{job.network}</TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
                    <ClientFormattedDate
                      date={job.scheduledFor}
                      options={{ month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }}
                    />
                  </TableCell>
                  <TableCell>
                    {job.attemptCount}/{job.maxAttempts}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {job.externalPostId || '-'}
                  </TableCell>
                  <TableCell>
                    {job.lastError ? (
                      <Link
                        href={`/app/workspace/${workspaceId}/publishing/errors/${job.id}`}
                        className="text-sm text-primary underline-offset-4 hover:underline"
                      >
                        View error
                      </Link>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
