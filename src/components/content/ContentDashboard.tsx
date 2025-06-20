
"use client";

import type { Workspace, ContentItem } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { ContentItemCard } from './ContentItemCard';
import { CalendarView } from './CalendarView';
import { IdeaBoard } from './IdeaBoard';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard'; // For the analytics tab
import { Plus, ArrowLeft, Edit3, LayoutGrid, CalendarDays, Lightbulb, BarChartHorizontalBig } from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ContentDashboardProps {
  workspace: Workspace;
  onBack: () => void;
  onNewContent: () => void;
  onEditContent: (item: ContentItem) => void;
  onViewDetails: (item: ContentItem) => void;
  onMarkAsPublished: (item: ContentItem) => void;
}

export const ContentDashboard = ({ 
    workspace, 
    onBack, 
    onNewContent, 
    onEditContent,
    onViewDetails,
    onMarkAsPublished
}: ContentDashboardProps) => {
  const { contentItems, isLoadingContent, deleteContentItem } = useWorkspace();

  return (
    <div className="p-4 md:p-8 h-full flex flex-col">
      <Button onClick={onBack} variant="link" className="text-primary font-semibold mb-6 flex items-center gap-2 px-0 hover:underline self-start">
        <ArrowLeft size={18}/> Back to Workspaces
      </Button>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-foreground font-headline">{workspace.name}</h1>
          <p className="text-lg text-muted-foreground mt-2 font-body">{workspace.description || 'Your content pipeline at a glance.'}</p>
        </div>
        <Button onClick={onNewContent} className="font-bold whitespace-nowrap">
          <Plus size={20} className="mr-2" /> New Content
        </Button>
      </div>
      
      <Tabs defaultValue="grid" className="flex-grow flex flex-col">
        <TabsList className="mb-4 self-start">
          <TabsTrigger value="grid" className="flex items-center gap-2"><LayoutGrid size={16}/> Content Grid</TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2"><CalendarDays size={16}/> Calendar</TabsTrigger>
          <TabsTrigger value="ideaboard" className="flex items-center gap-2"><Lightbulb size={16}/> Idea Board</TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2"><BarChartHorizontalBig size={16}/> Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="flex-grow overflow-y-auto">
          {isLoadingContent ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="w-full" aria-label="Loading content item">
                  <CardHeader> <Skeleton className="h-6 w-3/4" /> <Skeleton className="h-4 w-1/4 mt-1" /> </CardHeader>
                  <CardContent> <Skeleton className="h-4 w-full mb-2" /> <Skeleton className="h-4 w-5/6" /> <Skeleton className="h-3 w-full mt-2 mb-1" /> <Skeleton className="h-3 w-5/6" /> </CardContent>
                  <CardFooter className="flex justify-between"> <Skeleton className="h-4 w-1/3" /> <Skeleton className="h-8 w-8 rounded-md" /> </CardFooter>
                </Card>
              ))}
            </div>
          ) : contentItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {contentItems.map(item => (
                <ContentItemCard 
                  key={item.id} 
                  item={item} 
                  onEdit={() => onEditContent(item)} 
                  onDelete={() => deleteContentItem(item.id)}
                  onViewDetails={() => onViewDetails(item)}
                  onMarkAsPublished={() => onMarkAsPublished(item)}
                />
              ))}
            </div>
          ) : (
            <div className="mt-10 text-center py-16 border-2 border-dashed border-border rounded-2xl bg-card">
                <Edit3 size={48} className="mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-xl font-semibold font-headline text-card-foreground">No content yet</h3>
                <p className="mt-1 text-muted-foreground font-body">Start by adding your first piece of content to this workspace.</p>
                <Button onClick={onNewContent} className="mt-6 font-bold">
                    <Plus size={20} className="mr-2" /> Add Content
                </Button>
            </div>
          )}
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
           <AnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

    