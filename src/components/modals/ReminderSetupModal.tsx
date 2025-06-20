
"use client";

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
    // Placeholder for saving logic
    console.log("Reminder Preferences:", { enablePush, enableEmail, email });
    toast({
      title: "Preferences Saved (Demo)",
      description: "Your reminder preferences have been noted. Full functionality requires backend setup.",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[525px] bg-card">
        <DialogHeader>
          <DialogTitle className="font-headline text-card-foreground text-2xl">Setup Content Reminders</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Stay on top of your content schedule. Blisszits can send you reminders for deadlines and important tasks.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-4 p-5 border border-border rounded-lg shadow-sm bg-background/30">
            <div className="flex items-center justify-between">
              <Label htmlFor="pushToggle" className="flex items-center gap-2 font-semibold text-card-foreground text-base">
                <BellRing className="text-primary" /> Enable Push Notifications
              </Label>
              <Switch
                id="pushToggle"
                checked={enablePush}
                onCheckedChange={setEnablePush}
                aria-label="Enable push notifications"
              />
            </div>
            <p className="text-sm text-muted-foreground ml-7">
              Get instant alerts directly on your devices. Requires browser permission.
            </p>
          </div>
          
          <div className="space-y-4 p-5 border border-border rounded-lg shadow-sm bg-background/30">
            <div className="flex items-center justify-between">
              <Label htmlFor="emailToggle" className="flex items-center gap-2 font-semibold text-card-foreground text-base">
                <Mail className="text-primary" /> Enable Email Notifications
              </Label>
              <Switch
                id="emailToggle"
                checked={enableEmail}
                onCheckedChange={setEnableEmail}
                aria-label="Enable email notifications"
              />
            </div>
            <p className="text-sm text-muted-foreground ml-7">
              Receive summaries and important alerts in your inbox.
            </p>
            {enableEmail && (
              <div className="ml-7 mt-3">
                <Label htmlFor="reminderEmail" className="text-sm font-medium text-card-foreground">Notification Email</Label>
                <Input
                  id="reminderEmail"
                  type="email"
                  placeholder="your-email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1 bg-input text-foreground"
                />
              </div>
            )}
          </div>
           <p className="text-xs text-muted-foreground text-center pt-2">
              Note: Full reminder functionality (sending actual push notifications and emails) requires backend server setup and is currently for demonstration purposes in this UI.
            </p>
        </div>
        <DialogFooter className="mt-2">
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleSavePreferences} className="font-semibold">Save Preferences</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
