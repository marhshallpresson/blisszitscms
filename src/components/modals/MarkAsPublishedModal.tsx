// src/components/modals/MarkAsPublishedModal.tsx
"use client";

// This modal was for marking content as published in the CMS.
// It's not directly used in the basic corporate website. Kept for reference.

// import type { ContentItem } from '@/contexts/WorkspaceContext'; // Simplified
import { useState, useRef, ChangeEvent, FormEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input'; 
import { Label } from '@/components/ui/label';
// import { useWorkspace } from '@/contexts/WorkspaceContext'; // Simplified
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, UploadCloud, Loader2 } from 'lucide-react';

// Simplified placeholder type
interface ContentItem {
  id?: string;
  title?: string;
}

interface MarkAsPublishedModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ContentItem | null;
}

export const MarkAsPublishedModal = ({ isOpen, onClose, item }: MarkAsPublishedModalProps) => {
  // const { updateContentItem } = useWorkspace();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleConfirm = async (e: FormEvent) => {
    e.preventDefault();
    if (!item?.id) return;
    setIsSubmitting(true);
    console.log("Marking as published (placeholder):", item.title);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({ title: "Action (Demo)", description: "Marking content as published is a CMS feature." });
    setIsSubmitting(false);
    onClose();
  };
  
  useEffect(() => {
    if (!isOpen) {
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = ""; 
    }
  }, [isOpen]);

  if (!isOpen || !item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card opacity-70 pointer-events-none">
        <DialogHeader>
          <DialogTitle className="font-headline text-card-foreground">Mark as Published (Demo): {item.title}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Confirm publication and optionally upload a screenshot. (CMS Feature)
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleConfirm} className="space-y-6 py-4">
          <div>
            <Label htmlFor="publishedImage" className="text-card-foreground mb-2 block">
              Upload Screenshot (Optional)
            </Label>
            <div className="mt-1 flex justify-center items-center w-full h-40 border-2 border-dashed border-border rounded-lg cursor-pointer">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="h-full w-full object-contain rounded-lg p-1" data-ai-hint="screenshot preview"/>
              ) : (
                <div className="text-center text-muted-foreground p-4"><UploadCloud size={36} className="mx-auto mb-2" /><p>Click to upload</p></div>
              )}
              <Input id="publishedImage" type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" disabled/>
            </div>
          </div>
          <DialogFooter className="mt-2">
            <DialogClose asChild><Button type="button" variant="outline" onClick={onClose} disabled>Cancel</Button></DialogClose>
            <Button type="submit" className="font-semibold" disabled>
              <CheckCircle size={18} className="mr-2" /> Confirm (Demo)
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
