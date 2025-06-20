// src/components/modals/SelectWorkspaceForImportModal.tsx
"use client";

import type { Workspace } from '@/contexts/WorkspaceContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Briefcase, Plus, ChevronsRight } from 'lucide-react';

interface SelectWorkspaceForImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaces: Workspace[];
  onSelectWorkspace: (workspaceId: string) => void;
  onOpenCreateWorkspace: () => void; 
}

export const SelectWorkspaceForImportModal = ({ 
    isOpen, 
    onClose, 
    workspaces, 
    onSelectWorkspace, 
    onOpenCreateWorkspace 
}: SelectWorkspaceForImportModalProps) => {

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="font-headline text-card-foreground">Select a Workspace</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose which workspace to import this content idea into.
          </DialogDescription>
        </DialogHeader>
        {workspaces.length > 0 ? (
          <ScrollArea className="max-h-60 my-4 -mr-2">
            <div className="space-y-2 pr-3">
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => onSelectWorkspace(ws.id)}
                  className="w-full flex items-center justify-between p-3 rounded-md text-left bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-primary"/>
                    <div>
                        <p className="font-semibold text-card-foreground">{ws.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{ws.description || "No description"}</p>
                    </div>
                  </div>
                   <ChevronsRight className="h-5 w-5 text-muted-foreground" />
                </button>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <p className="my-6 text-center text-muted-foreground font-body">
            You don't have any workspaces yet. Create one first!
          </p>
        )}
        <DialogFooter className="sm:justify-between flex-col-reverse sm:flex-row gap-2 mt-2">
          <Button type="button" variant="default" onClick={onOpenCreateWorkspace} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Create New Workspace
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
