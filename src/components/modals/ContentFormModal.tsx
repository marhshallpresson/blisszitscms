
"use client";

import type { ContentItem, ContentStatus } from '@/contexts/WorkspaceContext';
import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWorkspace, CONTENT_STATUSES } from '@/contexts/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2 } from 'lucide-react';
import { generateContentIdeas, type GenerateContentIdeasInput, type GenerateContentIdeasOutput } from '@/ai/flows/generate-content-ideas';
import { generateScriptOutline, type GenerateScriptOutlineInput, type GenerateScriptOutlineOutput } from '@/ai/flows/generate-script-outline';
import { draftCaption, type DraftCaptionInput, type DraftCaptionOutput } from '@/ai/flows/draft-caption';
import { suggestHashtags, type SuggestHashtagsInput, type SuggestHashtagsOutput } from '@/ai/flows/suggest-hashtags';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


interface ContentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: ContentItem | null;
}

const initialFormData: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'> = {
  title: '',
  idea: '',
  script: '',
  caption: '', // Added caption
  dueDate: '',
  status: 'Draft',
};

export const ContentFormModal = ({ isOpen, onClose, item }: ContentFormModalProps) => {
  const [formData, setFormData] = useState<Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt' > | ContentItem>(initialFormData);
  const { createContentItem, updateContentItem } = useWorkspace();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
  const [aiResults, setAiResults] = useState<Record<string, any>>({});


  useEffect(() => {
    if (item) {
      setFormData({
        ...initialFormData, // Ensure all fields are present even if item is partial
        ...item,
        dueDate: item.dueDate ? new Date(item.dueDate).toISOString().split('T')[0] : '',
      });
    } else {
      setFormData(initialFormData);
    }
    setAiResults({}); // Clear AI results when item changes or modal opens for new
  }, [item, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, status: value as ContentStatus }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast({ title: "Validation Error", description: "Content title is required.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const dataToSave = { ...formData };
      if ('id' in dataToSave && dataToSave.id) {
        await updateContentItem(dataToSave as ContentItem);
        toast({ title: "Content Updated", description: `Content "${dataToSave.title}" has been updated.` });
      } else {
        await createContentItem(dataToSave);
        toast({ title: "Content Created", description: `Content "${dataToSave.title}" has been created.` });
      }
      onClose();
    } catch (error) {
      console.error("Failed to save content:", error);
      toast({ title: "Error", description: "Failed to save content. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAiAction = useCallback(async (actionType: 'ideas' | 'script' | 'caption' | 'hashtags') => {
    setAiLoading(prev => ({ ...prev, [actionType]: true }));
    setAiResults(prev => ({ ...prev, [actionType]: null })); // Clear previous result for this action

    try {
      let result: any;
      if (actionType === 'ideas') {
        if (!formData.title && !formData.idea) {
          toast({ title: "AI Input Needed", description: "Please provide a title or core idea to brainstorm.", variant: "destructive" });
          return;
        }
        result = await generateContentIdeas({ topic: formData.title || formData.idea || "general content", numIdeas: 3 } as GenerateContentIdeasInput);
      } else if (actionType === 'script') {
        if (!formData.idea) {
          toast({ title: "AI Input Needed", description: "Please provide a core idea to generate a script.", variant: "destructive" });
          return;
        }
        result = await generateScriptOutline({ coreIdea: formData.idea } as GenerateScriptOutlineInput);
      } else if (actionType === 'caption') {
        if (!formData.idea && !formData.title) {
          toast({ title: "AI Input Needed", description: "Please provide a title or core idea to draft a caption.", variant: "destructive" });
          return;
        }
        result = await draftCaption({ coreIdea: formData.idea || formData.title, theme: formData.title } as DraftCaptionInput);
      } else if (actionType === 'hashtags') {
        if (!formData.caption && !formData.idea) {
          toast({ title: "AI Input Needed", description: "Please provide a caption or core idea to suggest hashtags.", variant: "destructive" });
          return;
        }
        result = await suggestHashtags({ textContent: formData.caption || formData.idea || "" } as SuggestHashtagsInput);
      }
      setAiResults(prev => ({ ...prev, [actionType]: result }));
    } catch (error: any) {
      console.error(`AI ${actionType} error:`, error);
      toast({ title: `AI Error (${actionType})`, description: error.message || "Failed to generate content.", variant: "destructive" });
      setAiResults(prev => ({ ...prev, [actionType]: { error: `Failed to generate ${actionType}.` }}));
    } finally {
      setAiLoading(prev => ({ ...prev, [actionType]: false }));
    }
  }, [formData.title, formData.idea, formData.caption, toast]);

  const applyAiResult = (actionType: 'ideas' | 'script' | 'caption' | 'hashtags', selectedIdea?: any) => {
    const result = aiResults[actionType];
    if (!result || result.error) return;

    if (actionType === 'ideas' && Array.isArray(result) && selectedIdea) {
        setFormData(prev => ({ ...prev, title: selectedIdea.title, idea: selectedIdea.description }));
    } else if (actionType === 'script' && result.scriptOutline) {
        setFormData(prev => ({ ...prev, script: result.scriptOutline }));
    } else if (actionType === 'caption' && result.caption) {
        setFormData(prev => ({ ...prev, caption: result.caption }));
    } else if (actionType === 'hashtags' && Array.isArray(result.hashtags)) {
        setFormData(prev => ({ ...prev, caption: `${prev.caption || ''}\n\n${result.hashtags.join(' ')}`}));
    }
    setAiResults(prev => ({ ...prev, [actionType]: null })); // Clear after applying
  };
  

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl bg-card max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline text-card-foreground">{item?.id ? "Edit Content" : "Create New Content"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 flex-grow overflow-y-auto p-1 pr-2">
          <div>
            <Label htmlFor="title" className="text-card-foreground sr-only">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title || ''}
              onChange={handleChange}
              placeholder="Content Title (e.g., Mindset Monday - The 'Why')"
              className="w-full text-2xl font-bold p-2 bg-transparent focus:outline-none focus:ring-0 border-0 shadow-none focus-visible:ring-0 focus:bg-muted rounded-lg text-card-foreground"
              required
            />
          </div>
          <div>
            <Label htmlFor="idea" className="text-card-foreground">Core Idea / Brief</Label>
            <Textarea
              id="idea"
              name="idea"
              value={formData.idea || ''}
              onChange={handleChange}
              placeholder="What's the main idea or topic?"
              className="w-full p-2 bg-muted rounded-lg text-card-foreground"
              rows={3}
            />
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="ai-assistant">
              <AccordionTrigger className="text-primary hover:no-underline">
                <div className="flex items-center gap-2">
                  <Sparkles size={20} /> AI Assistant
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 bg-muted/50 rounded-md space-y-4">
                {/* AI Ideas */}
                <div>
                  <Button type="button" onClick={() => handleAiAction('ideas')} disabled={aiLoading['ideas']} className="w-full justify-start">
                    {aiLoading['ideas'] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Brainstorm Ideas
                  </Button>
                  {aiResults.ideas && Array.isArray(aiResults.ideas) && (
                    <div className="mt-2 space-y-2">
                      {aiResults.ideas.map((idea: any, index: number) => (
                        <Card key={index} className="p-3 bg-background">
                          <p className="font-semibold">{idea.title}</p>
                          <p className="text-sm text-muted-foreground">{idea.description}</p>
                          <Button type="button" size="sm" variant="link" onClick={() => applyAiResult('ideas', idea)}>Use this idea</Button>
                        </Card>
                      ))}
                    </div>
                  )}
                  {aiResults.ideas?.error && <p className="text-destructive text-sm mt-1">{aiResults.ideas.error}</p>}
                </div>

                {/* AI Script */}
                <div>
                  <Button type="button" onClick={() => handleAiAction('script')} disabled={aiLoading['script'] || !formData.idea} className="w-full justify-start">
                    {aiLoading['script'] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Generate Script Outline
                  </Button>
                  {aiResults.script && aiResults.script.scriptOutline && (
                    <div className="mt-2">
                      <Textarea value={aiResults.script.scriptOutline} readOnly rows={4} className="bg-background" />
                      <Button type="button" size="sm" variant="link" onClick={() => applyAiResult('script')}>Use this script</Button>
                    </div>
                  )}
                  {aiResults.script?.error && <p className="text-destructive text-sm mt-1">{aiResults.script.error}</p>}
                </div>

                {/* AI Caption */}
                <div>
                  <Button type="button" onClick={() => handleAiAction('caption')} disabled={aiLoading['caption'] || (!formData.idea && !formData.title)} className="w-full justify-start">
                    {aiLoading['caption'] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Draft Caption
                  </Button>
                  {aiResults.caption && aiResults.caption.caption && (
                    <div className="mt-2">
                      <Textarea value={aiResults.caption.caption} readOnly rows={3} className="bg-background" />
                      <Button type="button" size="sm" variant="link" onClick={() => applyAiResult('caption')}>Use this caption</Button>
                    </div>
                  )}
                  {aiResults.caption?.error && <p className="text-destructive text-sm mt-1">{aiResults.caption.error}</p>}
                </div>
                
                {/* AI Hashtags */}
                <div>
                  <Button type="button" onClick={() => handleAiAction('hashtags')} disabled={aiLoading['hashtags'] || (!formData.caption && !formData.idea)} className="w-full justify-start">
                    {aiLoading['hashtags'] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Suggest Hashtags
                  </Button>
                  {aiResults.hashtags && Array.isArray(aiResults.hashtags.hashtags) && (
                     <div className="mt-2">
                      <p className="text-sm p-2 bg-background rounded-md">{aiResults.hashtags.hashtags.join(' ')}</p>
                      <Button type="button" size="sm" variant="link" onClick={() => applyAiResult('hashtags')}>Add these hashtags</Button>
                    </div>
                  )}
                  {aiResults.hashtags?.error && <p className="text-destructive text-sm mt-1">{aiResults.hashtags.error}</p>}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div>
            <Label htmlFor="script" className="text-card-foreground">Script / Body</Label>
            <Textarea
              id="script"
              name="script"
              value={formData.script || ''}
              onChange={handleChange}
              placeholder="Write your script or content body here..."
              className="w-full p-2 bg-muted rounded-lg text-card-foreground"
              rows={6}
            />
          </div>
          <div>
            <Label htmlFor="caption" className="text-card-foreground">Caption for Social Media</Label>
            <Textarea
              id="caption"
              name="caption"
              value={formData.caption || ''}
              onChange={handleChange}
              placeholder="Write your caption here (AI can help too!)..."
              className="w-full p-2 bg-muted rounded-lg text-card-foreground"
              rows={4}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dueDate" className="text-card-foreground">Due Date</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                value={formData.dueDate || ''}
                onChange={handleChange}
                className="w-full p-2 bg-muted rounded-lg text-card-foreground"
              />
            </div>
            <div>
              <Label htmlFor="status" className="text-card-foreground">Status</Label>
              <Select name="status" value={formData.status || 'Draft'} onValueChange={handleSelectChange}>
                <SelectTrigger className="w-full p-2 bg-muted rounded-lg text-card-foreground">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_STATUSES.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        
        <DialogFooter className="sticky bottom-0 bg-card pt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          </DialogClose>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Saving...' : (item?.id ? 'Save Changes' : 'Create Post')}
          </Button>
        </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
