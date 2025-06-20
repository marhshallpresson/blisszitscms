
"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Sparkles, Mail, KeyRound, UserPlus, LogIn, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Simple icons for social logins
const GoogleIcon = () => <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2"><path fill="#4285F4" d="M21.35 11.1h-9.03v2.73h5.23c-.22 1.42-.88 2.55-1.95 3.32v2.23h2.87c1.68-1.54 2.65-3.88 2.65-6.58 0-.68-.06-1.34-.17-1.99z"/><path fill="#34A853" d="M12.32 22c2.44 0 4.49-.81 5.99-2.19l-2.87-2.23c-.81.54-1.84.86-2.99.86-2.29 0-4.22-1.54-4.91-3.61H4.65v2.3c1.42 2.79 4.3 4.77 7.67 4.77z"/><path fill="#FBBC05" d="M7.41 14.26c-.22-.67-.35-1.38-.35-2.13s.13-1.46.35-2.13V7.72H4.65c-.73 1.46-1.16 3.1-1.16 4.81s.43 3.35 1.16 4.81l2.76-2.08z"/><path fill="#EA4335" d="M12.32 6.86c1.32 0 2.35.45 3.22 1.28l2.55-2.55C16.44 3.96 14.48 3 12.32 3c-3.37 0-6.25 2.01-7.67 4.77l2.76 2.09c.69-2.07 2.62-3.61 4.91-3.61z"/></svg>;
const AppleIcon = () => <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2"><path fill="currentColor" d="M17.42 14.66c-.94.53-1.7.87-2.85.87-.99 0-1.88-.29-2.61-.88-.47-.36-.85-.98-.85-1.92 0-1.3.9-2.26 2.41-2.26.93 0 1.68.35 2.46.86.4.25.71.42.71.42s-.01.52-.01 1.36c0 1.04.02 1.5.02 1.5zm3.64-4.12c-.23-.68-.72-1.4-1.22-1.93-.69-.75-1.44-1.12-2.25-1.12-.92 0-1.95.46-2.9.46-.98 0-1.83-.46-2.83-.46-.95 0-1.85.41-2.61.97-.89.67-1.5 1.62-1.5 2.94 0 1.11.36 2.08.95 2.87.6.78 1.33 1.2 2.27 1.2.95 0 1.76-.31 2.47-.82.52-.35.9-.87.9-.87s.02.92.02 2.23c0 .96.28 1.67.77 2.15.55.54 1.27.79 2.1.79.61 0 1.33-.19 2.05-.55.3-.15.48-.23.48-.23s.03-.62.03-1.27a4.44 4.44 0 0 0-.61-2.26c-.6-.99-1.22-1.49-1.92-1.8.8-.26 1.45-.76 1.94-1.48.32-.46.48-.99.48-1.58 0-.04.01-.1.01-.1zM12.41 4.68C13.12 3.9 14.13 3 15.28 3c.22 0 .63.06 1.02.18.08.03.33.11.33.11s-.32.1-.7.26c-1.03.43-1.84 1.18-2.33 2.14-.65 1.28-.92 2.65-.92 4.03 0 .38.01.75.04 1.1.21-1.21.8-2.32 1.71-3.24.5-.49.93-.89 1.32-1.22-.27-.08-.56-.12-.87-.12-.95 0-1.83.51-2.52 1.24-.62.64-1.12 1.62-1.12 2.82 0 .92.32 1.7.85 2.32.57.66 1.24.98 2.02.98.1 0 .22 0 .37-.02.06 0 .14 0 .14 0s-.05.08-.15.21c-.42.53-1.02.93-1.77 1.18-.63.22-1.28.33-1.95.33-.88 0-1.82-.37-2.7-.99-.75-.53-1.42-1.4-1.42-2.72 0-1.68.95-2.97 2.53-3.72.28-.13.57-.2.87-.21z"/></svg>;
const FacebookIcon = () => <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2"><path fill="#1877F2" d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-1.7c-.9 0-1.3.42-1.3 1.3V12h3l-.5 3h-2.5v6.8c4.56-.93 8-4.96 8-9.8z"/></svg>;

export const AuthScreen = () => {
  const { 
    signInWithGoogle, 
    signInWithApple, 
    signInWithFacebook, 
    signUpWithEmail, 
    signInWithEmail,
    sendPasswordReset,
    isLoading 
  } = useAuth();
  const { toast } = useToast();

  const [isSigningUp, setIsSigningUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (isSigningUp && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      if (isSigningUp) {
        await signUpWithEmail({ email, password });
        toast({ title: "Account Created", description: "Welcome to Blisszits! You're now signed in." });
      } else {
        await signInWithEmail({ email, password });
        toast({ title: "Signed In", description: "Welcome back to Blisszits!" });
      }
      // AuthContext will handle user state update and redirection
    } catch (authError: any) {
      setError(authError.message || "An unexpected error occurred.");
      toast({ title: "Authentication Error", description: authError.message, variant: "destructive" });
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError("Please enter your email address to reset password.");
      return;
    }
    setError(null);
    try {
      await sendPasswordReset(email);
      toast({ title: "Password Reset Email Sent", description: "Check your inbox for instructions to reset your password." });
    } catch (authError: any) {
      setError(authError.message || "Failed to send password reset email.");
      toast({ title: "Password Reset Error", description: authError.message, variant: "destructive" });
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-muted to-background p-4 sm:p-8">
      <Card className="w-full max-w-md shadow-2xl rounded-xl">
        <CardHeader className="text-center">
          <Sparkles className="text-primary w-16 h-16 mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold text-foreground font-headline">Welcome to Blisszits</CardTitle>
          <CardDescription className="text-muted-foreground font-body">Your AI-powered content to-do buddy.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="you@example.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
               <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  className="pl-10"
                />
              </div>
            </div>
            {isSigningUp && (
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    placeholder="••••••••" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                    className="pl-10"
                  />
                </div>
              </div>
            )}
            {error && (
              <p className="text-sm text-destructive flex items-center gap-2"><AlertTriangle size={16}/> {error}</p>
            )}
            <Button type="submit" className="w-full font-semibold" disabled={isLoading}>
              {isLoading ? 'Processing...' : (isSigningUp ? <><UserPlus className="mr-2" />Sign Up</> : <><LogIn className="mr-2" />Sign In</>)}
            </Button>
          </form>

          <div className="text-center">
            <Button variant="link" onClick={() => { setIsSigningUp(!isSigningUp); setError(null); }} className="text-sm">
              {isSigningUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </Button>
            {!isSigningUp && (
              <Button variant="link" onClick={handlePasswordReset} className="text-sm text-muted-foreground hover:text-primary">
                Forgot password?
              </Button>
            )}
          </div>
          
          <div className="relative">
            <Separator className="my-2" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">OR</span>
          </div>

          <div className="space-y-3">
            <Button variant="outline" className="w-full" onClick={signInWithGoogle} disabled={isLoading}>
              <GoogleIcon /> Sign in with Google
            </Button>
            <Button variant="outline" className="w-full" onClick={signInWithApple} disabled={isLoading}>
              <AppleIcon /> Sign in with Apple
            </Button>
            <Button variant="outline" className="w-full" onClick={signInWithFacebook} disabled={isLoading}>
              <FacebookIcon /> Sign in with Facebook
            </Button>
             <p className="text-xs text-muted-foreground text-center pt-2">
              Facebook & Apple sign-in may require additional setup by the site administrator.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground/70 text-center w-full font-body">
            By signing in, you agree to our (non-existent) Terms of Service and Privacy Policy.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

// Re-export Card components if not already globally available or for clarity
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

