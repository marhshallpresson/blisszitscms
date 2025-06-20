
// src/components/modals/ContentFormModal.tsx
"use client";

import type { ContentItem, ContentStatus } from '@/contexts/WorkspaceContext';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWorkspace, CONTENT_STATUSES } from '@/contexts/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2 } from 'lucide-react';
import { generateScriptOutline } from '@/ai/flows/generate-script-outline';
import { draftCaption } from '@/ai/flows/draft-caption';
import { suggestHashtags } from '@/ai/flows/suggest-hashtags';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';

const initialFormData: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'> = {
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
  const [formData, setFormData] = useState(initialFormData);
  const { createContentItem, updateContentItem } = useWorkspace();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
  const [suggestedHashtags, setSuggestedHashtags] = useState<string[]>([]);


  useEffect(() => {
    if (isOpen) {
      if (item) {
        setFormData({
          title: item.title,
          idea: item.idea || '',
          script: item.script || '',
          caption: item.caption || '',
          dueDate: item.dueDate ? new Date(item.dueDate).toISOString().split('T')[0] : '',
          status: item.status || 'Draft',
        });
      } else {
        setFormData(initialFormData);
      }
      setSuggestedHashtags([]);
      setAiLoading({});
    }
  }, [item, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: ContentStatus) => {
    setFormData(prev => ({ ...prev, status: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
        toast({title: "Title is required", variant: "destructive"});
        return;
    }
    setIsSubmitting(true);
    
    try {
      if (item?.id) {
        await updateContentItem({ id: item.id, ...formData });
        toast({ title: "Content Updated" });
      } else {
        await createContentItem(formData);
        toast({ title: "Content Created" });
      }
      onClose();
    } catch (error: any) {
      toast({ title: "Submission Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAiAction = useCallback(async (actionType: 'script' | 'caption' | 'hashtags') => {
    const coreIdea = formData.idea;
    if (!coreIdea) {
      toast({ title: "Core Idea needed", description: "Please provide a core idea to generate content.", variant: "destructive" });
      return;
    }
    setAiLoading(prev => ({ ...prev, [actionType]: true }));

    try {
      if (actionType === 'script') {
        const { scriptOutline } = await generateScriptOutline({ coreIdea });
        setFormData(prev => ({ ...prev, script: scriptOutline }));
      } else if (actionType === 'caption') {
        const { caption } = await draftCaption({ coreIdea, theme: formData.title });
        setFormData(prev => ({ ...prev, caption: caption }));
      } else if (actionType === 'hashtags') {
        const { hashtags } = await suggestHashtags({ textContent: formData.caption || coreIdea });
        setSuggestedHashtags(hashtags);
      }
    } catch (error: any) {
      toast({ title: `AI ${actionType} generation failed`, description: error.message, variant: "destructive" });
    } finally {
      setAiLoading(prev => ({ ...prev, [actionType]: false }));
    }
  }, [formData.idea, formData.title, formData.caption, toast]);

  const addHashtagToCaption = (tag: string) => {
    setFormData(prev => ({...prev, caption: `${prev.caption || ''} ${tag}`.trim()}));
  };
  
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl bg-card max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline text-card-foreground">{item?.id ? "Edit Content" : "Create New Content"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 flex-grow overflow-y-auto p-1 pr-4">
          <div>
            <Label htmlFor="title" className="text-card-foreground sr-only">Title</Label>
            <Input id="title" name="title" value={formData.title} onChange={handleChange} placeholder="Content Title..." className="w-full text-2xl font-bold p-2 h-auto bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none px-1" required/>
          </div>
          <div>
            <Label htmlFor="idea" className="text-card-foreground font-semibold">Core Idea / Brief</Label>
            <Textarea id="idea" name="idea" value={formData.idea} onChange={handleChange} placeholder="What's the main idea or topic for this piece of content?" className="w-full p-2 bg-input" rows={3} />
          </div>
          
          <Accordion type="single" collapsible className="w-full" defaultValue="ai-assistant">
            <AccordionItem value="ai-assistant">
              <AccordionTrigger className="text-primary hover:no-underline font-semibold">
                <div className="flex items-center gap-2"><Sparkles size={20} /> AI Assistant</div>
              </AccordionTrigger>
              <AccordionContent className="p-4 bg-muted/50 rounded-md space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button type="button" onClick={() => handleAiAction('script')} disabled={aiLoading.script || !formData.idea} className="text-xs">
                    {aiLoading.script && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} Generate Script Outline
                  </Button>
                  <Button type="button" onClick={() => handleAiAction('caption')} disabled={aiLoading.caption || !formData.idea} className="text-xs">
                    {aiLoading.caption && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} Draft Caption
                  </Button>
                  <Button type="button" onClick={() => handleAiAction('hashtags')} disabled={aiLoading.hashtags || !formData.idea} className="text-xs">
                    {aiLoading.hashtags && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} Suggest Hashtags
                  </Button>
                </div>
                 {suggestedHashtags.length > 0 && (
                  <div className="pt-2">
                    <p className="text-sm font-medium mb-2">Suggested Hashtags:</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedHashtags.map(tag => (
                        <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-primary/20" onClick={() => addHashtagToCaption(tag)}>{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div>
            <Label htmlFor="script" className="text-card-foreground font-semibold">Script</Label>
            <Textarea id="script" name="script" value={formData.script} onChange={handleChange} placeholder="Hook, problem, solution, CTA..." className="w-full p-2 bg-input" rows={6}/>
          </div>

          <div>
            <Label htmlFor="caption" className="text-card-foreground font-semibold">Caption / Post Text</Label>
            <Textarea id="caption" name="caption" value={formData.caption} onChange={handleChange} placeholder="Write the final caption here..." className="w-full p-2 bg-input" rows={4}/>
          </div>
        
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dueDate" className="text-card-foreground font-semibold">Due Date</Label>
              <Input id="dueDate" name="dueDate" type="date" value={formData.dueDate} onChange={handleChange} className="w-full p-2 bg-input"/>
            </div>
            <div>
              <Label htmlFor="status" className="text-card-foreground font-semibold">Status</Label>
              <Select value={formData.status} onValueChange={handleSelectChange}>
                <SelectTrigger id="status" className="w-full bg-input">
                  <SelectValue placeholder="Set status" />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_STATUSES.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>
        <DialogFooter className="sticky bottom-0 bg-card pt-4 border-t">
          <DialogClose asChild><Button type="button" variant="outline" onClick={onClose}>Cancel</Button></DialogClose>
          <Button type="submit" onClick={handleSubmit} disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
            {isSubmitting ? 'Saving...' : (item?.id ? "Save Changes" : "Create Content")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
