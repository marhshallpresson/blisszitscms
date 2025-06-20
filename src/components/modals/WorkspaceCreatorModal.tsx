// src/components/modals/WorkspaceCreatorModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface WorkspaceCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkspaceCreated?: (workspaceId: string) => void; 
}

export const WorkspaceCreatorModal = ({ isOpen, onClose, onWorkspaceCreated }: WorkspaceCreatorModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { createWorkspace } = useWorkspace();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast({ title: "Validation Error", description: "Workspace name is required.", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const newWorkspaceId = await createWorkspace(name, description);
      
      if (!newWorkspaceId) {
        throw new Error("Failed to get new workspace ID.");
      }

      toast({ title: "Workspace Created!", description: `Successfully created "${name}".` });
      if (onWorkspaceCreated) {
        onWorkspaceCreated(newWorkspaceId);
      }
      onClose();
    } catch (error: any) {
      toast({ title: "Creation Failed", description: error.message || "Could not create workspace.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setName('');
      setDescription('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(openStatus) => !openStatus && onClose()}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="font-headline text-card-foreground">Create Workspace Manually</DialogTitle>
          <DialogDescription>A workspace helps you organize a set of related content.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-4 animate-in fade-in-50">
            <div className="grid items-center gap-1.5">
              <Label htmlFor="ws-name" className="text-card-foreground">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ws-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Q3 Marketing Campaign"
                className="bg-input"
                aria-required="true"
                disabled={isSubmitting}
              />
            </div>
            <div className="grid items-center gap-1.5">
              <Label htmlFor="ws-description" className="text-card-foreground">
                Description (Optional)
              </Label>
              <Textarea
                id="ws-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A brief description of this project."
                className="bg-input"
                rows={3}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={handleCreate} disabled={isSubmitting || !name.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Creating...' : 'Create Workspace'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
