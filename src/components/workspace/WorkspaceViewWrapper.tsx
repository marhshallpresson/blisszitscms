// src/components/workspace/WorkspaceViewWrapper.tsx
"use client";

import type { Workspace, ContentItem } from '@/contexts/WorkspaceContext';
import { getContentStatusLabel } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { ContentGrid } from '@/components/content/ContentDashboard';
import { CalendarView } from '@/components/content/CalendarView';
import { IdeaBoard } from '@/components/content/IdeaBoard';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { Plus, LayoutGrid, CalendarDays, Lightbulb, BarChartHorizontalBig, Send, CheckCircle2, XCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import Link from 'next/link';
import { QueueMonitor } from '@/components/publishing/QueueMonitor';

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
        <div className="sticky top-0 z-10 -mx-2 mb-4 overflow-x-auto bg-secondary/70 px-2 pb-2 pt-1 backdrop-blur-sm">
          <TabsList className="inline-flex h-auto min-w-max gap-1 rounded-xl border bg-card p-1.5 shadow-sm">
            <TabsTrigger value="grid" className="py-2.5 gap-2"><LayoutGrid size={18}/> Grid</TabsTrigger>
            <TabsTrigger value="calendar" className="py-2.5 gap-2"><CalendarDays size={18}/> Calendar</TabsTrigger>
            <TabsTrigger value="ideas" className="py-2.5 gap-2"><Lightbulb size={18}/> Ideas</TabsTrigger>
            <TabsTrigger value="queue" className="py-2.5 gap-2"><Send size={18}/> Queue ({queueItems.length})</TabsTrigger>
            <TabsTrigger value="approvals" className="py-2.5 gap-2"><CheckCircle2 size={18}/> Approvals ({approvalItems.length})</TabsTrigger>
            <TabsTrigger value="analytics" className="py-2.5 gap-2"><BarChartHorizontalBig size={18}/> Insights</TabsTrigger>
          </TabsList>
        </div>

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
          <QueueMonitor
            queueItems={queueItems}
            publishJobs={publishJobs}
            isLoadingPublishJobs={isLoadingPublishJobs}
            onRunDueJobs={runDuePublishJobs}
            onRetryJob={retryPublishJob}
            onSchedulePublish={(item) => scheduleContentItemForPublishing(item.id, item.dueDate)}
            onMarkAsPublished={onMarkAsPublished}
            onEditContent={onEditContent}
          />
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
