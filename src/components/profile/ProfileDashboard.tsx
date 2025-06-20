// src/components/profile/ProfileDashboard.tsx
"use client";

// This component's role is changing. For a corporate site, it might not be used,
// or it could be a settings page if there's a client portal.
// For now, it's a placeholder.

import { useState } from 'react';
// import { useAuth } from '@/contexts/AuthContext'; // AuthContext is simplified
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, KeyRound, ShieldAlert, Bell, Loader2, UserCircle, Eye, EyeOff, Edit } from 'lucide-react';
// import { ReminderSetupModal } from '@/components/modals/ReminderSetupModal'; // No reminders for basic site
// import { OnboardingModal } from '@/components/modals/OnboardingModal'; // No onboarding for basic site
import Link from 'next/link';

interface ProfileDashboardProps {
  onBack?: () => void; // Made optional as it might not be used
}

export const ProfileDashboard = ({ onBack }: ProfileDashboardProps) => {
  // const { user, updateUserPassword, isLoading: isAuthLoading } = useAuth(); // AuthContext simplified
  const { toast } = useToast();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  // const [isInterestsModalOpen, setIsInterestsModalOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false); // Local loading state

  // Mock user for structure, as AuthContext might not provide a logged-in user
  const user = {
    email: "contact@blisszits.com",
    uid: "corporate-site-user",
    providerData: [], // Assume no specific auth provider for this demo
    phoneNumber: null,
    displayName: "Blisszits Admin"
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setIsAuthLoading(true);
    console.log("Password change attempt (corporate site - placeholder)");
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({ title: "Action (Demo)", description: "Password management is currently disabled." });
    setIsAuthLoading(false);
  };
  
  // const handleSaveInterests = (interests: string[]) => { ... }; // Not used


  if (!user) { // This condition might not be hit if user is mocked
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading...</p>
        {onBack && <Button onClick={onBack} variant="link" className="mt-6 text-primary hover:text-primary/80">Go Back</Button>}
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
    <div className="container mx-auto px-4 py-8 md:py-12 space-y-8">
      {onBack && (
        <div className="flex items-center justify-between">
          <Button onClick={onBack} variant="ghost" className="text-primary font-semibold flex items-center gap-2 px-0 hover:underline hover:bg-transparent focus-visible:bg-transparent text-base">
            <ArrowLeft size={20}/> Back to Main Site
          </Button>
        </div>
      )}
      
      <Card className="bg-card shadow-xl border-border/80">
        <CardHeader>
            <div className="flex items-center gap-3">
                <UserCircle className="w-10 h-10 text-primary" />
                <div>
                    <CardTitle className="text-3xl font-bold text-foreground font-headline">Account Settings (Demo)</CardTitle>
                    <CardDescription className="text-base text-muted-foreground mt-1">Manage account details and preferences. (Placeholder)</CardDescription>
                </div>
            </div>
        </CardHeader>
      </Card>

      <p className="text-center text-muted-foreground">
        For a corporate website, user-specific profile settings are typically not applicable unless there is a client portal.
        This page is a placeholder.
      </p>
      <div className="text-center mt-8">
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/">Return to Homepage</Link>
        </Button>
      </div>

      {/* Original content for settings, now mostly placeholder/disabled */}
      {/* 
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1 lg:col-span-1 shadow-lg border-border/70">
          <CardHeader>...</CardHeader><CardContent>...</CardContent><CardFooter>...</CardFooter>
        </Card>
        <Card className="col-span-1 md:col-span-1 lg:col-span-2 shadow-lg border-border/70">
          <CardHeader>...</CardHeader><CardContent>...</CardContent>
        </Card>
      </div>
      */}
      {/* ReminderSetupModal and OnboardingModal calls removed */}
    </div>
  );
};