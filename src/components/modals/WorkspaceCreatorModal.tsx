
// src/components/modals/WorkspaceCreatorModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles } from 'lucide-react';
import type { GenerateWorkspacePlanOutput } from '@/ai/flows/generate-workspace-plan';
import { generateWorkspacePlan } from '@/ai/flows/generate-workspace-plan';
import { writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { collection, doc, serverTimestamp } from 'firebase/firestore';

interface WorkspaceCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkspaceCreated?: (workspaceId: string) => void; 
}

export const WorkspaceCreatorModal = ({ isOpen, onClose, onWorkspaceCreated }: WorkspaceCreatorModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [useAi, setUseAi] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const { createWorkspace } = useWorkspace();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() && !useAi) {
      toast({ title: "Validation Error", description: "Workspace name is required for manual creation.", variant: "destructive" });
      return;
    }
     if (useAi && !aiTopic.trim()) {
      toast({ title: "Validation Error", description: "An AI topic is required to generate a workspace.", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let workspaceName = name;
      let workspaceDesc = description;
      let contentToSeed: GenerateWorkspacePlanOutput['contentPlan'] = [];

      // If using AI, generate the plan first
      if (useAi) {
        const plan = await generateWorkspacePlan({ topic: aiTopic });
        workspaceName = plan.workspaceName;
        workspaceDesc = plan.workspaceDescription;
        contentToSeed = plan.contentPlan;
      }
      
      // Create the workspace document
      const newWorkspaceId = await createWorkspace(workspaceName, workspaceDesc);
      
      if (!newWorkspaceId) {
        throw new Error("Failed to get new workspace ID.");
      }

      // If there's AI content, batch write it
      if (useAi && contentToSeed.length > 0) {
        const batch = writeBatch(db);
        contentToSeed.forEach((itemTemplate) => {
            const contentRef = doc(collection(db, `workspaces/${newWorkspaceId}/content`));
            batch.set(contentRef, {
                ...itemTemplate,
                status: 'Draft',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
        });
        await batch.commit();
      }

      toast({ title: "Workspace Created!", description: `Successfully created "${workspaceName}".` });
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
      setUseAi(false);
      setAiTopic('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(openStatus) => !openStatus && onClose()}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="font-headline text-card-foreground">Create New Workspace</DialogTitle>
          <DialogDescription>A workspace helps you organize a set of related content.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="ai-toggle" className="flex-grow">
              Generate with AI
            </Label>
            <Switch
              id="ai-toggle"
              checked={useAi}
              onCheckedChange={setUseAi}
              aria-labelledby="ai-toggle-label"
            />
          </div>
          
          {useAi ? (
            <div className="grid items-center gap-1.5 animate-in fade-in-50">
              <Label htmlFor="ai-topic" className="text-card-foreground">
                Content Topic <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="ai-topic"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="e.g., '30-Day Fitness Challenge' or 'Learn Photography Basics'"
                className="bg-input"
                rows={3}
                aria-required="true"
              />
            </div>
          ) : (
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
                />
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={handleCreate} disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              useAi && <Sparkles className="mr-2 h-4 w-4" />
            )}
            {isSubmitting ? 'Creating...' : (useAi ? 'Generate & Create' : 'Create Workspace')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
