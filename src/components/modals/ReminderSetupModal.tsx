// src/components/modals/ReminderSetupModal.tsx
"use client";

// This modal was for setting up reminders in the CMS profile settings.
// Not used in the basic corporate website. Kept for reference.

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { BellRing, Mail } from 'lucide-react';

interface ReminderSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReminderSetupModal = ({ isOpen, onClose }: ReminderSetupModalProps) => {
  const [enablePush, setEnablePush] = useState(false);
  const [enableEmail, setEnableEmail] = useState(false);
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleSavePreferences = () => {
    console.log("Reminder Preferences (placeholder):", { enablePush, enableEmail, email });
    toast({
      title: "Preferences Saved (Demo)",
      description: "Reminder functionality is part of the CMS.",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[525px] bg-card opacity-70 pointer-events-none">
        <DialogHeader>
          <DialogTitle className="font-headline text-card-foreground text-2xl">Setup Reminders (Demo)</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Stay on top of your schedule. (CMS Feature)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-4 p-5 border border-border rounded-lg shadow-sm bg-background/30">
             <Label htmlFor="pushToggle" className="flex items-center gap-2 font-semibold text-card-foreground text-base">
                <BellRing className="text-primary" /> Enable Push Notifications
              </Label>
            <Switch id="pushToggle" checked={enablePush} onCheckedChange={setEnablePush} disabled />
          </div>
          <div className="space-y-4 p-5 border border-border rounded-lg shadow-sm bg-background/30">
            <Label htmlFor="emailToggle" className="flex items-center gap-2 font-semibold text-card-foreground text-base">
                <Mail className="text-primary" /> Enable Email Notifications
            </Label>
            <Switch id="emailToggle" checked={enableEmail} onCheckedChange={setEnableEmail} disabled/>
             {enableEmail && (
              <div className="ml-7 mt-3">
                <Label htmlFor="reminderEmail" className="text-sm font-medium text-card-foreground">Notification Email</Label>
                <Input id="reminderEmail" type="email" placeholder="your-email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mt-1 bg-input" disabled />
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="mt-2">
          <DialogClose asChild><Button variant="outline" onClick={onClose}>Cancel</Button></DialogClose>
          <Button onClick={handleSavePreferences} className="font-semibold" disabled>Save Preferences</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
