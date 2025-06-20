
"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, KeyRound, ShieldAlert, Bell, Loader2, UserCircle, Eye, EyeOff, Edit } from 'lucide-react';
import { ReminderSetupModal } from '@/components/modals/ReminderSetupModal';
import { OnboardingModal } from '@/components/modals/OnboardingModal'; // For interests

interface ProfileDashboardProps {
  onBack: () => void;
}

export const ProfileDashboard = ({ onBack }: ProfileDashboardProps) => {
  const { user, updateUserPassword, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isInterestsModalOpen, setIsInterestsModalOpen] = useState(false);
  // const [userInterests, setUserInterests] = useState<string[]>([]); // Fetch from DB if stored

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
  
  const handleSaveInterests = (interests: string[]) => {
    // setUserInterests(interests); // Update local state
    // Here, you would also save these interests to Firestore user profile
    console.log("Updated interests:", interests); 
    toast({ title: "Interests Updated", description: "Your content preferences have been saved."});
    setIsInterestsModalOpen(false);
  };


  if (!user) {
    return (
      <div className="p-4 md:p-8 text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading user profile...</p>
        <Button onClick={onBack} variant="link" className="mt-6 text-primary hover:text-primary/80">Go Back</Button>
      </div>
    );
  }
  
  const PasswordVisibilityToggle = ({ visible, onClick }: { visible: boolean, onClick: () => void }) => (
    <Button type="button" variant="ghost" size="icon" onClick={onClick} className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground">
      {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      <span className="sr-only">{visible ? "Hide password" : "Show password"}</span>
    </Button>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Button onClick={onBack} variant="ghost" className="text-primary font-semibold flex items-center gap-2 px-0 hover:underline hover:bg-transparent focus-visible:bg-transparent text-base">
          <ArrowLeft size={20}/> Back to Dashboard
        </Button>
      </div>
      
      <Card className="bg-card shadow-xl border-border/80">
        <CardHeader>
            <div className="flex items-center gap-3">
                <UserCircle className="w-10 h-10 text-primary" />
                <div>
                    <CardTitle className="text-3xl font-bold text-foreground font-headline">Profile Settings</CardTitle>
                    <CardDescription className="text-base text-muted-foreground mt-1">Manage your account details and preferences.</CardDescription>
                </div>
            </div>
        </CardHeader>
      </Card>


      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1 lg:col-span-1 shadow-lg border-border/70">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-card-foreground">Account Information</CardTitle>
            <CardDescription>Your basic account details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email Address</Label>
              <p className="text-card-foreground font-semibold text-base break-all">{user.email || "N/A"}</p>
            </div>
            {user.phoneNumber && (
               <div>
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone Number</Label>
                <p className="text-card-foreground font-semibold text-base">{user.phoneNumber}</p>
              </div>
            )}
            {user.displayName && (
               <div>
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Display Name</Label>
                <p className="text-card-foreground font-semibold text-base">{user.displayName}</p>
              </div>
            )}
             <div>
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">User ID</Label>
                <p className="text-xs text-muted-foreground break-all">{user.uid}</p>
              </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
             <Button variant="outline" size="sm" disabled>
                <Edit size={14} className="mr-2"/> Edit Details (Soon)
             </Button>
          </CardFooter>
        </Card>

        <Card className="col-span-1 md:col-span-1 lg:col-span-2 shadow-lg border-border/70">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-card-foreground">Security &amp; Preferences</CardTitle>
            <CardDescription>Manage your password, content interests, and notifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-10">
            {user.providerData.some(provider => provider.providerId === 'password') && (
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <h3 className="text-lg font-semibold text-card-foreground mb-1">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative mt-1">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="pl-10 pr-10 py-2.5"
                        required
                        aria-required="true"
                        aria-label="New password"
                      />
                      <PasswordVisibilityToggle visible={showNewPassword} onClick={() => setShowNewPassword(!showNewPassword)} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative mt-1">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="pl-10 pr-10 py-2.5"
                        required
                        aria-required="true"
                        aria-label="Confirm new password"
                      />
                       <PasswordVisibilityToggle visible={showConfirmPassword} onClick={() => setShowConfirmPassword(!showConfirmPassword)} />
                    </div>
                  </div>
                </div>
                {passwordError && (
                    <div role="alert" className="p-3 bg-destructive/10 border border-destructive/30 rounded-md text-sm text-destructive flex items-start gap-2">
                        <ShieldAlert size={18} className="flex-shrink-0 mt-0.5"/> 
                        <span>{passwordError}</span>
                    </div>
                )}
                <Button type="submit" disabled={isAuthLoading || !newPassword || !confirmPassword} className="font-semibold">
                  {isAuthLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isAuthLoading ? 'Updating...' : 'Update Password'}
                </Button>
                 <p className="text-xs text-muted-foreground">
                  If you haven't signed in recently, Firebase may require re-authentication for sensitive operations like password changes.
              </p>
              </form>
            )}
             {!user.providerData.some(provider => provider.providerId === 'password') && (
                <div>
                    <h3 className="text-lg font-semibold text-card-foreground mb-1">Password Management</h3>
                    <p className="text-sm text-muted-foreground">
                        You signed in using a third-party provider (e.g., Google, Phone). Password changes are managed through that provider.
                    </p>
                </div>
             )}

            <div className="border-t pt-8 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2">Content Interests</h3>
                <p className="text-sm text-muted-foreground mb-3">Help us tailor AI recommendations for you.</p>
                <Button onClick={() => setIsInterestsModalOpen(true)} variant="outline" className="hover:border-primary hover:text-primary">
                  <Edit size={16} className="mr-2" /> Manage Your Interests
                </Button>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2">Notification Preferences</h3>
                 <Button onClick={() => setIsReminderModalOpen(true)} variant="outline" className="hover:border-primary hover:text-primary">
                  <Bell className="mr-2 h-4 w-4" /> Manage Reminders
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <ReminderSetupModal isOpen={isReminderModalOpen} onClose={() => setIsReminderModalOpen(false)} />
      <OnboardingModal 
        isOpen={isInterestsModalOpen} 
        onClose={() => setIsInterestsModalOpen(false)} 
        onSaveInterests={handleSaveInterests} 
        // Pass existing interests if fetched: initialSelectedInterests={userInterests}
      />
    </div>
  );
};
