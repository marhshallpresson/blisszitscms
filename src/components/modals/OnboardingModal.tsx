
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveInterests: (interests: string[]) => void;
}

const PREDEFINED_INTERESTS = [
  'Technology', 'Photography', 'Cooking', 'Fitness', 'Travel', 
  'Gaming', 'Art & Design', 'Music', 'Writing', 'Fashion & Beauty', 
  'Education', 'Business & Finance', 'DIY & Crafts', 'Books & Literature', 
  'Movies & TV', 'Science & Nature', 'Health & Wellness', 'Parenting',
  'Social Media Strategy', 'Videography', 'Blogging', 'Podcasting',
  'Marketing', 'Entrepreneurship', 'Personal Development'
];

export const OnboardingModal = ({ isOpen, onClose, onSaveInterests }: OnboardingModalProps) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  useEffect(() => {
    // Reset selected interests when modal is opened/closed if needed,
    // or load existing user interests if available (future enhancement)
    if (!isOpen) {
      // setSelectedInterests([]); // Optional: clear selection on close
    }
  }, [isOpen]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleSave = () => {
    onSaveInterests(selectedInterests);
    // onClose(); // Parent will close it via onSaveInterests -> setIsOnboardingModalOpen(false)
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg bg-card">
        <DialogHeader>
          <DialogTitle className="font-headline text-card-foreground text-2xl">Personalize Your Experience</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Select a few interests so we can tailor content ideas for you. You can change these later.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="my-4 max-h-80 pr-3">
          <div className="flex flex-wrap gap-2">
            {PREDEFINED_INTERESTS.map(interest => {
              const isSelected = selectedInterests.includes(interest);
              return (
                <Badge
                  key={interest}
                  variant={isSelected ? "default" : "secondary"}
                  onClick={() => toggleInterest(interest)}
                  className={`cursor-pointer py-2 px-3 text-sm transition-all hover:opacity-80 active:scale-95
                              ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                >
                  {isSelected && <Check className="mr-1.5 h-4 w-4" />}
                  {interest}
                </Badge>
              );
            })}
          </div>
        </ScrollArea>

        <DialogFooter className="mt-2">
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>Skip for Now</Button>
          </DialogClose>
          <Button 
            onClick={handleSave} 
            disabled={selectedInterests.length === 0}
            className="font-semibold"
          >
            Save Interests
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
