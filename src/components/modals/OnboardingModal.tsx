// src/components/modals/OnboardingModal.tsx
"use client";

// This modal was for user onboarding (selecting interests) in the CMS.
// Not used in the basic corporate website. Kept for reference.

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  // onSaveInterests: (interests: string[]) => void;
}

const PREDEFINED_INTERESTS = [
  'Technology', 'Photography', 'Cooking', 'Fitness', 'Travel', 
  // ... other interests
];

export const OnboardingModal = ({ isOpen, onClose /*, onSaveInterests*/ }: OnboardingModalProps) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // useEffect logic simplified as modal is not actively used

  const toggleInterest = (interest: string) => {
    // Logic kept for structure, but won't be triggered
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleSave = () => {
    // onSaveInterests(selectedInterests);
    console.log("Saving interests (placeholder):", selectedInterests);
    onClose();
  };
  
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg bg-card opacity-70 pointer-events-none">
        <DialogHeader>
          <DialogTitle className="font-headline text-card-foreground text-2xl">Personalize Experience (Demo)</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Select interests. (CMS Feature)
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="my-4 max-h-80 pr-3">
          <div className="flex flex-wrap gap-2">
            {/* Mapping logic removed as it's a demo */}
            <Badge variant="secondary" className="py-2 px-3 text-sm">Interest 1</Badge>
            <Badge variant="secondary" className="py-2 px-3 text-sm">Interest 2</Badge>
          </div>
        </ScrollArea>

        <DialogFooter className="mt-2">
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>Skip</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled className="font-semibold">
            Save Interests
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
