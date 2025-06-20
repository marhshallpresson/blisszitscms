
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';

interface WorkspaceCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkspaceCreatorModal = ({ isOpen, onClose }: WorkspaceCreatorModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { createWorkspace } = useWorkspace();
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
    setIsSubmitting(true);
    try {
      await createWorkspace(name, description);
      toast({
        title: "Workspace Created",
        description: `Workspace "${name}" has been successfully created.`,
      });
      setName('');
      setDescription('');
      onClose();
    } catch (error) {
      console.error("Failed to create workspace:", error);
      toast({
        title: "Error",
        description: "Failed to create workspace. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle className="font-headline text-card-foreground">Create New Workspace</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right text-card-foreground">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Q3 Marketing Campaign"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right text-card-foreground">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of this workspace's goals (Optional)."
              className="col-span-3"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </DialogClose>
          <Button type="submit" onClick={handleCreate} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Workspace'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
