// src/components/modals/OnboardingModal.tsx
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveInterests: (interests: string[]) => void;
}

const PREDEFINED_INTERESTS = [
  'Technology', 'Photography', 'Cooking', 'Fitness', 'Travel', 'Vlogging', 
  'Filmmaking', 'Comedy', 'Education', 'Startups', 'AI', 'Fashion', 
  'Beauty', 'Gaming', 'Music', 'Art & Design', 'Lifestyle', 'Business',
  'Marketing', 'Health & Wellness', 'DIY & Crafts', 'Finance & Investing'
];

export const OnboardingModal = ({ isOpen, onClose, onSaveInterests }: OnboardingModalProps) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const { toast } = useToast();

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) 
        ? prev.filter(i => i !== interest) 
        : [...prev, interest]
    );
  };

  const handleSave = () => {
    if (selectedInterests.length < 3) {
        toast({
            title: "Select at least 3 interests",
            description: "This helps us personalize your content ideas.",
            variant: "destructive"
        });
        return;
    }
    onSaveInterests(selectedInterests);
  };
  
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-2xl bg-card">
        <DialogHeader className="text-center">
          <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit mb-2">
            <Sparkles className="h-8 w-8 text-primary"/>
          </div>
          <DialogTitle className="font-headline text-card-foreground text-2xl">Personalize Your Experience</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Tell us what you're passionate about. Select at least 3 interests to get tailored AI content ideas.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="my-4 h-64 md:h-80 pr-3">
          <div className="flex flex-wrap gap-3 p-1">
            {PREDEFINED_INTERESTS.map(interest => {
                const isSelected = selectedInterests.includes(interest);
                return (
                    <button
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={`py-2 px-4 text-sm rounded-full transition-all duration-200 border
                            ${isSelected 
                                ? 'bg-primary text-primary-foreground border-primary' 
                                : 'bg-muted/50 hover:bg-muted border-transparent'
                            }`}
                    >
                       {interest} {isSelected && <Check className="inline-block ml-1 h-4 w-4"/>}
                    </button>
                )
            })}
          </div>
        </ScrollArea>

        <DialogFooter className="mt-2">
          <Button onClick={onClose} variant="outline">Skip for Now</Button>
          <Button onClick={handleSave} className="font-semibold bg-primary hover:bg-primary/90 text-primary-foreground">
            Save Interests ({selectedInterests.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
