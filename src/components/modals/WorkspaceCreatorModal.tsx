
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox'; // Added Checkbox
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface WorkspaceCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkspaceCreated?: (workspaceId: string) => void; // Optional callback
}

export const WorkspaceCreatorModal = ({ isOpen, onClose, onWorkspaceCreated }: WorkspaceCreatorModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [seedWithTemplate, setSeedWithTemplate] = useState(false); // State for checkbox
  const { createWorkspace, setCurrentWorkspaceId } = useWorkspace();
  const { user, isAuthReady } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Workspace name is required.",
        variant: "destructive",
      });
      return;
    }
    if (!user || !isAuthReady) {
      toast({
        title: "Authentication Error",
        description: "User not authenticated or authentication not ready. Please wait or try signing in again.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const newWorkspaceId = await createWorkspace(name, description, seedWithTemplate); // Pass seedWithTemplate
      toast({
        title: "Workspace Created",
        description: `Workspace "${name}" has been successfully created.`,
      });
      if (newWorkspaceId) {
         setCurrentWorkspaceId(newWorkspaceId); // Optionally set as current
         if (onWorkspaceCreated) {
            onWorkspaceCreated(newWorkspaceId);
         }
      }
      setName('');
      setDescription('');
      setSeedWithTemplate(false);
      onClose();
    } catch (error: any) {
      console.error("Failed to create workspace:", error);
      toast({
        title: "Workspace Creation Failed",
        description: error.message || "An unexpected error occurred. Please ensure you are connected and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setName('');
      setDescription('');
      setSeedWithTemplate(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle className="font-headline text-card-foreground">Create New Workspace</DialogTitle>
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
              className="col-span-3"
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
              placeholder="A brief description of this workspace's goals (Optional)."
              className="col-span-3"
              rows={3}
            />
          </div>
          <div className="flex items-center space-x-2 col-start-2 col-span-3">
            <Checkbox
              id="ws-seed"
              checked={seedWithTemplate}
              onCheckedChange={(checked) => setSeedWithTemplate(checked as boolean)}
            />
            <Label htmlFor="ws-seed" className="text-sm font-normal text-card-foreground">
              Seed with 30-Day Challenge template?
            </Label>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </DialogClose>
          <Button type="submit" onClick={handleCreate} disabled={!user || !isAuthReady || isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Workspace'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
