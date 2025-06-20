// src/components/modals/WorkspaceCreatorModal.tsx
"use client";

// This modal was for creating workspaces in the CMS.
// It's not directly used in the basic corporate website.
// Kept for reference.

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox'; 
// import { useWorkspace } from '@/contexts/WorkspaceContext'; // WorkspaceContext is simplified
// import { useAuth } from '@/contexts/AuthContext'; // AuthContext is simplified
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface WorkspaceCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  // onWorkspaceCreated?: (workspaceId: string) => void; 
}

export const WorkspaceCreatorModal = ({ isOpen, onClose /*, onWorkspaceCreated*/ }: WorkspaceCreatorModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [seedWithTemplate, setSeedWithTemplate] = useState(false); 
  // const { createWorkspace, setCurrentWorkspaceId } = useWorkspace();
  // const { user, isAuthReady } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast({ title: "Validation Error", description: "Name is required.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    console.log("Creating workspace (placeholder):", { name, description, seedWithTemplate });
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({ title: "Action (Demo)", description: "Workspace creation is a CMS feature."});
    setIsSubmitting(false);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      setName('');
      setDescription('');
      setSeedWithTemplate(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null; // Ensure modal doesn't render if not open

  return (
    <Dialog open={isOpen} onOpenChange={(openStatus) => !openStatus && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle className="font-headline text-card-foreground">Create New Project (Demo)</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ws-name" className="text-right text-card-foreground">
              Name
            </Label>
            <Input
              id="ws-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Q3 Marketing Campaign"
              className="col-span-3 bg-input"
              aria-required="true"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ws-description" className="text-right text-card-foreground">
              Description
            </Label>
            <Textarea
              id="ws-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of this project (Optional)."
              className="col-span-3 bg-input"
              rows={3}
            />
          </div>
          <div className="flex items-center space-x-2 col-start-2 col-span-3">
            <Checkbox
              id="ws-seed"
              checked={seedWithTemplate}
              onCheckedChange={(checked) => setSeedWithTemplate(checked as boolean)}
              aria-labelledby="ws-seed-label"
            />
            <Label htmlFor="ws-seed" id="ws-seed-label" className="text-sm font-normal text-card-foreground">
              Use project template? (Demo)
            </Label>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={handleCreate} disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Creating...' : 'Create Project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
