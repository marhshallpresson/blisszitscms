// src/components/content/ContentDashboard.tsx (Now renamed to ContentGrid for clarity within WorkspaceViewWrapper)
"use client";

import type { ContentItem } from '@/contexts/WorkspaceContext';
import { CONTENT_STATUSES, getContentStatusLabel } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { ContentItemCard } from './ContentItemCard';
import { Edit3, Loader2, Search, Grip, List } from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useMemo } from 'react';

interface ContentGridProps { 
  contentItems: ContentItem[];
  isLoading: boolean;
  onEdit: (item: ContentItem) => void;
  onViewDetails: (item: ContentItem) => void;
  onMarkAsPublished: (item: ContentItem) => void;
}

export const ContentGrid = ({ 
    contentItems,
    isLoading,
    onEdit,
    onViewDetails,
    onMarkAsPublished
}: ContentGridProps) => {
  const { deleteContentItem } = useWorkspace(); // Assuming delete comes from context
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); // 'grid' or 'list'

  const filteredItems = useMemo(() => {
    return contentItems.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (item.idea && item.idea.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (item.caption && item.caption.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [contentItems, searchTerm, statusFilter]);


  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="h-[260px] flex flex-col">
            <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
            <CardContent className="flex-grow"><Skeleton className="h-4 w-full mb-2" /><Skeleton className="h-4 w-5/6" /></CardContent>
            <CardFooter><Skeleton className="h-8 w-1/2" /></CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-grow w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search content..." 
                className="pl-10 w-full bg-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px] bg-input">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {CONTENT_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {getContentStatusLabel(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
                <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('grid')} aria-label="Grid view">
                    <Grip />
                </Button>
                <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')} aria-label="List view">
                    <List />
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredItems.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
          : "space-y-4"
        }>
          {filteredItems.map(item => (
            <ContentItemCard 
              key={item.id} 
              item={item} 
              onEdit={onEdit}
              onDelete={() => deleteContentItem(item.id)}
              onViewDetails={onViewDetails}
              onMarkAsPublished={onMarkAsPublished}
              viewMode={viewMode}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed border-border/70 rounded-xl bg-card/50">
          <Edit3 size={56} className="mx-auto text-muted-foreground opacity-70" />
          <h3 className="mt-6 text-2xl font-semibold font-headline text-card-foreground">No content items found.</h3>
          <p className="mt-2 text-muted-foreground font-body">Try adjusting your filters or create new content.</p>
          {/* Add New Content button is now in WorkspaceViewWrapper */}
        </div>
      )}
    </div>
  );
};
