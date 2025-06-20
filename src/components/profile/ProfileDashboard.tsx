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
import { Mail, KeyRound, ShieldAlert, Loader2, UserCircle, User, Eye, EyeOff, Edit, Save, Phone, CalendarDays, MapPin, Globe, Link as LinkIconLucide } from 'lucide-react';
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
  const { user, userProfile, updateUserProfile, updateUserPassword, isLoadingAuth, isLoadingProfile } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    displayName: '',
    phoneNumber: '',
    dateOfBirth: '', // YYYY-MM-DD
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
        email: userProfile.email || '', // Email is usually from auth user, but good to have if stored
        phoneNumber: userProfile.phoneNumber || '',
        dateOfBirth: userProfile.dateOfBirth || '', 
        address: {
          street: userProfile.address?.street || '',
          city: userProfile.address?.city || '',
          state: userProfile.address?.state || '',
          country: userProfile.address?.country || '',
        },
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
      const cleanedSocialMedia: Partial<UserProfile['socialMedia']> = {};
      if (formData.socialMedia) {
        for (const key in formData.socialMedia) {
          const platformKey = key as keyof UserProfile['socialMedia'];
          if (formData.socialMedia[platformKey]?.trim()) {
            cleanedSocialMedia[platformKey] = formData.socialMedia[platformKey];
          } else {
            cleanedSocialMedia[platformKey] = undefined; // Explicitly set to undefined to remove
          }
        }
      }
      const profileToUpdate = { ...formData, socialMedia: cleanedSocialMedia };
      // Do not include email in the update payload if it's not meant to be changed here
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
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }
    setIsSubmittingPassword(true);
    try {
      await updateUserPassword(newPassword);
      toast({ title: "Password Updated", description: "Your password has been changed successfully." });
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setPasswordError(error.message || "Failed to update password.");
      toast({ title: "Password Update Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmittingPassword(false);
    }
  };
  
  const PasswordVisibilityToggle = ({ visible, onClick }: { visible: boolean, onClick: () => void }) => (
    <Button type="button" variant="ghost" size="icon" onClick={onClick} className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground">
      {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      <span className="sr-only">{visible ? "Hide password" : "Show password"}</span>
    </Button>
  );

  const overallLoading = isLoadingAuth || isLoadingProfile;

  if (overallLoading && !userProfile) { // Show loader if still loading initial profile
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!user || !userProfile) {
    return <div className="flex justify-center items-center h-64"><p>User data not available. Please try re-logging.</p></div>;
  }

  return (
    <div className="container mx-auto px-0 md:px-4 py-8 md:py-12 space-y-8">
      <Card className="bg-card shadow-xl border-border/80">
        <CardHeader>
            <div className="flex items-center gap-3">
                <UserCircle className="w-10 h-10 text-primary" />
                <div>
                    <CardTitle className="text-3xl font-bold text-foreground font-headline">Account Settings</CardTitle>
                    <CardDescription className="text-base text-muted-foreground mt-1">Manage your account details, preferences, and security.</CardDescription>
                </div>
            </div>
        </CardHeader>
      </Card>
      
      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
        {/* Profile Information Card */}
        <Card className="lg:col-span-2 shadow-lg border-border/70">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center gap-2"><Edit size={20} className="text-primary"/> Edit Profile Information</CardTitle>
            <CardDescription>Keep your personal details up to date.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="displayName" className="font-medium">Full Name <span className="text-destructive">*</span></Label>
                  <div className="relative mt-1">
                     <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="displayName" name="displayName" value={formData.displayName || ''} onChange={handleInputChange} placeholder="Your full name" required className="pl-9 bg-input"/>
                  </div>
                </div>
                <div>
                  <Label htmlFor="email" className="font-medium">Email Address</Label>
                   <div className="relative mt-1">
                     <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" name="email" type="email" value={user.email || ''} readOnly disabled className="pl-9 bg-muted/50 cursor-not-allowed"/>
                   </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="phoneNumber" className="font-medium">Phone Number</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="phoneNumber" name="phoneNumber" type="tel" value={formData.phoneNumber || ''} onChange={handleInputChange} placeholder="+1234567890" className="pl-9 bg-input"/>
                  </div>
                </div>
                <div>
                  <Label htmlFor="dateOfBirth" className="font-medium">Date of Birth</Label>
                  <div className="relative mt-1">
                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth || ''} onChange={handleInputChange} className="pl-9 bg-input appearance-none"/>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-medium flex items-center gap-2"><MapPin size={16} className="text-primary"/> Address (Optional)</Label>
                <Textarea name="street" value={formData.address?.street || ''} onChange={handleAddressChange} placeholder="Street Address" className="bg-input" rows={2}/>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input name="city" value={formData.address?.city || ''} onChange={handleAddressChange} placeholder="City" className="bg-input"/>
                  <Input name="state" value={formData.address?.state || ''} onChange={handleAddressChange} placeholder="State / Province" className="bg-input"/>
                  <Input name="country" value={formData.address?.country || ''} onChange={handleAddressChange} placeholder="Country" className="bg-input"/>
                </div>
              </div>
              
              <div className="space-y-3 pt-4 border-t">
                 <Label className="font-medium flex items-center gap-2"><Globe size={16} className="text-primary"/> Social Media Links (Optional)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  {socialPlatforms.map(platform => (
                    <div key={platform.key}>
                      <Label htmlFor={platform.key} className="text-sm text-muted-foreground">{platform.label}</Label>
                      <div className="relative mt-1">
                        <LinkIconLucide className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id={platform.key} name={platform.key} value={formData.socialMedia?.[platform.key] || ''} onChange={handleSocialMediaChange} placeholder={platform.placeholder} className="bg-input mt-1 pl-9"/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full sm:w-auto font-semibold bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmittingProfile || isLoadingAuth}>
                {isSubmittingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save size={16} className="mr-2" />}
                Save Profile Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card className="shadow-lg border-border/70">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center gap-2"><ShieldAlert size={20} className="text-primary"/> Security</CardTitle>
            <CardDescription>Manage your account security settings.</CardDescription>
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
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                 <div className="relative mt-1">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="pl-9 pr-10 bg-input"/>
                    <PasswordVisibilityToggle visible={showConfirmPassword} onClick={() => setShowConfirmPassword(!showConfirmPassword)} />
                 </div>
              </div>
              {passwordError && <p className="text-sm text-destructive flex items-center gap-1"><AlertTriangle size={14}/> {passwordError}</p>}
              <Button type="submit" className="w-full sm:w-auto font-semibold" variant="outline" disabled={isSubmittingPassword || isLoadingAuth}>
                {isSubmittingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound size={16} className="mr-2"/>}
                Update Password
              </Button>
            </form>
          </CardContent>
          <CardFooter className="border-t pt-4">
             <p className="text-xs text-muted-foreground">Ensure you use a strong, unique password. You may be asked to sign in again after changing your password.</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
