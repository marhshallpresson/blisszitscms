// src/components/modals/ContentFormModal.tsx
"use client";

import type { ContentItem, ContentStatus, PostVariant, SocialAccount } from '@/contexts/WorkspaceContext';
import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWorkspace, CONTENT_STATUSES, getContentStatusLabel, normalizeContentStatus } from '@/contexts/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';
import { Edit, Loader2, Trash2, Calendar, CheckCircle2, Globe } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
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
  scheduledAt: '',
};

export const ContentFormModal = ({ isOpen, onClose, item }: { isOpen: boolean; onClose: () => void; item?: ContentItem | null; }) => {
  const [formData, setFormData] = useState<any>(initialFormData);
  const { createContentItem, updateContentItem, socialAccounts, scheduleContentItemForPublishing } = useWorkspace();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
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
      return formData.variants?.find((variant: any) => variant.id === variantId)?.text || '';
    }
    return '';
  };

  const setFieldValue = (fieldId: string, value: string) => {
    if (fieldId === 'idea') {
      setFormData((prev: any) => ({ ...prev, idea: value }));
      return;
    }
    if (fieldId === 'script') {
      setFormData((prev: any) => ({ ...prev, script: value }));
      return;
    }
    if (fieldId === 'caption') {
      setFormData((prev: any) => ({ ...prev, caption: value }));
      return;
    }
    if (fieldId.startsWith('variant:')) {
      const variantId = fieldId.replace('variant:', '');
      setFormData((prev: any) => ({
        ...prev,
        variants: (prev.variants || []).map((variant: any) =>
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
        // Logic to extract selected accounts from variants if needed...
      } else {
        setFormData(initialFormData);
        setSelectedAccounts([]);
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

  const handleSchedule = async () => {
    if (!item?.id) return;
    setIsScheduling(true);
    try {
      await scheduleContentItemForPublishing(item.id, formData.scheduledAt);
      toast({ title: "Content Scheduled", description: "Your post has been queued for publishing." });
      onClose();
    } catch (error: any) {
      toast({ title: "Scheduling Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsScheduling(false);
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
    setFormData((prev: any) => ({ ...prev, variants: [...(prev.variants || []), newVariant] }));
  };

  const toggleAccountSelection = (accountId: string) => {
    setSelectedAccounts(prev => 
      prev.includes(accountId) ? prev.filter(a => a !== accountId) : [...prev, accountId]
    );
  };

  const actionDisabled = (fieldId: string, allowGenerateWithSeed: boolean) => {
    const value = getFieldValue(fieldId);
    return {
      generate: !allowGenerateWithSeed && !value.trim(),
      improve: !value.trim(),
      shorten: !value.trim(),
    };
  };

  const isApproved = formData.approvalStatus === 'approved';

  return (
    <Dialog open={isOpen} onOpenChange={o => !o && onClose()}>
      <DialogContent className="sm:max-w-5xl bg-card max-h-[95vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2 border-b">
          <div className="flex justify-between items-center pr-8">
            <DialogTitle className="text-2xl font-headline">{item?.id ? "Edit Post" : "Create New Post"}</DialogTitle>
            {isApproved && (
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
              </Badge>
            )}
          </div>
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

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Tabs defaultValue="base" className="w-full">
                <TabsList className="w-full justify-start bg-muted/30 p-1 mb-4 h-auto flex-wrap">
                  <TabsTrigger value="base">Canonical Post</TabsTrigger>
                  {formData.variants?.map((v: any) => (
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
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="font-bold">Master Caption</Label>
                      <div className="grid gap-3">
                        <Textarea 
                          value={formData.caption} 
                          onChange={e => setFormData({ ...formData, caption: e.target.value })} 
                          rows={6} 
                          className="bg-input" 
                          placeholder="Write your primary caption here..."
                        />
                        <AiFieldActions
                          onAction={(operation) => {
                            void runFieldAction('caption', 'caption', operation, {
                              seed: ideaText || titleText,
                            });
                          }}
                          onHashtags={() => void handleSuggestHashtags('caption')}
                          hashtagsLoading={Boolean(hashtagLoading.caption)}
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

                {formData.variants?.map((v: any, i: number) => {
                  const fieldId = `variant:${v.id}`;
                  return (
                    <TabsContent key={v.id} value={v.id} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="font-bold capitalize">{v.network} Variant</Label>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setFormData({ ...formData, variants: formData.variants?.filter((x: any) => x.id !== v.id) })}>
                          <Trash2 className="h-4 w-4 mr-2" /> Remove
                        </Button>
                      </div>
                      <Textarea
                        value={v.text}
                        onChange={e => {
                          const newVariants = [...(formData.variants || [])];
                          newVariants[i] = { ...v, text: e.target.value };
                          setFormData({ ...formData, variants: newVariants });
                        }}
                        rows={8}
                        className="bg-input"
                      />
                      <AiFieldActions
                        onAction={(operation) => {
                          void runFieldAction(fieldId, 'variant', operation, {
                            seed: formData.caption || formData.idea,
                            network: v.network,
                          });
                        }}
                        onHashtags={() => void handleSuggestHashtags(fieldId)}
                        isLoading={{
                          generate: aiAssistant.isLoading(fieldId, 'generate'),
                          improve: aiAssistant.isLoading(fieldId, 'improve'),
                          shorten: aiAssistant.isLoading(fieldId, 'shorten'),
                        }}
                        disabled={actionDisabled(fieldId, Boolean(v.text?.trim() || captionText.trim() || ideaText.trim()))}
                      />
                    </TabsContent>
                  );
                })}
              </Tabs>
            </div>

            <div className="space-y-6">
              <div className="bg-muted/30 p-4 rounded-xl space-y-4">
                <Label className="font-bold flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Target Accounts
                </Label>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {socialAccounts.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">No accounts connected.</p>
                  ) : (
                    socialAccounts.map(account => (
                      <div key={account.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={account.id} 
                          checked={selectedAccounts.includes(account.id)}
                          onCheckedChange={() => toggleAccountSelection(account.id)}
                        />
                        <label htmlFor={account.id} className="text-sm font-medium leading-none cursor-pointer">
                          {account.accountName} 
                          <span className="text-[10px] text-muted-foreground ml-1 uppercase">({account.network})</span>
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-muted/30 p-4 rounded-xl space-y-4">
                <Label className="font-bold flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Scheduling
                </Label>
                <div className="space-y-2">
                  <Label htmlFor="sched-date" className="text-xs">Publish Date & Time</Label>
                  <Input 
                    id="sched-date"
                    type="datetime-local" 
                    value={formData.scheduledAt || ''} 
                    onChange={e => setFormData({ ...formData, scheduledAt: e.target.value })}
                    className="bg-background text-xs"
                  />
                </div>
                <Button 
                  onClick={handleSchedule} 
                  disabled={!isApproved || isScheduling || !formData.scheduledAt}
                  className="w-full bg-primary"
                >
                  {isScheduling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Calendar className="w-4 h-4 mr-2" />}
                  Schedule Post
                </Button>
                {!isApproved && (
                  <p className="text-[10px] text-amber-600 italic">Post must be approved before scheduling.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 border-t bg-muted/10">
          <div className="flex w-full justify-between items-center">
            <div className="flex gap-4">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase text-muted-foreground font-bold">Status</Label>
                <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v as ContentStatus })}>
                  <SelectTrigger className="h-8 text-xs w-[140px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CONTENT_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{getContentStatusLabel(s)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase text-muted-foreground font-bold">Approval</Label>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs block"
                  onClick={() => setFormData({ ...formData, approvalStatus: 'pending', status: 'review' })}
                  disabled={formData.approvalStatus === 'pending' || isApproved}
                >
                  {formData.approvalStatus === 'pending' ? 'Reviewing...' : isApproved ? 'Approved' : 'Request Review'}
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <DialogClose asChild><Button variant="ghost">Discard</Button></DialogClose>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-foreground text-background px-8">
                {isSubmitting && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                {item?.id ? "Update Content" : "Create Post"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
