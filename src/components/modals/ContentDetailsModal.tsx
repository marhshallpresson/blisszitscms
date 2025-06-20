// src/components/modals/ContentDetailsModal.tsx
"use client";

// This modal was for viewing content details and comments in the CMS.
// It's not directly used in the basic corporate website. Kept for reference.

// import type { ContentItem, Comment } from '@/contexts/WorkspaceContext';
import { useEffect, useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
// import { useWorkspace } from '@/contexts/WorkspaceContext'; // Simplified
// import { useAuth } from '@/contexts/AuthContext'; // Simplified
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageSquare, UserCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ClientFormattedDate } from '@/components/utils/ClientFormattedDate';

// Simplified placeholder types
interface ContentItem {
  id?: string;
  title?: string;
  idea?: string;
  script?: string;
  caption?: string;
  dueDate?: string | Date;
  status?: string;
}
interface Comment {
  id: string;
  text: string;
  authorName: string;
  createdAt: Date;
}

interface ContentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ContentItem | null;
}

export const ContentDetailsModal = ({ isOpen, onClose, item }: ContentDetailsModalProps) => {
  // const { user } = useAuth();
  // const { getComments, addComment } = useWorkspace();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    if (isOpen && item?.id) {
      setIsLoadingComments(true);
      // Placeholder: In a real CMS, this would fetch comments.
      console.log("Fetching comments for item (placeholder):", item.id);
      setTimeout(() => {
        setComments([
          {id: '1', text: 'Great idea! Looking forward to this.', authorName: 'Team Member A', createdAt: new Date()},
          {id: '2', text: 'Script needs a bit more punch in the CTA.', authorName: 'Team Member B', createdAt: new Date()},
        ]);
        setIsLoadingComments(false);
      }, 1000);
    } else {
      setComments([]); 
    }
  }, [isOpen, item]);

  const handleAddComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !item?.id /*|| !user*/) return;
    setIsSubmittingComment(true);
    console.log("Adding comment (placeholder):", newComment);
    await new Promise(resolve => setTimeout(resolve, 500));
    // toast({ title: "Action (Demo)", description: "Commenting is a CMS feature." });
    setNewComment('');
    setIsSubmittingComment(false);
  };

  if (!isOpen || !item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-card max-h-[90vh] flex flex-col opacity-70 pointer-events-none">
        <DialogHeader className="pb-4 border-b">
          <div className="flex justify-between items-start">
            <DialogTitle className="font-headline text-card-foreground text-2xl leading-tight break-words">{item.title || "Content Title (Demo)"}</DialogTitle>
            <Badge variant="outline" className={`ml-4 px-3 py-1 text-xs font-semibold rounded-full border-0 whitespace-nowrap`}>
              {item.status || 'Status'}
            </Badge>
          </div>
          {item.dueDate && <DialogDescription className="text-sm text-muted-foreground">Due: <ClientFormattedDate date={item.dueDate} /></DialogDescription>}
        </DialogHeader>
        
        <ScrollArea className="flex-grow my-4 pr-3">
          <div className="space-y-6">
            <p className="text-center text-muted-foreground italic">Content Details Modal (CMS Feature - Placeholder)</p>
            {/* Details sections for idea, script, caption are structurally kept but data is placeholder */}
            {item.idea && (
              <div><Label className="font-semibold text-primary">Core Idea</Label><p className="mt-1 text-muted-foreground">{item.idea}</p></div>
            )}
            {/* ... other fields ... */}
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-semibold text-lg text-primary flex items-center gap-2"><MessageSquare size={20}/> Team Comments (Demo)</h4>
              {/* Comments section disabled */}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="sticky bottom-0 bg-card pt-4 border-t">
          <DialogClose asChild><Button type="button" variant="outline" onClick={onClose}>Close</Button></DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
