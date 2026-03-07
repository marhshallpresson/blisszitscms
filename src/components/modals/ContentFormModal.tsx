// src/components/modals/ContentFormModal.tsx
"use client";

import type { ContentItem, ContentStatus, PostVariant } from '@/contexts/WorkspaceContext';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWorkspace, CONTENT_STATUSES, getContentStatusLabel, normalizeContentStatus } from '@/contexts/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, Trash2 } from 'lucide-react';
import { generateScriptOutline } from '@/ai/flows/generate-script-outline';
import { draftCaption } from '@/ai/flows/draft-caption';
import { suggestHashtags } from '@/ai/flows/suggest-hashtags';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SUPPORTED_NETWORKS } from '@/lib/network-capabilities';
import { AiFieldActions } from '@/components/ai/AiFieldActions';
import { AiAssistantPreviewPanel } from '@/components/ai/AiAssistantPreviewPanel';
import { useAiTextAssistant } from '@/hooks/useAiTextAssistant';
import type { AiTextContext, AiTextOperation } from '@/types/ai-assistant';

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
  const { createContentItem, updateContentItem } = useWorkspace();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hashtagState, setHashtagState] = useState<{ fieldId: string; tags: string[] } | null>(null);
  const [hashtagLoading, setHashtagLoading] = useState<Record<string, boolean>>({});
  const ideaText = formData.idea || '';
  const captionText = formData.caption || '';
  const titleText = formData.title || '';

  const getFieldValue = (fieldId: string): string => {
    if (fieldId === 'idea') return formData.idea || '';
    if (fieldId === 'script') return formData.script || '';
    if (fieldId === 'caption') return formData.caption || '';
    if (fieldId.startsWith('variant:')) {
      const variantId = fieldId.replace('variant:', '');
      return formData.variants?.find((variant) => variant.id === variantId)?.text || '';
    }
    return '';
  };

  const setFieldValue = (fieldId: string, value: string) => {
    if (fieldId === 'idea') {
      setFormData((prev) => ({ ...prev, idea: value }));
      return;
    }
    if (fieldId === 'script') {
      setFormData((prev) => ({ ...prev, script: value }));
      return;
    }
    if (fieldId === 'caption') {
      setFormData((prev) => ({ ...prev, caption: value }));
      return;
    }
    if (fieldId.startsWith('variant:')) {
      const variantId = fieldId.replace('variant:', '');
      setFormData((prev) => ({
        ...prev,
        variants: (prev.variants || []).map((variant) =>
          variant.id === variantId ? { ...variant, text: value } : variant
        ),
      }));
    }
  };

  const aiAssistant = useAiTextAssistant({
    getFieldValue,
    setFieldValue,
    onError: (message) => {
      toast({ title: 'AI Error', description: message, variant: 'destructive' });
    },
  });

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
      setHashtagState(null);
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
        void workspaceId;
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

  const runFieldAction = async (
    fieldId: string,
    context: AiTextContext,
    operation: AiTextOperation,
    options?: {
      seed?: string;
      network?: string;
      customRequest?: () => Promise<string>;
    }
  ) => {
    await aiAssistant.runOperation({
      fieldId,
      context,
      operation,
      text: getFieldValue(fieldId),
      seed: options?.seed,
      network: options?.network,
      customRequest: options?.customRequest,
    });
  };

  const handleSuggestHashtags = async (fieldId: string) => {
    const sourceText = getFieldValue(fieldId) || captionText || ideaText || '';
    if (!sourceText.trim()) {
      toast({ title: 'AI Error', description: 'Provide caption or idea text before generating hashtags.', variant: 'destructive' });
      return;
    }

    setHashtagLoading((prev) => ({ ...prev, [fieldId]: true }));
    try {
      const { hashtags } = await suggestHashtags({ textContent: sourceText });
      setHashtagState({ fieldId, tags: hashtags });
    } catch (error: any) {
      toast({ title: 'AI Error', description: error?.message || 'Unable to generate hashtags.', variant: 'destructive' });
    } finally {
      setHashtagLoading((prev) => ({ ...prev, [fieldId]: false }));
    }
  };

  const handleInsertHashtag = (fieldId: string, tag: string) => {
    const current = getFieldValue(fieldId);
    setFieldValue(fieldId, `${current}${current ? ' ' : ''}${tag}`);
  };

  const handleAddVariant = (network: string) => {
    const newVariant: PostVariant = { id: Math.random().toString(36).slice(2, 11), network, text: formData.caption || '' };
    setFormData(prev => ({ ...prev, variants: [...(prev.variants || []), newVariant] }));
  };

  const actionDisabled = (fieldId: string, allowGenerateWithSeed: boolean) => {
    const value = getFieldValue(fieldId);
    return {
      generate: !allowGenerateWithSeed && !value.trim(),
      improve: !value.trim(),
      shorten: !value.trim(),
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={o => !o && onClose()}>
      <DialogContent className="sm:max-w-5xl bg-card max-h-[95vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2 border-b">
          <DialogTitle className="text-2xl font-headline">{item?.id ? "Edit Post" : "Create New Post"}</DialogTitle>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          <div className="space-y-4">
            <Input
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="Post Title..."
              className="text-3xl font-bold border-none shadow-none focus-visible:ring-0 p-0 h-auto"
            />
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <Textarea
                value={formData.idea}
                onChange={e => setFormData({ ...formData, idea: e.target.value })}
                placeholder="Core Idea / Brief..."
                className="bg-muted/30"
                rows={4}
              />
              <AiFieldActions
                onAction={(operation) => {
                  void runFieldAction('idea', 'idea', operation, {
                    seed: titleText || ideaText,
                  });
                }}
                isLoading={{
                  generate: aiAssistant.isLoading('idea', 'generate'),
                  improve: aiAssistant.isLoading('idea', 'improve'),
                  shorten: aiAssistant.isLoading('idea', 'shorten'),
                }}
                disabled={actionDisabled('idea', Boolean(titleText.trim() || ideaText.trim()))}
              />
            </div>
          </div>

          <Accordion type="single" collapsible className="w-full" defaultValue="ai">
            <AccordionItem value="ai" className="border-none">
              <AccordionTrigger className="hover:no-underline text-primary font-bold"><Sparkles className="h-4 w-4 mr-2" /> AI Content Assistant</AccordionTrigger>
              <AccordionContent className="bg-muted/50 p-4 rounded-xl space-y-4">
                <AiAssistantPreviewPanel
                  preview={aiAssistant.preview}
                  tone={aiAssistant.tone}
                  onToneChange={aiAssistant.setTone}
                  onApplyReplace={() => aiAssistant.applyPreview('replace')}
                  onApplyAppend={() => aiAssistant.applyPreview('append')}
                  onDismiss={aiAssistant.clearPreview}
                  onUndo={aiAssistant.undoLastApply}
                  canUndo={aiAssistant.hasUndo}
                />
                {hashtagState && hashtagState.tags.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Suggested hashtags for selected field</p>
                    <div className="flex flex-wrap gap-2">
                      {hashtagState.tags.map((tag) => (
                        <Badge
                          key={`${hashtagState.fieldId}-${tag}`}
                          className="cursor-pointer hover:bg-primary"
                          onClick={() => handleInsertHashtag(hashtagState.fieldId, tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
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
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label className="font-bold">Master Script</Label>
                  <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                    <Textarea value={formData.script} onChange={e => setFormData({ ...formData, script: e.target.value })} rows={8} className="bg-input" />
                    <AiFieldActions
                      onAction={(operation) => {
                        if (operation === 'generate') {
                          void runFieldAction('script', 'script', operation, {
                            seed: formData.idea,
                            customRequest: async () => {
                              if (!ideaText.trim()) throw new Error('Core idea is required before generating a script.');
                              const result = await generateScriptOutline({ coreIdea: ideaText });
                              return result.scriptOutline;
                            },
                          });
                          return;
                        }
                        void runFieldAction('script', 'script', operation, {
                          seed: ideaText,
                        });
                      }}
                      isLoading={{
                        generate: aiAssistant.isLoading('script', 'generate'),
                        improve: aiAssistant.isLoading('script', 'improve'),
                        shorten: aiAssistant.isLoading('script', 'shorten'),
                      }}
                      disabled={{
                        generate: !ideaText.trim(),
                        improve: !formData.script?.trim(),
                        shorten: !formData.script?.trim(),
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Master Caption</Label>
                  <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                    <Textarea value={formData.caption} onChange={e => setFormData({ ...formData, caption: e.target.value })} rows={8} className="bg-input" />
                    <AiFieldActions
                      onAction={(operation) => {
                        if (operation === 'generate') {
                          void runFieldAction('caption', 'caption', operation, {
                            seed: formData.idea || formData.title,
                            customRequest: async () => {
                              if (!ideaText.trim()) throw new Error('Core idea is required before generating a caption.');
                              const result = await draftCaption({ coreIdea: ideaText, theme: titleText });
                              return result.caption;
                            },
                          });
                          return;
                        }
                        void runFieldAction('caption', 'caption', operation, {
                          seed: ideaText || titleText,
                        });
                      }}
                      onHashtags={() => {
                        void handleSuggestHashtags('caption');
                      }}
                      hashtagsLoading={Boolean(hashtagLoading.caption)}
                      hashtagsDisabled={!captionText.trim() && !ideaText.trim()}
                      isLoading={{
                        generate: aiAssistant.isLoading('caption', 'generate'),
                        improve: aiAssistant.isLoading('caption', 'improve'),
                        shorten: aiAssistant.isLoading('caption', 'shorten'),
                      }}
                      disabled={actionDisabled('caption', Boolean(ideaText.trim() || titleText.trim()))}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            {formData.variants?.map((v, i) => {
              const fieldId = `variant:${v.id}`;
              return (
                <TabsContent key={v.id} value={v.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="font-bold capitalize">{v.network} Variant</Label>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setFormData({ ...formData, variants: formData.variants?.filter(x => x.id !== v.id) })}>
                      <Trash2 className="h-4 w-4 mr-2" /> Remove Variant
                    </Button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                    <Textarea
                      value={v.text}
                      onChange={e => {
                        const newVariants = [...(formData.variants || [])];
                        newVariants[i] = { ...v, text: e.target.value };
                        setFormData({ ...formData, variants: newVariants });
                      }}
                      rows={10}
                      className="bg-input"
                    />
                    <AiFieldActions
                      onAction={(operation) => {
                        void runFieldAction(fieldId, 'variant', operation, {
                          seed: formData.caption || formData.idea,
                          network: v.network,
                        });
                      }}
                      onHashtags={() => {
                        void handleSuggestHashtags(fieldId);
                      }}
                      hashtagsLoading={Boolean(hashtagLoading[fieldId])}
                      hashtagsDisabled={!v.text?.trim() && !captionText.trim() && !ideaText.trim()}
                      isLoading={{
                        generate: aiAssistant.isLoading(fieldId, 'generate'),
                        improve: aiAssistant.isLoading(fieldId, 'improve'),
                        shorten: aiAssistant.isLoading(fieldId, 'shorten'),
                      }}
                      disabled={actionDisabled(fieldId, Boolean(v.text?.trim() || captionText.trim() || ideaText.trim()))}
                    />
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input type="date" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v as ContentStatus })}>
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
                onClick={() => setFormData({ ...formData, approvalStatus: 'pending', status: 'review' })}
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
