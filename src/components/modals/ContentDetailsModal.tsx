
// src/components/modals/ContentDetailsModal.tsx
"use client";

import type { ContentItem, Comment } from '@/contexts/WorkspaceContext';
import { useEffect, useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageSquare, UserCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ClientFormattedDate } from '@/components/utils/ClientFormattedDate';
import { useToast } from '@/hooks/use-toast';

interface ContentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ContentItem | null;
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

export const ContentDetailsModal = ({ isOpen, onClose, item }: ContentDetailsModalProps) => {
  const { user } = useAuth();
  const { getComments, addComment } = useWorkspace();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    if (isOpen && item?.id) {
      setIsLoadingComments(true);
      const unsubscribe = getComments(item.id, (fetchedComments) => {
        setComments(fetchedComments);
        setIsLoadingComments(false);
      });
      return () => unsubscribe();
    } else {
      setComments([]); 
    }
  }, [isOpen, item, getComments]);

  const handleAddComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !item?.id || !user) return;
    setIsSubmittingComment(true);
    try {
        await addComment(item.id, newComment);
        setNewComment('');
        toast({ title: "Comment Added" });
    } catch (error: any) {
        toast({ title: "Error", description: error.message || "Failed to add comment.", variant: "destructive" });
    } finally {
        setIsSubmittingComment(false);
    }
  };

  if (!isOpen || !item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-card max-h-[90vh] flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <div className="flex justify-between items-start gap-4">
            <DialogTitle className="font-headline text-card-foreground text-2xl leading-tight break-words">{item.title}</DialogTitle>
            {item.status && (
              <Badge variant="outline" className={`ml-4 px-3 py-1 text-xs font-semibold rounded-full border whitespace-nowrap ${getStatusClass(item.status)}`}>
                {item.status}
              </Badge>
            )}
          </div>
          {item.dueDate && <DialogDescription className="text-sm text-muted-foreground">Due: <ClientFormattedDate date={item.dueDate} /></DialogDescription>}
        </DialogHeader>
        
        <ScrollArea className="flex-grow my-4 pr-3">
          <div className="space-y-6">
            {item.idea && (
              <div><Label className="font-semibold text-primary">Core Idea</Label><p className="mt-1 text-muted-foreground whitespace-pre-wrap">{item.idea}</p></div>
            )}
            {item.script && (
              <div><Label className="font-semibold text-primary">Script</Label><p className="mt-1 text-muted-foreground whitespace-pre-wrap">{item.script}</p></div>
            )}
            {item.caption && (
              <div><Label className="font-semibold text-primary">Caption</Label><p className="mt-1 text-muted-foreground whitespace-pre-wrap">{item.caption}</p></div>
            )}
            
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-semibold text-lg text-primary flex items-center gap-2"><MessageSquare size={20}/> Team Comments</h4>
              {isLoadingComments ? (
                <div className="flex items-center justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-primary"/></div>
              ) : comments.length > 0 ? (
                <div className="space-y-4">
                    {comments.map(comment => (
                        <div key={comment.id} className="flex items-start gap-3">
                            <UserCircle className="h-8 w-8 text-muted-foreground flex-shrink-0 mt-1"/>
                            <div className="bg-muted/70 p-3 rounded-lg flex-grow">
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold text-sm text-card-foreground">{comment.authorName}</p>
                                    <p className="text-xs text-muted-foreground"><ClientFormattedDate date={comment.createdAt} options={{month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'}}/></p>
                                </div>
                                <p className="text-sm text-card-foreground mt-1">{comment.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No comments yet. Be the first to leave one!</p>
              )}
               <form onSubmit={handleAddComment} className="flex items-start gap-3 pt-4">
                  <Textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add a comment..." rows={2} className="bg-input" />
                  <Button type="submit" size="icon" disabled={isSubmittingComment || !newComment.trim()}>
                      {isSubmittingComment ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4" />}
                  </Button>
               </form>
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
