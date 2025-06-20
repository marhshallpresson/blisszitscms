
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

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
    // Placeholder for saving logic
    console.log({ enablePush, enableEmail, email });
    toast({
      title: "Preferences Saved",
      description: "Your reminder preferences have been updated.",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-card">
        <DialogHeader>
          <DialogTitle className="font-headline text-card-foreground">Setup Reminders</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <p className="text-muted-foreground">
            Blisszits can send you reminders about content deadlines. Configure your notification preferences below.
          </p>
          <div className="space-y-4 p-4 border border-border rounded-lg">
            <div className="flex items-center justify-between">
              <Label htmlFor="pushToggle" className="font-semibold text-card-foreground">Enable Push Notifications</Label>
              <Switch
                id="pushToggle"
                checked={enablePush}
                onCheckedChange={setEnablePush}
              />
            </div>
            <p className="text-sm text-muted-foreground">Get alerts directly on your devices. Requires browser permission.</p>
          </div>
          <div className="space-y-4 p-4 border border-border rounded-lg">
            <div className="flex items-center justify-between">
              <Label htmlFor="emailToggle" className="font-semibold text-card-foreground">Enable Email Notifications</Label>
              <Switch
                id="emailToggle"
                checked={enableEmail}
                onCheckedChange={setEnableEmail}
              />
            </div>
            <p className="text-sm text-muted-foreground">Receive summaries and important alerts in your inbox.</p>
            {enableEmail && (
              <Input
                type="email"
                placeholder="your-email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-2"
              />
            )}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleSavePreferences}>Save Preferences</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
