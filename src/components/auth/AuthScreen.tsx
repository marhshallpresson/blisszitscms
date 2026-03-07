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
import { getReadableFirebaseAuthMessage } from '@/lib/auth/firebase-auth-errors';

export const AuthScreen = () => {
  const {
    user,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    pendingGoogleLinkEmail,
    clearPendingGoogleLink,
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
  const [googleLoading, setGoogleLoading] = useState(false);
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  useEffect(() => {
    setIsClient(true);
    const queryMode = searchParams?.get('mode');
    if (queryMode === 'signup' || queryMode === 'signin') {
      setMode(queryMode);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isLoadingAuth && !isLoadingProfile && user) {
      if (userProfile?.onboardingCompleted === true) {
        router.push('/app/dashboard'); 
      } else if (userProfile?.onboardingCompleted === false) {
        router.push('/onboarding');
      }
    }
  }, [user, userProfile, isLoadingAuth, isLoadingProfile, router]);

  useEffect(() => {
    if (!pendingGoogleLinkEmail) return;
    setEmail((current) => (current.trim() ? current : pendingGoogleLinkEmail));
    if (mode !== 'signin') {
      setMode('signin');
      router.replace('/auth?mode=signin', { scroll: false });
    }
  }, [mode, pendingGoogleLinkEmail, router]);

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
      const friendly = getReadableFirebaseAuthMessage(err);
      setError(friendly);
      toast({ title: "Authentication Failed", description: friendly, variant: "destructive" });
    } finally {
      setFormLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.redirectStarted) {
        toast({
          title: 'Redirecting to Google',
          description: 'Complete sign-in in the Google tab to continue.',
        });
        return;
      }
      toast({ title: 'Signed in with Google', description: 'Welcome back!' });
    } catch (err: any) {
      const code = String(err?.code || '').trim();
      const message =
        typeof err?.message === 'string' && err.message.trim()
          ? err.message
          : getReadableFirebaseAuthMessage(err);
      setError(message);
      toast({
        title: code === 'ACCOUNT_LINK_REQUIRED' ? 'Link account required' : 'Google sign-in failed',
        description: message,
        variant: 'destructive',
      });
      if (code === 'ACCOUNT_LINK_REQUIRED') {
        setMode('signin');
        router.replace('/auth?mode=signin', { scroll: false });
      }
    } finally {
      setGoogleLoading(false);
    }
  };
  
  const toggleMode = () => {
    const newMode = mode === 'signin' ? 'signup' : 'signin';
    setMode(newMode);
    setError(null);
    if (newMode === 'signup') {
      clearPendingGoogleLink();
    }
    router.replace(`/auth?mode=${newMode}`, { scroll: false }); 
  };

  const authBusy = formLoading || isLoadingAuth || googleLoading;

  if (!isClient || isLoadingAuth) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-secondary/30 to-background" suppressHydrationWarning>
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (user && !formLoading) { 
     return (
      <div className="w-full min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-secondary/30 to-background" suppressHydrationWarning>
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
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-background p-4 sm:p-8 antialiased" suppressHydrationWarning>
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
          {pendingGoogleLinkEmail && mode === 'signin' && (
            <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-800 text-sm">
              <p className="font-medium">Link your Google account</p>
              <p className="mt-1">
                Sign in with password for <span className="font-semibold">{pendingGoogleLinkEmail}</span> to complete linking.
              </p>
              <button
                type="button"
                className="mt-2 text-xs font-semibold underline hover:text-amber-900"
                onClick={() => clearPendingGoogleLink()}
              >
                Dismiss
              </button>
            </div>
          )}
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 pr-3 py-2.5 bg-input border-border focus:border-primary"
                  autoComplete="email"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 py-2.5 bg-input border-border focus:border-primary"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  required
                />
                <PasswordVisibilityToggle visible={showPassword} onClick={() => setShowPassword(!showPassword)} />
              </div>
            </div>
            {mode === 'signup' && (
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                 <div className="relative mt-1">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="********"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 py-2.5 bg-input border-border focus:border-primary"
                    autoComplete="new-password"
                    required
                  />
                  <PasswordVisibilityToggle visible={showConfirmPassword} onClick={() => setShowConfirmPassword(!showConfirmPassword)} />
                </div>
              </div>
            )}
            
            {recaptchaSiteKey && (
              <div className="flex justify-center py-2 overflow-hidden">
                <div
                  className="g-recaptcha scale-90 sm:scale-100"
                  data-sitekey={recaptchaSiteKey}
                  data-action="LOGIN"
                ></div>
              </div>
            )}

            <Button type="submit" className="w-full font-semibold py-3 text-base shadow-md bg-primary hover:bg-primary/90 text-primary-foreground" disabled={authBusy}>
              {formLoading || isLoadingAuth ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (mode === 'signup' ? <UserPlus size={20} className="mr-2"/> : <LogIn size={20} className="mr-2"/>)}
              {formLoading || isLoadingAuth ? 'Processing...' : (mode === 'signup' ? 'Get Started' : 'Sign In')}
            </Button>
          </form>

          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              or
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full font-semibold py-3 text-base"
            onClick={handleGoogleAuth}
            disabled={authBusy}
          >
            {googleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {googleLoading ? 'Connecting to Google...' : 'Continue with Google'}
          </Button>
           
          <p className="text-center text-sm text-muted-foreground">
            {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}{' '}
            <Button variant="link" onClick={toggleMode} className="font-semibold text-primary p-0 h-auto">
              {mode === 'signin' ? 'Get Started' : 'Sign In'}
            </Button>
          </p>

        </CardContent>
        <CardFooter className="px-6 md:px-8 pb-8 pt-4">
          <p className="text-xs text-muted-foreground/80 text-center w-full font-body">
            By continuing, you agree to Blisszits' <Link href="/terms" className="underline hover:text-primary">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

