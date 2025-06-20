// src/components/modals/SelectWorkspaceForImportModal.tsx
"use client";

// This modal was for selecting a workspace when importing AI content in the CMS.
// Not used in the basic corporate website. Kept for reference.

// import type { Workspace } from '@/contexts/WorkspaceContext'; // Simplified
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Briefcase, Plus } from 'lucide-react';

// Simplified placeholder type
interface Workspace {
  id: string;
  name: string;
  description?: string;
}

interface SelectWorkspaceForImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaces: Workspace[]; // Will be empty for corporate site
  // onSelectWorkspace: (workspaceId: string) => void;
  // onOpenCreateWorkspace: () => void; 
}

export const SelectWorkspaceForImportModal = ({ 
    isOpen, 
    onClose, 
    workspaces, 
    // onSelectWorkspace, 
    // onOpenCreateWorkspace 
}: SelectWorkspaceForImportModalProps) => {

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card opacity-70 pointer-events-none">
        <DialogHeader>
          <DialogTitle className="font-headline text-card-foreground">Select Project (Demo)</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose a project. (CMS Feature)
          </DialogDescription>
        </DialogHeader>
        {workspaces.length > 0 ? (
          <ScrollArea className="max-h-60 my-4 -mr-2">
            <div className="space-y-2 pr-3">
              {/* Mapping logic removed as workspaces will be empty */}
            </div>
          </ScrollArea>
        ) : (
          <p className="my-6 text-center text-muted-foreground font-body">
            No projects available. (CMS Feature)
          </p>
        )}
        <DialogFooter className="sm:justify-between flex-col-reverse sm:flex-row gap-2 mt-2">
          <Button type="button" variant="default" disabled className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Create New Project
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
