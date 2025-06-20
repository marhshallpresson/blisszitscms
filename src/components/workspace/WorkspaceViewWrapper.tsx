
"use client";

import type { Workspace, ContentItem } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { ContentGrid } from '@/components/content/ContentDashboard';
import { CalendarView } from '@/components/content/CalendarView';
import { IdeaBoard } from '@/components/content/IdeaBoard';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { Plus, LayoutGrid, CalendarDays, Lightbulb, BarChartHorizontalBig, FileText, Palette } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
  const { contentItems, isLoadingContent } = useWorkspace();

  return (
    <div className="h-full flex flex-col space-y-6">
      <Card className="shadow-lg border-border/80">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                 <Palette className="w-8 h-8 text-primary" />
                 <CardTitle className="text-3xl md:text-4xl font-bold text-foreground font-headline">{workspace.name}</CardTitle>
              </div>
              <CardDescription className="text-base text-muted-foreground font-body ml-11">{workspace.description || 'Manage your content pipeline for this workspace.'}</CardDescription>
            </div>
            <Button onClick={onNewContent} size="lg" className="font-bold whitespace-nowrap shadow-md hover:shadow-lg transition-shadow self-start md:self-center">
              <Plus size={22} className="mr-2" /> New Content
            </Button>
          </div>
        </CardHeader>
      </Card>
      
      <Tabs defaultValue="grid" className="flex-grow flex flex-col">
        <TabsList className="mb-6 self-start sticky top-[70px] md:top-4 bg-card p-2 rounded-lg shadow border z-10">
          <TabsTrigger value="grid" className="flex items-center gap-2 px-4 py-2 text-sm md:text-base">
            <LayoutGrid size={18}/> Content Grid
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2 px-4 py-2 text-sm md:text-base">
            <CalendarDays size={18}/> Calendar
          </TabsTrigger>
          <TabsTrigger value="ideaboard" className="flex items-center gap-2 px-4 py-2 text-sm md:text-base">
            <Lightbulb size={18}/> Idea Board
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2 px-4 py-2 text-sm md:text-base">
            <BarChartHorizontalBig size={18}/> Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="flex-grow overflow-y-auto rounded-lg">
          <ContentGrid
            onNewContent={onNewContent}
            onEditContent={onEditContent}
            onViewDetails={onViewDetails}
            onMarkAsPublished={onMarkAsPublished}
          />
        </TabsContent>

        <TabsContent value="calendar" className="flex-grow overflow-y-auto p-1">
          <CalendarView 
            contentItems={contentItems} 
            onViewDetails={onViewDetails}
            isLoading={isLoadingContent}
          />
        </TabsContent>

        <TabsContent value="ideaboard" className="flex-grow overflow-y-auto p-1">
          <IdeaBoard />
        </TabsContent>
        
        <TabsContent value="analytics" className="flex-grow overflow-y-auto">
           <Card className="bg-card p-4 md:p-6 rounded-lg shadow-lg border-border/80">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-7 h-7 text-primary" />
              <h2 className="text-2xl font-bold text-foreground font-headline">Workspace Analytics: "{workspace.name}"</h2>
            </div>
            <p className="text-muted-foreground mb-6 font-body">
              This section displays analytics specific to the current workspace. 
              (Note: Data is currently illustrative and not live workspace-specific data.)
            </p>
            <AnalyticsDashboard />
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
