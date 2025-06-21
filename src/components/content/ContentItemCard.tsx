// src/components/content/ContentItemCard.tsx
"use client";

import type { ContentItem } from '@/contexts/WorkspaceContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit3, Trash2, Calendar, Eye, CheckCircle, MoreVertical, Image as ImageIcon, FileText, Video } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { ClientFormattedDate } from '@/components/utils/ClientFormattedDate'; 
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // For list view
import Image from 'next/image'; // For potential thumbnail
import { cn } from '@/lib/utils';

interface ContentItemCardProps {
  item: ContentItem;
  onEdit: (item: ContentItem) => void;
  onDelete: (itemId: string) => void;
  onViewDetails: (item: ContentItem) => void;
  onMarkAsPublished: (item: ContentItem) => void;
  viewMode?: 'grid' | 'list';
}

const getStatusClass = (status?: string): string => {
    switch (status) {
        case 'Draft': return 'bg-amber-100 text-amber-700 border-amber-300';
        case 'In Progress': return 'bg-sky-100 text-sky-700 border-sky-300';
        case 'For Review': return 'bg-purple-100 text-purple-700 border-purple-300';
        case 'Approved': return 'bg-lime-100 text-lime-700 border-lime-300';
        case 'Published': return 'bg-teal-100 text-teal-700 border-teal-300';
        default: return 'bg-slate-100 text-slate-700 border-slate-300';
    }
};

const getContentTypeIcon = (type?: string) => {
    // This is a placeholder. In a real app, item.type would exist.
    if (type === 'image') return <ImageIcon className="h-4 w-4 text-muted-foreground" />;
    if (type === 'video') return <Video className="h-4 w-4 text-muted-foreground" />;
    return <FileText className="h-4 w-4 text-muted-foreground" />;
}


export const ContentItemCard = ({ item, onEdit, onDelete, onViewDetails, onMarkAsPublished, viewMode = 'grid' }: ContentItemCardProps) => {
  
  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${item.title}"? This action cannot be undone.`)) {
      onDelete(item.id);
    }
  };
  
  if (viewMode === 'list') {
    return (
      <Card className="flex items-center p-4 gap-4 hover:shadow-md transition-shadow border-border/70">
        <div className="flex-shrink-0 w-16 h-16 bg-muted rounded-md flex items-center justify-center">
           {/* Placeholder for thumbnail or icon */}
           {getContentTypeIcon()}
        </div>
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <CardTitle className="font-headline text-md text-card-foreground line-clamp-1 tracking-tight hover:text-primary cursor-pointer" onClick={() => onViewDetails(item)}>{item.title}</CardTitle>
            <Badge 
                className={`px-2 py-0.5 text-xs font-semibold rounded-md border shadow-none ${getStatusClass(item.status)}`}
            >
                {item.status || 'Status'}
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{item.idea || "No description"}</CardDescription>
          <div className="flex items-center text-xs text-muted-foreground mt-1.5 gap-3">
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              Due: <ClientFormattedDate date={item.dueDate} options={{ month: 'short', day: 'numeric' }} placeholder="N/A" />
            </div>
            {/* Add more info like author if available */}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
              <MoreVertical size={18} />
              <span className="sr-only">More actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewDetails(item)}><Eye size={14} className="mr-2"/> View Details</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(item)}><Edit3 size={14} className="mr-2"/> Edit Content</DropdownMenuItem>
            {item.status !== 'Published' && (
              <DropdownMenuItem onClick={() => onMarkAsPublished(item)}><CheckCircle size={14} className="mr-2"/> Mark as Published</DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
              <Trash2 size={14} className="mr-2"/> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Card>
    );
  }

  // Grid View
  return (
    <Card 
      className="flex flex-col group transition-all duration-300 bg-card border-border/70 hover:border-primary/50 h-full shadow-lg hover:shadow-xl"
      aria-labelledby={`item-title-${item.id}`}
    >
      {/* Optional Thumbnail Area */}
      <div className="aspect-video bg-muted rounded-t-xl flex items-center justify-center overflow-hidden">
         {/* Placeholder for actual image: <Image src={item.thumbnailUrl || "https://placehold.co/300x169.png"} alt={item.title} width={300} height={169} className="object-cover w-full h-full"/> */}
         {getContentTypeIcon(undefined)} {/* Pass item.type if available */}
         <span className="sr-only">{item.title} thumbnail</span>
      </div>

      <CardHeader className="relative pb-3 pt-4 px-4">
         <Badge 
            className={`absolute top-3 right-3 px-2 py-0.5 text-xs font-semibold rounded-md border shadow-none ${getStatusClass(item.status)}`}
         >
          {item.status || 'Status'}
        </Badge>
        <CardTitle id={`item-title-${item.id}`} className="font-headline text-md text-card-foreground pr-10 line-clamp-2 tracking-tight hover:text-primary cursor-pointer" onClick={() => onViewDetails(item)}>{item.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow pt-0 px-4 pb-3">
        <p className="text-muted-foreground text-xs line-clamp-2 h-8 font-body mb-1">{item.idea || "No core idea provided."}</p>
        {item.caption && <p className="text-muted-foreground/80 text-xs line-clamp-1 h-4 font-body italic">"{item.caption}"</p>}
      </CardContent>
      <CardFooter className="pt-2 border-t border-border/60 flex justify-between items-center px-4 pb-3">
        <div className="flex items-center text-xs text-muted-foreground">
          <Calendar size={13} className="mr-1.5 text-primary/80" />
          <ClientFormattedDate date={item.dueDate} options={{ month: 'short', day: 'numeric' }} placeholder="N/A" />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 -mr-2">
              <MoreVertical size={16} />
               <span className="sr-only">More actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewDetails(item)}><Eye size={14} className="mr-2"/> View Details</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(item)}><Edit3 size={14} className="mr-2"/> Edit Content</DropdownMenuItem>
             {item.status !== 'Published' && (
                <DropdownMenuItem onClick={() => onMarkAsPublished(item)}><CheckCircle size={14} className="mr-2"/> Mark as Published</DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
              <Trash2 size={14} className="mr-2"/> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
};
