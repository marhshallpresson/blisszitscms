// src/components/workspace/WorkspaceViewWrapper.tsx
"use client";

import type { Workspace, ContentItem } from '@/contexts/WorkspaceContext';
import { getContentStatusLabel } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { ContentGrid } from '@/components/content/ContentDashboard';
import { CalendarView } from '@/components/content/CalendarView';
import { IdeaBoard } from '@/components/content/IdeaBoard';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { Plus, LayoutGrid, CalendarDays, Lightbulb, BarChartHorizontalBig, Send, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import Link from 'next/link';
import { Badge } from '../ui/badge';
import { ClientFormattedDate } from '../utils/ClientFormattedDate';
import { getNetworkCapability } from '@/lib/network-capabilities';

interface WorkspaceViewWrapperProps {
  workspace: Workspace;
  onNewContent: () => void;
  onEditContent: (item: ContentItem) => void;
  onViewDetails: (item: ContentItem) => void;
  onMarkAsPublished: (item: ContentItem) => void;
}

export const WorkspaceViewWrapper = ({ workspace, onNewContent, onEditContent, onViewDetails, onMarkAsPublished }: WorkspaceViewWrapperProps) => {
  const {
    contentItems,
    isLoadingContent,
    updateContentItem,
    publishJobs,
    isLoadingPublishJobs,
    scheduleContentItemForPublishing,
    runDuePublishJobs,
    retryPublishJob,
  } = useWorkspace();

  const approvalItems = contentItems.filter(i => i.approvalStatus === 'pending');
  const queueItems = contentItems.filter(i => i.status === 'scheduled' || i.status === 'approved');

  const handleApproval = async (item: ContentItem, approved: boolean) => {
    await updateContentItem({
      ...item,
      approvalStatus: approved ? 'approved' : 'rejected',
      status: approved ? 'approved' : 'draft'
    });
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <Card className="bg-card shadow-lg border-border/80 flex-shrink-0">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="font-headline text-3xl font-bold text-foreground">{workspace.name}</CardTitle>
              <CardDescription className="text-base text-muted-foreground mt-1">
                Brand Hub: Content planning, multi-platform engagement, and analytics.
              </CardDescription>
            </div>
            <div className="flex gap-2 items-center w-full md:w-auto">
              <Button onClick={onNewContent} className="font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
                <Plus size={18} className="mr-2" /> New Post
              </Button>
              <Button variant="outline" asChild>
                  <Link href="/app/admin">All Workspaces</Link>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="grid" className="flex-grow flex flex-col">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 mb-6 bg-card border py-2 h-auto rounded-xl shadow-sm">
          <TabsTrigger value="grid" className="py-2.5 gap-2"><LayoutGrid size={18}/> Grid</TabsTrigger>
          <TabsTrigger value="calendar" className="py-2.5 gap-2"><CalendarDays size={18}/> Calendar</TabsTrigger>
          <TabsTrigger value="ideas" className="py-2.5 gap-2"><Lightbulb size={18}/> Ideas</TabsTrigger>
          <TabsTrigger value="queue" className="py-2.5 gap-2"><Send size={18}/> Queue ({queueItems.length})</TabsTrigger>
          <TabsTrigger value="approvals" className="py-2.5 gap-2"><CheckCircle2 size={18}/> Approvals ({approvalItems.length})</TabsTrigger>
          <TabsTrigger value="analytics" className="py-2.5 gap-2"><BarChartHorizontalBig size={18}/> Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="flex-grow">
          <ContentGrid contentItems={contentItems} isLoading={isLoadingContent} onEdit={onEditContent} onViewDetails={onViewDetails} onMarkAsPublished={onMarkAsPublished} />
        </TabsContent>
        
        <TabsContent value="calendar" className="flex-grow">
          <CalendarView contentItems={contentItems} isLoading={isLoadingContent} onViewDetails={onViewDetails} />
        </TabsContent>
        
        <TabsContent value="ideas" className="flex-grow">
          <IdeaBoard />
        </TabsContent>

        <TabsContent value="queue" className="flex-grow">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Scheduled items create publish jobs per network. Run due jobs to process the queue.
              </p>
              <Button size="sm" variant="secondary" onClick={() => runDuePublishJobs()}>
                Run Due Jobs
              </Button>
            </div>
            {queueItems.length > 0 ? queueItems.map(item => (
              <Card key={item.id} className="p-4 flex items-center justify-between border-l-4 border-l-primary">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full"><Clock className="text-primary h-5 w-5" /></div>
                  <div>
                    <h4 className="font-bold">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {item.status === 'scheduled' ? 'Scheduled for' : 'Ready to schedule'}: <ClientFormattedDate date={item.dueDate} />
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {item.status === 'scheduled' && <Button variant="outline" size="sm" onClick={() => onMarkAsPublished(item)}>Publish Now</Button>}
                  {item.status === 'approved' && (
                    <Button variant="default" size="sm" onClick={() => scheduleContentItemForPublishing(item.id, item.dueDate)}>
                      Queue Publish Jobs
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => onEditContent(item)}>Reschedule</Button>
                </div>
              </Card>
            )) : <div className="text-center py-20 bg-card/50 rounded-xl border-2 border-dashed italic text-muted-foreground">The publishing queue is empty.</div>}

            <Card className="bg-card/80 border-border/70">
              <CardHeader>
                <CardTitle className="text-lg">Publish Jobs</CardTitle>
                <CardDescription>
                  Worker status per network with retry controls and capability-safe fallbacks.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingPublishJobs ? (
                  <p className="text-sm text-muted-foreground">Loading publish jobs...</p>
                ) : publishJobs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No publish jobs yet.</p>
                ) : (
                  <div className="space-y-3">
                    {publishJobs.map((job) => {
                      const capability = getNetworkCapability(job.network);
                      return (
                        <div key={job.id} className="flex flex-col gap-2 rounded-md border border-border/60 p-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="font-medium capitalize">{job.network}</p>
                            <p className="text-xs text-muted-foreground">
                              Scheduled: <ClientFormattedDate date={job.scheduledFor} options={{ month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }} />
                            </p>
                            {job.lastError && (
                              <p className="text-xs text-destructive mt-1">{job.lastError}</p>
                            )}
                            {!capability?.canPublish && (
                              <p className="text-xs text-amber-600 mt-1">Direct publish is disabled for this network in MVP.</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={job.status === 'published' ? 'default' : 'secondary'}>{job.status}</Badge>
                            {job.status === 'failed' && (
                              <Button size="sm" variant="outline" onClick={() => retryPublishJob(job.id)}>
                                Retry
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="approvals" className="flex-grow">
          <div className="space-y-4">
            {approvalItems.length > 0 ? approvalItems.map(item => (
              <Card key={item.id} className="p-4 flex items-center justify-between bg-purple-50/30 border-purple-100">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded bg-muted flex items-center justify-center font-bold text-lg">{item.title[0]}</div>
                  <div>
                    <h4 className="font-bold">{item.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-1">{item.idea} ({getContentStatusLabel(item.status)})</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onViewDetails(item)}>Review</Button>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApproval(item, true)}><CheckCircle2 className="h-4 w-4 mr-1" /> Approve</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleApproval(item, false)}><XCircle className="h-4 w-4 mr-1" /> Reject</Button>
                </div>
              </Card>
            )) : <div className="text-center py-20 bg-card/50 rounded-xl border-2 border-dashed italic text-muted-foreground">No pending approval requests.</div>}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="flex-grow">
          <AnalyticsDashboard /> 
        </TabsContent>
      </Tabs>
    </div>
  );
};
