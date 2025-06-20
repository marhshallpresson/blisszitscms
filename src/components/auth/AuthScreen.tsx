
"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Mail, KeyRound, UserPlus, LogIn, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export const AuthScreen = () => {
  const { 
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
