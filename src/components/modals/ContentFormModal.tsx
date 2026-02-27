// src/components/modals/ContentFormModal.tsx
"use client";

import type { ContentItem, ContentStatus, PostVariant } from '@/contexts/WorkspaceContext';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWorkspace, CONTENT_STATUSES, getContentStatusLabel, normalizeContentStatus } from '@/contexts/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, Instagram, Linkedin, Video, Plus, Trash2, CheckCircle } from 'lucide-react';
import { generateScriptOutline } from '@/ai/flows/generate-script-outline';
import { draftCaption } from '@/ai/flows/draft-caption';
import { suggestHashtags } from '@/ai/flows/suggest-hashtags';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SUPPORTED_NETWORKS } from '@/lib/network-capabilities';

const initialFormData: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'> = {
  workspaceId: '',
  title: '',
  idea: '',
  script: '',
  caption: '',
  dueDate: '',
  status: 'draft',
  approvalStatus: 'none',
  variants: [],
};

export const ContentFormModal = ({ isOpen, onClose, item }: { isOpen: boolean; onClose: () => void; item?: ContentItem | null; }) => {
  const [formData, setFormData] = useState(initialFormData);
  const { createContentItem, updateContentItem, socialAccounts } = useWorkspace();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
  const [suggestedHashtags, setSuggestedHashtags] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setFormData({
          workspaceId: item.workspaceId,
          title: item.title,
          idea: item.idea || '',
          script: item.script || '',
          caption: item.caption || '',
          dueDate: item.dueDate ? new Date(item.dueDate).toISOString().split('T')[0] : '',
          status: normalizeContentStatus(item.status),
          approvalStatus: item.approvalStatus || 'none',
          variants: item.variants || [],
          scheduledAt: item.scheduledAt || '',
          publishedAt: item.publishedAt || '',
        });
      } else {
        setFormData(initialFormData);
      }
      setSuggestedHashtags([]);
      setAiLoading({});
    }
  }, [item, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    setIsSubmitting(true);
    try {
      if (item?.id) {
        await updateContentItem({ ...item, ...formData, id: item.id, workspaceId: item.workspaceId });
        toast({ title: "Content Saved" });
      } else {
        const { workspaceId, ...newItem } = formData;
        await createContentItem(newItem);
        toast({ title: "Content Created" });
      }
      onClose();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAiAction = async (actionType: 'script' | 'caption' | 'hashtags') => {
    if (!formData.idea) return;
    setAiLoading(prev => ({ ...prev, [actionType]: true }));
    try {
      if (actionType === 'script') {
        const { scriptOutline } = await generateScriptOutline({ coreIdea: formData.idea });
        setFormData(prev => ({ ...prev, script: scriptOutline }));
      } else if (actionType === 'caption') {
        const { caption } = await draftCaption({ coreIdea: formData.idea, theme: formData.title });
        setFormData(prev => ({ ...prev, caption }));
      } else if (actionType === 'hashtags') {
        const { hashtags } = await suggestHashtags({ textContent: formData.caption || formData.idea });
        setSuggestedHashtags(hashtags);
      }
    } catch (error: any) {
      toast({ title: "AI Error", variant: "destructive" });
    } finally {
      setAiLoading(prev => ({ ...prev, [actionType]: false }));
    }
  };

  const handleAddVariant = (network: string) => {
    const newVariant: PostVariant = { id: Math.random().toString(36).substr(2, 9), network, text: formData.caption || '' };
    setFormData(prev => ({ ...prev, variants: [...(prev.variants || []), newVariant] }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={o => !o && onClose()}>
      <DialogContent className="sm:max-w-4xl bg-card max-h-[95vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2 border-b">
          <DialogTitle className="text-2xl font-headline">{item?.id ? "Edit Post" : "Create New Post"}</DialogTitle>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          <div className="space-y-4">
            <Input 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              placeholder="Post Title..." 
              className="text-3xl font-bold border-none shadow-none focus-visible:ring-0 p-0 h-auto"
            />
            <Textarea 
              value={formData.idea} 
              onChange={e => setFormData({...formData, idea: e.target.value})} 
              placeholder="Core Idea / Brief..." 
              className="bg-muted/30"
            />
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="ai" className="border-none">
              <AccordionTrigger className="hover:no-underline text-primary font-bold"><Sparkles className="h-4 w-4 mr-2" /> AI Content Assistant</AccordionTrigger>
              <AccordionContent className="bg-muted/50 p-4 rounded-xl space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={() => handleAiAction('script')} disabled={aiLoading.script || !formData.idea}>
                    {aiLoading.script ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />} Script Outline
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => handleAiAction('caption')} disabled={aiLoading.caption || !formData.idea}>
                    {aiLoading.caption ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />} Draft Caption
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => handleAiAction('hashtags')} disabled={aiLoading.hashtags || !formData.idea}>
                    {aiLoading.hashtags ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />} Hashtags
                  </Button>
                </div>
                {suggestedHashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {suggestedHashtags.map(tag => (
                      <Badge key={tag} className="cursor-pointer hover:bg-primary" onClick={() => setFormData({...formData, caption: `${formData.caption} ${tag}`})}>{tag}</Badge>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Tabs defaultValue="base" className="w-full">
            <TabsList className="w-full justify-start bg-muted/30 p-1 mb-4 h-auto flex-wrap">
              <TabsTrigger value="base">Canonical Post</TabsTrigger>
              {formData.variants?.map(v => (
                <TabsTrigger key={v.id} value={v.id} className="capitalize">{v.network}</TabsTrigger>
              ))}
              <Select onValueChange={handleAddVariant}>
                <SelectTrigger className="w-[140px] h-8 bg-transparent border-none ml-2">
                  <SelectValue placeholder="+ Platform" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_NETWORKS.map((network) => (
                    <SelectItem key={network.network} value={network.network}>
                      {network.label} {network.canPublish ? '' : '(planned)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TabsList>
            <TabsContent value="base" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-bold">Master Script</Label>
                  <Textarea value={formData.script} onChange={e => setFormData({...formData, script: e.target.value})} rows={8} className="bg-input" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Master Caption</Label>
                  <Textarea value={formData.caption} onChange={e => setFormData({...formData, caption: e.target.value})} rows={8} className="bg-input" />
                </div>
              </div>
            </TabsContent>
            {formData.variants?.map((v, i) => (
              <TabsContent key={v.id} value={v.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="font-bold capitalize">{v.network} Variant</Label>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setFormData({...formData, variants: formData.variants?.filter(x => x.id !== v.id)})}>
                    <Trash2 className="h-4 w-4 mr-2" /> Remove Variant
                  </Button>
                </div>
                <Textarea 
                  value={v.text} 
                  onChange={e => {
                    const newVariants = [...(formData.variants || [])];
                    newVariants[i] = { ...v, text: e.target.value };
                    setFormData({...formData, variants: newVariants});
                  }} 
                  rows={10} 
                  className="bg-input" 
                />
              </TabsContent>
            ))}
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v as ContentStatus})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CONTENT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {getContentStatusLabel(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Approval Workflow</Label>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => setFormData({...formData, approvalStatus: 'pending', status: 'review'})}
                disabled={formData.approvalStatus === 'pending' || formData.approvalStatus === 'approved'}
              >
                {formData.approvalStatus === 'pending' ? 'Review Requested' : formData.approvalStatus === 'approved' ? 'Approved' : 'Submit for Review'}
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter className="p-6 border-t bg-muted/10">
          <DialogClose asChild><Button variant="ghost">Discard</Button></DialogClose>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-primary text-white px-8">
            {isSubmitting && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
            {item?.id ? "Update Content" : "Create Post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
