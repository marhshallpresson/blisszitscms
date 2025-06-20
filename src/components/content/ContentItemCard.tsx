// src/components/content/ContentItemCard.tsx
"use client";

// This component was part of the CMS dashboard.
// For the corporate website, it's not directly used to display CMS content.
// It might be repurposed for blog post cards or portfolio items if those features are added.

// import type { ContentItem } from '@/contexts/WorkspaceContext'; // ContentItem type is simplified
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit3, Trash2, Calendar, Eye, CheckCircle, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { ClientFormattedDate } from '@/components/utils/ClientFormattedDate'; 

// Simplified placeholder type
interface ContentItem {
  id: string;
  title: string;
  idea?: string;
  caption?: string;
  status?: string;
  dueDate?: string | Date;
}


interface ContentItemCardProps {
  item: ContentItem; // Using simplified placeholder
  // CMS-specific actions removed
  // onEdit: (item: ContentItem) => void;
  // onDelete: (itemId: string) => void;
  // onViewDetails: (item: ContentItem) => void;
  // onMarkAsPublished: (item: ContentItem) => void;
}

const getStatusClass = (status?: string): string => {
    // Status colors are kept for potential reuse (e.g., blog post status)
    switch (status) {
        case 'Draft': return 'bg-amber-500 hover:bg-amber-600 text-white';
        case 'In Progress': return 'bg-sky-500 hover:bg-sky-600 text-white';
        case 'For Review': return 'bg-purple-500 hover:bg-purple-600 text-white';
        case 'Approved': return 'bg-lime-600 hover:bg-lime-700 text-white';
        case 'Published': return 'bg-teal-500 hover:bg-teal-600 text-primary-foreground';
        default: return 'bg-slate-400 hover:bg-slate-500 text-white';
    }
};


export const ContentItemCard = ({ item /*, onEdit, onDelete, onViewDetails, onMarkAsPublished */ }: ContentItemCardProps) => {

  return (
    <Card 
      className="flex flex-col group transition-all duration-300 bg-card border-border/70 hover:border-primary/50 h-full shadow-lg hover:shadow-xl"
      aria-labelledby={`item-title-${item.id}`}
    >
      <CardHeader className="relative pb-3 pt-5 px-5">
         <Badge 
            className={`absolute top-4 right-4 px-2.5 py-1 text-xs font-semibold rounded-md border-0 shadow-sm ${getStatusClass(item.status)}`}
         >
          {item.status || 'Info'}
        </Badge>
        <CardTitle id={`item-title-${item.id}`} className="font-headline text-lg text-card-foreground pr-10 line-clamp-2 tracking-tight">{item.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow pt-0 px-5 pb-4">
        <p className="text-muted-foreground text-sm line-clamp-2 h-10 font-body mb-1">{item.idea || "Description placeholder."}</p>
        {item.caption && <p className="text-muted-foreground/80 text-xs line-clamp-1 h-5 font-body italic">"{item.caption}"</p>}
      </CardContent>
      <CardFooter className="pt-3 border-t border-border/60 flex justify-between items-center px-5 pb-4">
        <div className="flex items-center text-xs text-muted-foreground">
          <Calendar size={14} className="mr-1.5 text-primary" />
          Date: <ClientFormattedDate date={item.dueDate || new Date()} options={{ month: 'short', day: 'numeric' }} placeholder="N/A" />
        </div>
        {/* Dropdown menu simplified as actions are CMS-specific */}
        <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
            Read More
        </Button>
      </CardFooter>
    </Card>
  );
};
