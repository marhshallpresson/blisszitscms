
// src/components/modals/MarkAsPublishedModal.tsx
"use client";

import type { ContentItem } from '@/contexts/WorkspaceContext';
import { useState, FormEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Loader2 } from 'lucide-react';

interface MarkAsPublishedModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ContentItem | null;
}

export const MarkAsPublishedModal = ({ isOpen, onClose, item }: MarkAsPublishedModalProps) => {
  const { updateContentItem } = useWorkspace();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async (e: FormEvent) => {
    e.preventDefault();
    if (!item?.id) return;
    setIsSubmitting(true);
    
    try {
      await updateContentItem({ ...item, status: 'Published' });
      toast({ title: "Content Published!", description: `"${item.title}" has been marked as published.` });
      onClose();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Could not update content status.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen || !item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="font-headline text-card-foreground">Mark as Published</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            This will change the status of <span className="font-semibold text-primary">"{item.title}"</span> to 'Published'.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <p className="text-sm text-card-foreground">Are you sure you want to proceed? This action indicates that the content has gone live on its respective platform.</p>
        </div>
        <DialogFooter className="mt-2">
          <DialogClose asChild><Button type="button" variant="outline" onClick={onClose}>Cancel</Button></DialogClose>
          <Button type="button" onClick={handleConfirm} className="font-semibold bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <CheckCircle size={18} className="mr-2" />
            {isSubmitting ? 'Confirming...' : 'Confirm Publication'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
