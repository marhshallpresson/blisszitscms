
"use client";

import type { Workspace } from '@/contexts/WorkspaceContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Briefcase, Plus } from 'lucide-react';

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
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="font-headline text-card-foreground">Select Workspace for Import</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose an existing workspace to import this AI content idea into, or create a new one.
          </DialogDescription>
        </DialogHeader>
        {workspaces.length > 0 ? (
          <ScrollArea className="max-h-60 my-4 -mr-2">
            <div className="space-y-2 pr-3">
              {workspaces.map(ws => (
                <Button
                  key={ws.id}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3 items-center"
                  onClick={() => {
                    onSelectWorkspace(ws.id);
                    // onClose(); // Modal will be closed by parent setting isOpen to false
                  }}
                >
                  <Briefcase className="mr-3 h-5 w-5 text-primary flex-shrink-0" />
                  <div className="flex-grow overflow-hidden">
                    <p className="font-semibold text-card-foreground truncate">{ws.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{ws.description || 'No description'}</p>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <p className="my-6 text-center text-muted-foreground font-body">
            You don't have any workspaces yet.
          </p>
        )}
        <DialogFooter className="sm:justify-between flex-col-reverse sm:flex-row gap-2 mt-2">
          <Button type="button" variant="default" onClick={() => {
            onOpenCreateWorkspace();
            // onClose(); // Modal will be closed by parent
            }}
            className="w-full sm:w-auto"
          >
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
