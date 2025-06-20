
"use client";

import type { Workspace, ContentItem } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { ContentGrid } from '@/components/content/ContentDashboard'; // Corrected import
import { CalendarView } from '@/components/content/CalendarView';
import { IdeaBoard } from '@/components/content/IdeaBoard';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard'; // Using general for now
import { Plus, LayoutGrid, CalendarDays, Lightbulb, BarChartHorizontalBig, Palette } from 'lucide-react';
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
      <Card className="shadow-lg border-border/80 bg-card">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                 <Palette className="w-7 h-7 md:w-8 md:h-8 text-primary" />
                 <CardTitle className="text-2xl md:text-3xl font-bold text-foreground font-headline">{workspace.name}</CardTitle>
              </div>
              <CardDescription className="text-sm md:text-base text-muted-foreground font-body md:ml-11">{workspace.description || 'Manage your content pipeline for this workspace.'}</CardDescription>
            </div>
            <Button onClick={onNewContent} size="lg" className="font-bold whitespace-nowrap shadow-md hover:shadow-lg transition-shadow self-start md:self-center mt-3 md:mt-0">
              <Plus size={20} className="mr-2" /> New Content
            </Button>
          </div>
        </CardHeader>
      </Card>
      
      <Tabs defaultValue="grid" className="flex-grow flex flex-col">
        <TabsList className="mb-6 self-start sticky top-[68px] md:top-4 bg-card p-1.5 rounded-lg shadow-sm border z-10">
          <TabsTrigger value="grid" className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm">
            <LayoutGrid size={16}/> Content Grid
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm">
            <CalendarDays size={16}/> Calendar
          </TabsTrigger>
          <TabsTrigger value="ideaboard" className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm">
            <Lightbulb size={16}/> Idea Board
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm">
            <BarChartHorizontalBig size={16}/> Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="flex-grow overflow-y-auto rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0">
          <ContentGrid
            onNewContent={onNewContent}
            onEditContent={onEditContent}
            onViewDetails={onViewDetails}
            onMarkAsPublished={onMarkAsPublished}
          />
        </TabsContent>

        <TabsContent value="calendar" className="flex-grow overflow-y-auto p-1 focus-visible:ring-0 focus-visible:ring-offset-0">
          <CalendarView 
            contentItems={contentItems} 
            onViewDetails={onViewDetails}
            isLoading={isLoadingContent}
          />
        </TabsContent>

        <TabsContent value="ideaboard" className="flex-grow overflow-y-auto p-1 focus-visible:ring-0 focus-visible:ring-offset-0">
          <IdeaBoard />
        </TabsContent>
        
        <TabsContent value="analytics" className="flex-grow overflow-y-auto focus-visible:ring-0 focus-visible:ring-offset-0">
           <Card className="bg-card p-4 md:p-6 rounded-xl shadow-lg border-border/80">
            <div className="flex items-center gap-3 mb-2">
              <BarChartHorizontalBig className="w-6 h-6 md:w-7 md:h-7 text-primary" />
              <h2 className="text-xl md:text-2xl font-bold text-foreground font-headline">Workspace Analytics: "{workspace.name}"</h2>
            </div>
            <p className="text-muted-foreground mb-6 font-body text-sm md:text-base">
              Performance insights for this workspace. (Data is illustrative)
            </p>
            <AnalyticsDashboard />
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
