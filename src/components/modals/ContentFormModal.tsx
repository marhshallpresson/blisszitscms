// src/components/modals/ContentFormModal.tsx
"use client";

// This modal was for creating/editing content items in the CMS.
// It's not directly used in the basic corporate website.
// Kept for reference.

// import type { ContentItem, ContentStatus } from '@/contexts/WorkspaceContext';
import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { useWorkspace, CONTENT_STATUSES } from '@/contexts/WorkspaceContext'; // WorkspaceContext is simplified
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2 } from 'lucide-react';
// AI flow imports commented out as Genkit is not used on basic corporate frontend
// import { generateContentIdeas, type GenerateContentIdeasInput, type GenerateContentIdeasOutput } from '@/ai/flows/generate-content-ideas';
// import { generateScriptOutline, type GenerateScriptOutlineInput, type GenerateScriptOutlineOutput } from '@/ai/flows/generate-script-outline';
// import { draftCaption, type DraftCaptionInput, type DraftCaptionOutput } from '@/ai/flows/draft-caption';
// import { suggestHashtags, type SuggestHashtagsInput, type SuggestHashtagsOutput } from '@/ai/flows/suggest-hashtags';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from '@/components/ui/card';

// Simplified placeholder type
interface ContentItem {
  id?: string;
  title?: string;
  idea?: string;
  script?: string;
  caption?: string; 
  dueDate?: string;
  status?: string; // Simplified from ContentStatus
}

const initialFormData: ContentItem = {
  title: '',
  idea: '',
  script: '',
  caption: '', 
  dueDate: '',
  status: 'Draft',
};

interface ContentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: ContentItem | null;
}

export const ContentFormModal = ({ isOpen, onClose, item }: ContentFormModalProps) => {
  const [formData, setFormData] = useState<ContentItem>(initialFormData);
  // const { createContentItem, updateContentItem } = useWorkspace();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
  const [aiResults, setAiResults] = useState<Record<string, any>>({});


  useEffect(() => {
    if (item) {
      setFormData({
        ...initialFormData, 
        ...item,
        dueDate: item.dueDate ? new Date(item.dueDate).toISOString().split('T')[0] : '',
      });
    } else {
      setFormData(initialFormData);
    }
    setAiResults({}); 
  }, [item, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // const handleSelectChange = (value: string) => { ... }; // Status select removed

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log("Submitting content form (placeholder):", formData);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({ title: "Action (Demo)", description: "Content form submission is a CMS feature." });
    setIsSubmitting(false);
    onClose();
  };

  const handleAiAction = useCallback(async (actionType: 'ideas' | 'script' | 'caption' | 'hashtags') => {
    setAiLoading(prev => ({ ...prev, [actionType]: true }));
    setAiResults(prev => ({ ...prev, [actionType]: null })); 
    console.log(`AI Action (${actionType}) triggered (placeholder)`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Placeholder result
    setAiResults(prev => ({ ...prev, [actionType]: { placeholderResult: `Generated ${actionType} content...` }}));
    toast({ title: "AI Action (Demo)", description: `AI ${actionType} generation is a CMS feature.` });
    setAiLoading(prev => ({ ...prev, [actionType]: false }));
  }, [toast]);
  
  const applyAiResult = (actionType: 'ideas' | 'script' | 'caption' | 'hashtags', selectedIdea?: any) => {
    console.log(`Applying AI result for ${actionType} (placeholder)`);
    toast({ title: "Action (Demo)", description: "Applying AI results is a CMS feature." });
  };
  
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl bg-card max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline text-card-foreground">{item?.id ? "Edit Content (Demo)" : "Create New Content (Demo)"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 flex-grow overflow-y-auto p-1 pr-2 opacity-70 pointer-events-none">
          {/* Form elements are kept for UI structure but are disabled */}
          <div>
            <Label htmlFor="title" className="text-card-foreground sr-only">Title</Label>
            <Input id="title" name="title" value={formData.title || ''} onChange={handleChange} placeholder="Content Title" className="w-full text-2xl font-bold p-2 bg-transparent" disabled />
          </div>
          <div>
            <Label htmlFor="idea" className="text-card-foreground">Core Idea / Brief</Label>
            <Textarea id="idea" name="idea" value={formData.idea || ''} onChange={handleChange} placeholder="What's the main idea?" className="w-full p-2 bg-muted" rows={3} disabled />
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="ai-assistant">
              <AccordionTrigger className="text-primary hover:no-underline">
                <div className="flex items-center gap-2"><Sparkles size={20} /> AI Assistant (Demo)</div>
              </AccordionTrigger>
              <AccordionContent className="p-4 bg-muted/50 rounded-md space-y-4">
                <Button type="button" onClick={() => handleAiAction('ideas')} disabled className="w-full justify-start">Brainstorm Ideas</Button>
                {/* Other AI buttons similarly disabled */}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          {/* Other form fields (script, caption, dueDate, status) would be here, disabled */}
        
        <DialogFooter className="sticky bottom-0 bg-card pt-4">
          <DialogClose asChild><Button type="button" variant="outline" onClick={onClose}>Cancel</Button></DialogClose>
          <Button type="submit" disabled>Save (Demo)</Button>
        </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
