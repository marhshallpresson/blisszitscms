
"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, KeyRound, ShieldAlert, Bell, Loader2 } from 'lucide-react';
import { ReminderSetupModal } from '@/components/modals/ReminderSetupModal'; 

interface ProfileDashboardProps {
  onBack: () => void;
}

export const ProfileDashboard = ({ onBack }: ProfileDashboardProps) => {
  const { user, updateUserPassword, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false); 

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!newPassword) {
      setPasswordError("New password cannot be empty.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    try {
      await updateUserPassword(newPassword);
      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      });
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error("Password update error:", error);
      setPasswordError(error.message || "Failed to update password.");
      toast({
        title: "Password Update Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="p-4 md:p-8 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-4" />
        <p>Loading user profile...</p>
        <Button onClick={onBack} variant="link" className="mt-4">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <Button onClick={onBack} variant="ghost" className="text-primary font-semibold mb-6 flex items-center gap-2 px-0 hover:underline hover:bg-transparent focus-visible:bg-transparent">
        <ArrowLeft size={18}/> Back to Dashboard
      </Button>
      <h1 className="text-4xl font-bold text-foreground font-headline mb-8">Profile Settings</h1>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Account Information</CardTitle>
            <CardDescription>View your basic account details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Email Address</Label>
              <p className="text-foreground font-semibold break-all">{user.email || "N/A"}</p>
            </div>
            {user.phoneNumber && (
               <div>
                <Label className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                <p className="text-foreground font-semibold">{user.phoneNumber}</p>
              </div>
            )}
            {user.displayName && (
               <div>
                <Label className="text-sm font-medium text-muted-foreground">Display Name</Label>
                <p className="text-foreground font-semibold">{user.displayName}</p>
              </div>
            )}
             <div>
                <Label className="text-sm font-medium text-muted-foreground">User ID</Label>
                <p className="text-xs text-muted-foreground break-all">{user.uid}</p>
              </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Security &amp; Preferences</CardTitle>
            <CardDescription>Manage your account security and notification preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {user.providerData.some(provider => provider.providerId === 'password') && (
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="pl-10"
                        required
                        aria-required="true"
                        aria-label="New password"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="pl-10"
                        required
                        aria-required="true"
                        aria-label="Confirm new password"
                      />
                    </div>
                  </div>
                </div>
                {passwordError && (
                  <p className="text-sm text-destructive flex items-center gap-2"><ShieldAlert size={16}/> {passwordError}</p>
                )}
                <Button type="submit" disabled={isAuthLoading || !newPassword || !confirmPassword} className="font-semibold">
                  {isAuthLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isAuthLoading ? 'Updating...' : 'Update Password'}
                </Button>
                 <p className="text-xs text-muted-foreground">
                  Firebase may require you to re-authenticate for sensitive operations like changing your password if you haven't signed in recently.
              </p>
              </form>
            )}
             {!user.providerData.some(provider => provider.providerId === 'password') && (
                <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Password Management</h3>
                    <p className="text-sm text-muted-foreground">
                        You signed in using a third-party provider (e.g., Google, Phone). Password changes are managed through that provider.
                    </p>
                </div>
             )}


            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">Notification Preferences</h3>
               <Button onClick={() => setIsReminderModalOpen(true)} variant="outline">
                <Bell className="mr-2 h-4 w-4" /> Manage Reminders
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <ReminderSetupModal isOpen={isReminderModalOpen} onClose={() => setIsReminderModalOpen(false)} />
    </div>
  );
};
