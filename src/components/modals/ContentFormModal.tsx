
"use client";

import type { ContentItem, ContentStatus } from '@/contexts/WorkspaceContext';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWorkspace, CONTENT_STATUSES } from '@/contexts/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';

interface ContentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: ContentItem | null; // null for new item, ContentItem for editing
}

const initialFormData: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'> = {
  title: '',
  idea: '',
  script: '',
  dueDate: '',
  status: 'Draft',
};

export const ContentFormModal = ({ isOpen, onClose, item }: ContentFormModalProps) => {
  const [formData, setFormData] = useState<Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt' > | ContentItem>(initialFormData);
  const { createContentItem, updateContentItem } = useWorkspace();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        ...item,
        dueDate: item.dueDate ? new Date(item.dueDate).toISOString().split('T')[0] : '', // Format for date input
      });
    } else {
      setFormData(initialFormData);
    }
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
      if ('id' in formData && formData.id) { // Editing existing item
        await updateContentItem(formData as ContentItem);
        toast({ title: "Content Updated", description: `Content "${formData.title}" has been updated.` });
      } else { // Creating new item
        await createContentItem(formData);
        toast({ title: "Content Created", description: `Content "${formData.title}" has been created.` });
      }
      onClose();
    } catch (error) {
      console.error("Failed to save content:", error);
      toast({ title: "Error", description: "Failed to save content. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-card max-h-[90vh] flex flex-col">
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
              placeholder="Content Title"
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
              placeholder="What's the main idea?"
              className="w-full p-2 bg-muted rounded-lg text-card-foreground"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="script" className="text-card-foreground">Script / Body</Label>
            <Textarea
              id="script"
              name="script"
              value={formData.script || ''}
              onChange={handleChange}
              placeholder="Write your script or content body here..."
              className="w-full p-2 bg-muted rounded-lg text-card-foreground"
              rows={8}
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
            {isSubmitting ? 'Saving...' : (item?.id ? 'Save Changes' : 'Create Post')}
          </Button>
        </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
