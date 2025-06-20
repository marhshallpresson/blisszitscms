
"use client";

// This component is now the "Content Grid" view within WorkspaceViewWrapper
import type { ContentItem } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { ContentItemCard } from './ContentItemCard';
import { Plus, Edit3 } from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';


interface ContentGridProps { // Renamed from ContentDashboardProps
  // workspace is no longer needed here as it's handled by WorkspaceViewWrapper
  onNewContent: () => void;
  onEditContent: (item: ContentItem) => void;
  onViewDetails: (item: ContentItem) => void;
  onMarkAsPublished: (item: ContentItem) => void;
}

export const ContentGrid = ({ // Renamed from ContentDashboard
    onNewContent, 
    onEditContent,
    onViewDetails,
    onMarkAsPublished
}: ContentGridProps) => {
  const { contentItems, isLoadingContent, deleteContentItem } = useWorkspace();

  return (
    <div className="h-full flex flex-col p-1 md:p-0">
      {isLoadingContent ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => ( // Increased skeleton items
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
        <div className="flex-grow flex flex-col items-center justify-center text-center py-16 border-2 border-dashed border-border rounded-2xl bg-card/50">
            <Edit3 size={48} className="mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold font-headline text-card-foreground">No content yet in this workspace.</h3>
            <p className="mt-1 text-muted-foreground font-body">Start by adding your first piece of content.</p>
            <Button onClick={onNewContent} className="mt-6 font-bold">
                <Plus size={20} className="mr-2" /> Add Content
            </Button>
        </div>
      )}
    </div>
  );
};
