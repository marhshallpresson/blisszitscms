
"use client";

import type { ContentItem } from '@/contexts/WorkspaceContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit3, Trash2, Calendar } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"


interface ContentItemCardProps {
  item: ContentItem;
  onEdit: (item: ContentItem) => void;
  onDelete: (itemId: string) => void;
}

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'Draft': return 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300';
    case 'In Progress': return 'bg-blue-200 text-blue-800 hover:bg-blue-300';
    case 'For Review': return 'bg-purple-200 text-purple-800 hover:bg-purple-300';
    case 'Approved': return 'bg-green-200 text-green-800 hover:bg-green-300';
    case 'Published': return 'bg-teal-200 text-teal-800 hover:bg-teal-300';
    default: return 'bg-gray-200 text-gray-800 hover:bg-gray-300';
  }
}

export const ContentItemCard = ({ item, onEdit, onDelete }: ContentItemCardProps) => {
  const formattedDueDate = item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'Not set';

  return (
    <Card className="flex flex-col group shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card">
      <CardHeader className="relative pb-2">
         <Badge variant="outline" className={`absolute top-4 right-4 px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)} border-0`}>
          {item.status || 'Draft'}
        </Badge>
        <CardTitle className="font-headline text-xl mt-2 text-card-foreground pr-10 line-clamp-2">{item.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow pt-0">
        <p className="text-muted-foreground text-sm line-clamp-3 h-16 font-body">{item.idea || "No brief provided."}</p>
      </CardContent>
      <CardFooter className="pt-4 border-t border-border flex justify-between items-center">
        <div className="flex items-center text-xs text-muted-foreground">
          <Calendar size={14} className="mr-1.5" />
          Due: {formattedDueDate}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical size={16} />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(item)} className="cursor-pointer">
              <Edit3 size={16} className="mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(item.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
              <Trash2 size={16} className="mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
};
