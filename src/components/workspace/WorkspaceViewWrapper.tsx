
"use client";

import type { Workspace, ContentItem } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { ContentGrid } from '@/components/content/ContentDashboard'; // Corrected import path
import { CalendarView } from '@/components/content/CalendarView';
import { IdeaBoard } from '@/components/content/IdeaBoard';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard'; 
import { Plus, LayoutGrid, CalendarDays, Lightbulb, BarChartHorizontalBig } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkspace } from '@/contexts/WorkspaceContext'; 

interface WorkspaceViewWrapperProps {
  workspace: Workspace;
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
  const { contentItems, isLoadingContent, ideas, isLoadingIdeas } = useWorkspace();

  return (
    <div className="p-4 md:p-8 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-foreground font-headline">{workspace.name}</h1>
          <p className="text-lg text-muted-foreground mt-2 font-body">{workspace.description || 'Manage your content pipeline for this workspace.'}</p>
        </div>
        <Button onClick={onNewContent} className="font-bold whitespace-nowrap">
          <Plus size={20} className="mr-2" /> New Content Item
        </Button>
      </div>
      
      <Tabs defaultValue="grid" className="flex-grow flex flex-col">
        <TabsList className="mb-4 self-start sticky top-0 bg-background z-10 py-2">
          <TabsTrigger value="grid" className="flex items-center gap-2"><LayoutGrid size={16}/> Content Grid</TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2"><CalendarDays size={16}/> Calendar</TabsTrigger>
          <TabsTrigger value="ideaboard" className="flex items-center gap-2"><Lightbulb size={16}/> Idea Board</TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2"><BarChartHorizontalBig size={16}/> Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="flex-grow overflow-y-auto">
          <ContentGrid
            onNewContent={onNewContent}
            onEditContent={onEditContent}
            onViewDetails={onViewDetails}
            onMarkAsPublished={onMarkAsPublished}
          />
        </TabsContent>

        <TabsContent value="calendar" className="flex-grow overflow-y-auto">
          <CalendarView 
            contentItems={contentItems} 
            onViewDetails={onViewDetails}
            isLoading={isLoadingContent}
          />
        </TabsContent>

        <TabsContent value="ideaboard" className="flex-grow overflow-y-auto">
          <IdeaBoard />
        </TabsContent>
        
        <TabsContent value="analytics" className="flex-grow overflow-y-auto">
           <div className="bg-card p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-foreground font-headline mb-4">Workspace Analytics for "{workspace.name}"</h2>
            <p className="text-muted-foreground mb-4">
              This section displays analytics specific to the current workspace. 
              (Note: Data is currently illustrative and not live workspace-specific data.)
            </p>
            <AnalyticsDashboard /> {/* This is the general analytics, will show placeholder */}
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
