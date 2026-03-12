// src/components/modals/WorkspaceSelectorModal.tsx
"use client";

import type { Workspace } from '@/contexts/WorkspaceContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Briefcase, Plus, ChevronsRight, Loader2 } from 'lucide-react';

interface WorkspaceSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaces: Workspace[];
  onSelectWorkspace: (workspaceId: string) => void;
  onOpenCreateWorkspace?: () => void;
  isLoading?: boolean;
}

export const WorkspaceSelectorModal = ({ 
    isOpen, 
    onClose, 
    workspaces, 
    onSelectWorkspace, 
    onOpenCreateWorkspace,
    isLoading = false
}: WorkspaceSelectorModalProps) => {

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="font-headline text-card-foreground">Select a Workspace</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            You need to select a workspace to continue with this action.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Loading workspaces...</p>
          </div>
        ) : workspaces.length > 0 ? (
          <ScrollArea className="max-h-60 my-4 -mr-2">
            <div className="space-y-2 pr-3">
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => {
                    onSelectWorkspace(ws.id);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-md text-left bg-muted/50 hover:bg-muted transition-colors border border-transparent hover:border-primary/30"
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
          <div className="my-8 text-center px-4">
            <Briefcase className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-body">
              You don't have any workspaces yet. Create one to get started!
            </p>
          </div>
        )}

        <DialogFooter className="sm:justify-between flex-col-reverse sm:flex-row gap-2 mt-2">
          {onOpenCreateWorkspace && (
            <Button type="button" variant="default" onClick={onOpenCreateWorkspace} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Create New
            </Button>
          )}
          <DialogClose asChild>
            <Button type="button" variant="outline" className="w-full sm:w-auto">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
