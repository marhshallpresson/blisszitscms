
"use client";

import type { Workspace, ContentItem } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { ContentItemCard } from './ContentItemCard';
import { Plus, ArrowLeft, Edit3 } from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
// Note: CalendarView and IdeaBoardView will be implemented in a future iteration.
// For now, this dashboard focuses on the grid view of content items.

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
    <div className="p-4 md:p-8">
      <Button onClick={onBack} variant="link" className="text-primary font-semibold mb-6 flex items-center gap-2 px-0 hover:underline">
        <ArrowLeft size={18}/> Back to Workspaces
      </Button>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-foreground font-headline">{workspace.name}</h1>
          <p className="text-lg text-muted-foreground mt-2 font-body">{workspace.description || 'Your content pipeline at a glance.'}</p>
        </div>
        <Button onClick={onNewContent} className="font-bold whitespace-nowrap">
          <Plus size={20} className="mr-2" /> New Content
        </Button>
      </div>
      
      {/* Placeholder for future Tabs (Grid, Calendar, Idea Board) */}
      {/* <div className="my-6">Tabs will go here</div> */}

      {isLoadingContent ? (
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="w-full" aria-label="Loading content item">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/4 mt-1" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
                 <Skeleton className="h-3 w-full mt-2 mb-1" />
                 <Skeleton className="h-3 w-5/6" />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : contentItems.length > 0 ? (
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
    </div>
  );
};
