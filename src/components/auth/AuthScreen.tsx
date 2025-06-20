
// src/components/auth/AuthScreen.tsx
"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AppLogo } from '@/components/layout/AppLogo';
import { Mail, KeyRound, UserPlus, LogIn, AlertTriangle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { EmailPasswordCredentials } from '@/types/auth';

export const AuthScreen = () => {
  const {
    user,
    signUpWithEmail,
    signInWithEmail,
    isLoadingAuth,
    userProfile,
    isLoadingProfile
  } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isClient, setIsClient] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const queryMode = searchParams.get('mode');
    if (queryMode === 'signup' || queryMode === 'signin') {
      setMode(queryMode);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isLoadingAuth && !isLoadingProfile && user) {
      if (userProfile?.onboardingCompleted) {
        router.push('/app/dashboard'); 
      } else {
        if (!isLoadingProfile) router.push('/onboarding');
      }
    }
  }, [user, userProfile, isLoadingAuth, isLoadingProfile, router]);


  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setFormLoading(true);

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setFormLoading(false);
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        setFormLoading(false);
        return;
      }
    }

    const credentials: EmailPasswordCredentials = { email, password };

    try {
      if (mode === 'signup') {
        const newUser = await signUpWithEmail(credentials);
        if (newUser) {
          toast({ title: "Account Created!", description: "Welcome! Let's get you set up." });
          router.push('/onboarding'); 
        }
      } else { 
        const signedInUser = await signInWithEmail(credentials);
        if (signedInUser) {
          toast({ title: "Signed In Successfully!", description: "Welcome back!" });
          // useEffect will handle redirect based on onboarding status
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      toast({ title: "Authentication Failed", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setFormLoading(false);
    }
  };
  
  const toggleMode = () => {
    const newMode = mode === 'signin' ? 'signup' : 'signin';
    setMode(newMode);
    setError(null);
    router.replace(`/auth?mode=${newMode}`, { scroll: false }); 
  };

  if (!isClient || isLoadingAuth) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-secondary/30 to-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (user && !formLoading) { 
     return (
      <div className="w-full min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-secondary/30 to-background">
        <p className="text-muted-foreground">Checking your session...</p>
        <Loader2 className="h-8 w-8 animate-spin text-primary ml-2" />
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
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-background p-4 sm:p-8 antialiased">
      <Card className="w-full max-w-md shadow-2xl rounded-xl border-border/70 bg-card">
        <CardHeader className="text-center pt-8 pb-6">
          <Link href="/" className="inline-block mx-auto mb-4" aria-label="Back to homepage">
            <AppLogo iconSize={48} showName={false} />
          </Link>
          <CardTitle className="text-3xl font-bold text-foreground font-headline">
            {mode === 'signin' ? 'Welcome Back!' : 'Create Your Account'}
          </CardTitle>
          <CardDescription className="text-muted-foreground font-body text-base">
            {mode === 'signin' ? 'Sign in to continue to Blisszits App.' : 'Get started with Blisszits App.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-6 md:px-8 pb-6">
          {error && (
            <div className="bg-destructive/10 p-3 rounded-md flex items-center text-destructive text-sm">
              <AlertTriangle size={18} className="mr-2" />
              {error}
            </div>
          )}
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 pr-3 py-2.5 bg-input border-border focus:border-primary" required/>
              </div>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10 py-2.5 bg-input border-border focus:border-primary" required/>
                <PasswordVisibilityToggle visible={showPassword} onClick={() => setShowPassword(!showPassword)} />
              </div>
            </div>
            {mode === 'signup' && (
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                 <div className="relative mt-1">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10 pr-10 py-2.5 bg-input border-border focus:border-primary" required/>
                  <PasswordVisibilityToggle visible={showConfirmPassword} onClick={() => setShowConfirmPassword(!showConfirmPassword)} />
                </div>
              </div>
            )}
            <Button type="submit" className="w-full font-semibold py-3 text-base shadow-md bg-primary hover:bg-primary/90 text-primary-foreground" disabled={formLoading || isLoadingAuth}>
              {formLoading || isLoadingAuth ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (mode === 'signup' ? <UserPlus size={20} className="mr-2"/> : <LogIn size={20} className="mr-2"/>)}
              {formLoading || isLoadingAuth ? 'Processing...' : (mode === 'signup' ? 'Get Started' : 'Sign In')}
            </Button>
          </form>

          <Separator />
           
          <p className="text-center text-sm text-muted-foreground">
            {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}{' '}
            <Button variant="link" onClick={toggleMode} className="font-semibold text-primary p-0 h-auto">
              {mode === 'signin' ? 'Get Started' : 'Sign In'}
            </Button>
          </p>

        </CardContent>
        <CardFooter className="px-6 md:px-8 pb-8 pt-4">
          <p className="text-xs text-muted-foreground/80 text-center w-full font-body">
            By continuing, you agree to Blisszits' <Link href="/terms-of-service" className="underline hover:text-primary">Terms of Service</Link> and <Link href="/privacy-policy" className="underline hover:text-primary">Privacy Policy</Link>.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
