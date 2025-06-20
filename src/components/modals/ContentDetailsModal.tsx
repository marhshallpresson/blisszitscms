
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

interface ContentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ContentItem | null;
}

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'Draft': return 'bg-yellow-200 text-yellow-800';
    case 'In Progress': return 'bg-blue-200 text-blue-800';
    case 'For Review': return 'bg-purple-200 text-purple-800';
    case 'Approved': return 'bg-green-200 text-green-800';
    case 'Published': return 'bg-teal-200 text-teal-800';
    default: return 'bg-gray-200 text-gray-800';
  }
};

export const ContentDetailsModal = ({ isOpen, onClose, item }: ContentDetailsModalProps) => {
  const { user } = useAuth();
  const { getComments, addComment } = useWorkspace();
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
    } catch (error) {
      console.error("Error adding comment:", error);
      // Consider adding a toast here
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-card max-h-[90vh] flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <div className="flex justify-between items-start">
            <DialogTitle className="font-headline text-card-foreground text-2xl leading-tight break-words">{item.title}</DialogTitle>
            <Badge variant="outline" className={`ml-4 px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)} border-0 whitespace-nowrap`}>
              {item.status || 'N/A'}
            </Badge>
          </div>
          {item.dueDate && <DialogDescription className="text-sm text-muted-foreground">Due: <ClientFormattedDate date={item.dueDate} /></DialogDescription>}
        </DialogHeader>
        
        <ScrollArea className="flex-grow my-4 pr-3">
          <div className="space-y-6">
            {item.idea && (
              <div>
                <Label className="font-semibold text-primary">Core Idea / Brief</Label>
                <p className="mt-1 text-muted-foreground whitespace-pre-wrap">{item.idea}</p>
              </div>
            )}
            {item.script && (
              <div>
                <Label className="font-semibold text-primary">Script / Body</Label>
                <pre className="mt-1 p-3 bg-muted/50 rounded-md text-sm text-muted-foreground whitespace-pre-wrap font-sans max-h-60 overflow-y-auto">{item.script}</pre>
              </div>
            )}
            {item.caption && (
              <div>
                <Label className="font-semibold text-primary">Social Media Caption</Label>
                <pre className="mt-1 p-3 bg-muted/50 rounded-md text-sm text-muted-foreground whitespace-pre-wrap font-sans max-h-40 overflow-y-auto">{item.caption}</pre>
              </div>
            )}

            
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-semibold text-lg text-primary flex items-center gap-2"><MessageSquare size={20}/> Team Comments</h4>
              {isLoadingComments ? (
                 <div className="flex items-center justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : comments.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {comments.map(comment => (
                    <div key={comment.id} className="bg-muted/50 p-3 rounded-lg shadow-sm">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <p className="font-semibold text-foreground flex items-center gap-1.5">
                           <UserCircle size={14} /> {comment.authorName}
                        </p>
                        <p className="text-muted-foreground"><ClientFormattedDate date={comment.createdAt} options={{dateStyle: 'short', timeStyle: 'short'}}/></p>
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{comment.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No comments yet. Be the first to add one!</p>
              )}
              <form onSubmit={handleAddComment} className="flex items-start gap-2 pt-2">
                <Textarea
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-grow bg-input text-foreground"
                  rows={2}
                  disabled={isSubmittingComment}
                  aria-label="Add a new comment"
                />
                <Button type="submit" size="icon" disabled={!newComment.trim() || isSubmittingComment} aria-label="Send comment">
                  {isSubmittingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={18}/>}
                  <span className="sr-only">Send comment</span>
                </Button>
              </form>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="sticky bottom-0 bg-card pt-4 border-t">
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onClose}>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
