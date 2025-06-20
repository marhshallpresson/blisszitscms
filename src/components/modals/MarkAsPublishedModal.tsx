
"use client";

import type { ContentItem } from '@/contexts/WorkspaceContext';
import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input'; // For file input styling if needed
import { Label } from '@/components/ui/label';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, UploadCloud, Image as ImageIcon, Loader2 } from 'lucide-react';

interface MarkAsPublishedModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ContentItem | null;
}

export const MarkAsPublishedModal = ({ isOpen, onClose, item }: MarkAsPublishedModalProps) => {
  const { updateContentItem } = useWorkspace();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // const [fileToUpload, setFileToUpload] = useState<File | null>(null); // For actual upload logic

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // setFileToUpload(file); // Store file for upload
      setImagePreview(URL.createObjectURL(file));
    } else {
      // setFileToUpload(null);
      setImagePreview(null);
    }
  };

  const handleConfirm = async (e: FormEvent) => {
    e.preventDefault();
    if (!item?.id) return;

    setIsSubmitting(true);
    try {
      // In a real app, upload fileToUpload to Firebase Storage here, get URL
      // const uploadedImageUrl = await uploadImageToStorage(fileToUpload);
      // Then update item with { status: 'Published', publishedImageUrl: uploadedImageUrl }

      await updateContentItem({ ...item, status: 'Published' });
      toast({
        title: "Content Published!",
        description: `"${item.title}" has been marked as published.`,
      });
      onClose();
    } catch (error) {
      console.error("Error marking as published:", error);
      toast({ title: "Error", description: "Failed to mark content as published.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset on close/open
  useState(() => {
    if (!isOpen) {
      setImagePreview(null);
      // setFileToUpload(null);
    }
  });


  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        setImagePreview(null);
        // setFileToUpload(null);
      }
    }}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="font-headline text-card-foreground">Mark as Published: {item.title}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Confirm that this content has been published. Optionally, upload a screenshot or link.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleConfirm} className="space-y-6 py-4">
          <div>
            <Label htmlFor="publishedImage" className="text-card-foreground mb-2 block">
              Upload Screenshot (Optional)
            </Label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="mt-1 flex justify-center items-center w-full h-40 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors bg-muted/20"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="h-full w-full object-contain rounded-lg p-1" />
              ) : (
                <div className="text-center text-muted-foreground p-4">
                  <UploadCloud size={36} className="mx-auto mb-2" />
                  <p className="text-sm">Click or drag file to upload</p>
                  <p className="text-xs">PNG, JPG, GIF up to 5MB</p>
                </div>
              )}
              <input
                id="publishedImage"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/gif"
                className="hidden"
              />
            </div>
            {imagePreview && (
                <Button variant="link" size="sm" className="mt-1 text-xs" onClick={() => {setImagePreview(null); if(fileInputRef.current) fileInputRef.current.value = ""; /*setFileToUpload(null)*/}}>
                    Clear image
                </Button>
            )}
            <p className="text-xs text-muted-foreground mt-2">
                Actual image upload to cloud storage is not implemented in this step. This is a UI placeholder.
            </p>
          </div>
         
          <DialogFooter className="mt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            </DialogClose>
            <Button type="submit" className="font-semibold" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <CheckCircle size={18} className="mr-2" /> Confirm &amp; Mark Published
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
