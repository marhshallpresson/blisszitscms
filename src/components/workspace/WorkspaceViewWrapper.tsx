// src/components/workspace/WorkspaceViewWrapper.tsx
"use client";

import type { Workspace, ContentItem } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { ContentGrid } from '@/components/content/ContentDashboard'; // Corrected import
import { CalendarView } from '@/components/content/CalendarView';
import { IdeaBoard } from '@/components/content/IdeaBoard';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { Plus, LayoutGrid, CalendarDays, Lightbulb, BarChartHorizontalBig } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useWorkspace } from '@/contexts/WorkspaceContext'; // For accessing content items
import Link from 'next/link';

interface WorkspaceViewWrapperProps {
  workspace: Workspace; // This will be the currently active workspace
  onNewContent: () => void;
  onEditContent: (item: ContentItem) => void;
  onViewDetails: (item: ContentItem) => void;
  onMarkAsPublished: (item: ContentItem) => void;
}

export const WorkspaceViewWrapper = ({ 
    workspace, 
    onNewContent, 
    onEditContent,
    onViewDetails,
    onMarkAsPublished
}: WorkspaceViewWrapperProps) => {
  const { contentItems, isLoadingContent } = useWorkspace(); // Get content items for this workspace

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h1 className="font-headline text-3xl font-bold text-foreground">{workspace.name}</h1>
          <p className="text-muted-foreground mt-1">
            {workspace.description || "Manage your content, ideas, and track performance for this workspace."}
          </p>
        </div>
        <div className="flex gap-2 items-center w-full md:w-auto">
          <Button onClick={onNewContent} className="font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md flex-grow md:flex-grow-0">
            <Plus size={18} className="mr-2" /> Add New Content
          </Button>
            {/* Optional: Link back to all workspaces */}
          <Button variant="outline" asChild className="flex-grow md:flex-grow-0">
              <Link href="/app/admin">All Workspaces</Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="grid" className="flex-grow flex flex-col">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6 bg-card border py-2 h-auto">
          <TabsTrigger value="grid" className="py-2.5 text-sm font-medium gap-2"><LayoutGrid size={18}/> Content Grid</TabsTrigger>
          <TabsTrigger value="calendar" className="py-2.5 text-sm font-medium gap-2"><CalendarDays size={18}/> Calendar</TabsTrigger>
          <TabsTrigger value="ideas" className="py-2.5 text-sm font-medium gap-2"><Lightbulb size={18}/> Idea Board</TabsTrigger>
          <TabsTrigger value="analytics" className="py-2.5 text-sm font-medium gap-2"><BarChartHorizontalBig size={18}/> Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="flex-grow">
          <ContentGrid 
            contentItems={contentItems} 
            isLoading={isLoadingContent}
            onEdit={onEditContent} 
            onViewDetails={onViewDetails}
            onMarkAsPublished={onMarkAsPublished}
          />
        </TabsContent>
        <TabsContent value="calendar" className="flex-grow">
          <CalendarView 
            contentItems={contentItems}
            isLoading={isLoadingContent}
            onViewDetails={onViewDetails}
          />
        </TabsContent>
        <TabsContent value="ideas" className="flex-grow">
          <IdeaBoard />
        </TabsContent>
        <TabsContent value="analytics" className="flex-grow">
          {/* This analytics dashboard is general for now. Could be adapted for workspace-specific data */}
          <AnalyticsDashboard /> 
          <Card className="mt-4"><CardContent className="p-4 text-sm text-muted-foreground">Workspace-specific analytics coming soon.</CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
