
"use client";

import type { ContentItem } from '@/contexts/WorkspaceContext';
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


interface ContentItemCardProps {
  item: ContentItem;
  onEdit: (item: ContentItem) => void;
  onDelete: (itemId: string) => void;
  onViewDetails: (item: ContentItem) => void;
  onMarkAsPublished: (item: ContentItem) => void;
}

const getStatusClass = (status?: string): string => {
    switch (status) {
        case 'Draft': return 'bg-amber-500 hover:bg-amber-600 text-white';
        case 'In Progress': return 'bg-sky-500 hover:bg-sky-600 text-white';
        case 'For Review': return 'bg-purple-500 hover:bg-purple-600 text-white';
        case 'Approved': return 'bg-lime-600 hover:bg-lime-700 text-white';
        case 'Published': return 'bg-teal-500 hover:bg-teal-600 text-primary-foreground';
        default: return 'bg-slate-400 hover:bg-slate-500 text-white';
    }
};


export const ContentItemCard = ({ item, onEdit, onDelete, onViewDetails, onMarkAsPublished }: ContentItemCardProps) => {

  return (
    <Card 
      className="flex flex-col group transition-all duration-300 bg-card border-border/70 hover:border-primary/50 h-full shadow-lg hover:shadow-xl"
      aria-labelledby={`item-title-${item.id}`}
    >
      <CardHeader className="relative pb-3 pt-5 px-5">
         <Badge 
            className={`absolute top-4 right-4 px-2.5 py-1 text-xs font-semibold rounded-md border-0 shadow-sm ${getStatusClass(item.status)}`}
         >
          {item.status || 'Draft'}
        </Badge>
        <CardTitle id={`item-title-${item.id}`} className="font-headline text-lg text-card-foreground pr-10 line-clamp-2 tracking-tight">{item.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow pt-0 px-5 pb-4">
        <p className="text-muted-foreground text-sm line-clamp-2 h-10 font-body mb-1">{item.idea || "No brief provided."}</p>
        {item.caption && <p className="text-muted-foreground/80 text-xs line-clamp-1 h-5 font-body italic">"{item.caption}"</p>}
      </CardContent>
      <CardFooter className="pt-3 border-t border-border/60 flex justify-between items-center px-5 pb-4">
        <div className="flex items-center text-xs text-muted-foreground">
          <Calendar size={14} className="mr-1.5 text-primary" />
          Due: <ClientFormattedDate date={item.dueDate} options={{ month: 'short', day: 'numeric' }} placeholder="Not set" />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-muted/50" aria-label={`More options for ${item.title}`}>
              <MoreVertical size={18} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border shadow-xl w-56">
            <DropdownMenuItem onClick={() => onViewDetails(item)} className="cursor-pointer group py-2">
              <Eye size={16} className="mr-2 text-primary group-hover:text-primary/90" /> View Details & Comments
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(item)} className="cursor-pointer group py-2">
              <Edit3 size={16} className="mr-2 text-primary group-hover:text-primary/90" /> Edit Content
            </DropdownMenuItem>
            {item.status !== 'Published' && (
              <DropdownMenuItem onClick={() => onMarkAsPublished(item)} className="cursor-pointer group py-2">
                <CheckCircle size={16} className="mr-2 text-teal-500 group-hover:text-teal-600" /> Mark as Published
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator className="bg-border/70 my-1" />
            <DropdownMenuItem onClick={() => onDelete(item.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer group py-2">
              <Trash2 size={16} className="mr-2 group-hover:text-destructive/90" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
};
