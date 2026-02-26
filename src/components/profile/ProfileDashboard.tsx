// src/components/profile/ProfileDashboard.tsx
"use client";

import { useState, useEffect, type FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mail, KeyRound, ShieldAlert, Loader2, UserCircle, User, Eye, EyeOff, Edit, Save, Phone, CalendarDays, MapPin, Globe, Link as LinkIconLucide, AlertTriangle, MessageSquare } from 'lucide-react';
import type { UserProfile } from '@/types/user';

const socialPlatforms = [
  { key: 'facebook', label: 'Facebook', placeholder: 'facebook.com/username' },
  { key: 'instagram', label: 'Instagram', placeholder: 'instagram.com/username' },
  { key: 'twitter', label: 'X (Twitter)', placeholder: 'twitter.com/username' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/username' },
  { key: 'tiktok', label: 'TikTok', placeholder: 'tiktok.com/@username' },
  { key: 'youtube', label: 'YouTube', placeholder: 'youtube.com/c/username' },
  { key: 'pinterest', label: 'Pinterest', placeholder: 'pinterest.com/username' },
  { key: 'snapchat', label: 'Snapchat', placeholder: 'snapchat.com/add/username' },
  { key: 'reddit', label: 'Reddit', placeholder: 'reddit.com/user/username' },
  { key: 'whatsapp', label: 'WhatsApp Number', placeholder: '+12345678900' },
] as const;


export const ProfileDashboard = () => {
  const { user, userProfile, updateUserProfile, updateUserPassword } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    displayName: '',
    phoneNumber: '',
    dateOfBirth: '',
    address: { street: '', city: '', state: '', country: '' },
    socialMedia: {},
  });

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || '',
        email: userProfile.email || '',
        phoneNumber: userProfile.phoneNumber || '',
        dateOfBirth: userProfile.dateOfBirth || '', 
        address: userProfile.address || { street: '', city: '', state: '', country: '' },
        socialMedia: userProfile.socialMedia || {},
      });
    }
  }, [userProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      address: {
        ...(prev.address || {}),
        [name]: value,
      },
    }));
  };
  
  const handleSocialMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      socialMedia: {
        ...(prev.socialMedia || {}),
        [name]: value || undefined, 
      },
    }));
  };

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmittingProfile(true);
    try {
      const profileToUpdate = { ...formData };
      delete profileToUpdate.email; 
      await updateUserProfile(profileToUpdate);
      toast({ title: "Profile Updated", description: "Your information has been saved." });
    } catch (error: any) {
      toast({ title: "Update Failed", description: error.message || "Could not save profile.", variant: "destructive" });
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    setIsSubmittingPassword(true);
    try {
      await updateUserPassword(newPassword);
      toast({ title: "Password Updated" });
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setPasswordError(error.message);
    } finally {
      setIsSubmittingPassword(false);
    }
  };
  
  const PasswordVisibilityToggle = ({ visible, onClick }: { visible: boolean, onClick: () => void }) => (
    <Button type="button" variant="ghost" size="icon" onClick={onClick} className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground">
      {visible ? <EyeOff size={16} /> : <Eye size={16} />}
    </Button>
  );

  return (
    <div className="space-y-8">
      <Card className="bg-card shadow-xl border-border/80">
        <CardHeader>
            <div className="flex items-center gap-4">
                <UserCircle className="w-10 h-10 text-primary flex-shrink-0" />
                <div>
                    <CardTitle className="text-3xl font-bold text-foreground font-headline">Account Settings</CardTitle>
                    <CardDescription className="text-base text-muted-foreground mt-1">Manage your account details and security.</CardDescription>
                </div>
            </div>
        </CardHeader>
      </Card>
      
      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-lg border-border/70">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center gap-2"><Edit size={20} className="text-primary"/> Edit Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="displayName">Full Name</Label>
                  <div className="relative mt-1">
                     <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="displayName" name="displayName" value={formData.displayName || ''} onChange={handleInputChange} required className="pl-9 bg-input"/>
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                   <div className="relative mt-1">
                     <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" name="email" value={user?.email || ''} readOnly disabled className="pl-9 bg-muted/50 cursor-not-allowed"/>
                   </div>
                </div>
              </div>
              
              <Button type="submit" className="w-full sm:w-auto font-semibold bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmittingProfile}>
                {isSubmittingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save size={16} className="mr-2" />}
                Save Profile Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="shadow-lg border-border/70">
            <CardHeader>
              <CardTitle className="font-headline text-xl flex items-center gap-2"><ShieldAlert size={20} className="text-primary"/> Security</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <h4 className="font-semibold text-card-foreground">Change Password</h4>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative mt-1">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="newPassword" type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="pl-9 pr-10 bg-input"/>
                      <PasswordVisibilityToggle visible={showNewPassword} onClick={() => setShowNewPassword(!showNewPassword)} />
                  </div>
                </div>
                {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
                <Button type="submit" className="w-full font-semibold" variant="outline" disabled={isSubmittingPassword}>
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
