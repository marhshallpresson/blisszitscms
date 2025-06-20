
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Mail, KeyRound, UserPlus, LogIn, AlertTriangle, Smartphone, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RecaptchaVerifier } from 'firebase/auth';
import { auth } from '@/lib/firebaseConfig';

// Define a type for window to include recaptchaVerifier
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    recaptchaWidgetId?: number;
  }
}

export const AuthScreen = () => {
  const { 
    signUpWithEmail, 
    signInWithEmail,
    signInWithGoogle,
    signInWithPhoneNumberFlow,
    confirmOtp,
    sendPasswordReset,
    isLoading 
  } = useAuth();
  const { toast } = useToast();

  const [isClient, setIsClient] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const setupRecaptcha = useCallback(() => {
    if (auth && !window.recaptchaVerifier) { // Ensure auth is available
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible',
          'callback': (response: any) => {
            console.log("reCAPTCHA solved, response:", response);
          },
          'expired-callback': () => {
            toast({ title: "reCAPTCHA Expired", description: "Please try sending the OTP again.", variant: "destructive" });
            if (window.recaptchaVerifier) {
              window.recaptchaVerifier.clear(); 
            }
            // No automatic re-setup here to avoid loops, user should retry action
          }
        });
        window.recaptchaVerifier.render().then((widgetId) => {
            window.recaptchaWidgetId = widgetId;
            console.log("reCAPTCHA rendered, widgetId:", widgetId);
        }).catch(err => {
            console.error("Error rendering reCAPTCHA:", err);
            setError("Failed to initialize reCAPTCHA. Please refresh and try again.");
        });
      } catch (e) {
        console.error("Error setting up RecaptchaVerifier:", e);
        setError("Failed to initialize reCAPTCHA. Ensure your Firebase setup is correct and the page has loaded fully.");
      }
    }
  }, [toast]);

  useEffect(() => {
    if (isClient) { // Only setup reCAPTCHA on the client
      setupRecaptcha();
    }
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        delete window.recaptchaVerifier; // Clean up
        delete window.recaptchaWidgetId;
      }
    };
  }, [isClient, setupRecaptcha]);

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

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      await signInWithGoogle();
      toast({ title: "Signed In with Google", description: "Welcome to Blisszits!" });
    } catch (authError: any) {
      setError(authError.message || "Google sign-in failed.");
    }
  };
  
  const handleSendOtp = async () => {
    setError(null);
    if (!phoneNumber.match(/^\+[1-9]\d{1,14}$/)) {
      setError("Invalid phone number format. Please include '+' and country code (e.g., +12223334444).");
      return;
    }
    if (!window.recaptchaVerifier) {
      setError("reCAPTCHA not initialized. Please wait or refresh.");
      setupRecaptcha(); 
      return;
    }
    try {
      await signInWithPhoneNumberFlow(phoneNumber, window.recaptchaVerifier);
      setShowOtpInput(true);
      toast({ title: "OTP Sent", description: `An OTP has been sent to ${phoneNumber}.` });
    } catch (authError: any) {
      setError(authError.message || "Failed to send OTP.");
      toast({ title: "OTP Error", description: authError.message, variant: "destructive" });
      if (window.recaptchaVerifier && typeof window.recaptchaVerifier.clear === 'function') {
        try {
           window.recaptchaVerifier.clear();
        } catch(e) { console.warn("Could not clear recaptchaVerifier", e)}
        setupRecaptcha(); 
      }
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    if (!otp.match(/^\d{6}$/)) {
      setError("Invalid OTP format. Please enter the 6-digit code.");
      return;
    }
    try {
      await confirmOtp(otp);
      toast({ title: "Signed In with Phone", description: "Welcome to Blisszits!" });
      setShowOtpInput(false); 
      setPhoneNumber('');
      setOtp('');
    } catch (authError: any) {
      setError(authError.message || "Failed to verify OTP.");
      toast({ title: "OTP Verification Error", description: authError.message, variant: "destructive" });
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

  if (!isClient) {
    // Render nothing or a very simple static placeholder during SSR and initial client render
    return null; 
  }

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
                    required={isSigningUp}
                    className="pl-10"
                  />
                </div>
              </div>
            )}
            <Button type="submit" className="w-full font-semibold" disabled={isLoading}>
              {isLoading ? 'Processing...' : (isSigningUp ? <><UserPlus className="mr-2" />Sign Up with Email</> : <><LogIn className="mr-2" />Sign In with Email</>)}
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

          <Separator />

          <Button onClick={handleGoogleSignIn} variant="outline" className="w-full font-semibold" disabled={isLoading}>
             <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
            {isLoading ? 'Processing...' : 'Sign In with Google'}
          </Button>

          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-center font-medium text-muted-foreground">Or sign in with your phone</h3>
            {!showOtpInput ? (
              <>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="+1 123 456 7890"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button onClick={handleSendOtp} className="w-full font-semibold" disabled={isLoading || !phoneNumber}>
                  {isLoading ? 'Sending OTP...' : 'Send OTP'}
                </Button>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="otp">Enter OTP</Label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="otp"
                      type="text"
                      placeholder="6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button onClick={handleVerifyOtp} className="w-full font-semibold" disabled={isLoading || !otp}>
                  {isLoading ? 'Verifying OTP...' : 'Verify OTP & Sign In'}
                </Button>
                <Button variant="link" onClick={() => {setShowOtpInput(false); setError(null); setOtp('');}} className="text-sm">
                  Change phone number or retry
                </Button>
              </>
            )}
             <div id="recaptcha-container" className="my-2 flex justify-center"></div>
          </div>

          {error && (
            <p className="text-sm text-destructive flex items-center gap-2"><AlertTriangle size={16}/> {error}</p>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground/70 text-center w-full font-body">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
