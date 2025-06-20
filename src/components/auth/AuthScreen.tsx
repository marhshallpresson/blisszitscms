
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AppLogo } from '@/components/layout/AppLogo';
import { Mail, KeyRound, UserPlus, LogIn, AlertTriangle, Smartphone, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RecaptchaVerifier } from 'firebase/auth';
import { auth } from '@/lib/firebaseConfig';

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
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const setupRecaptcha = useCallback(() => {
    if (auth && !window.recaptchaVerifier && document.getElementById('recaptcha-container')) {
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
          }
        });
        window.recaptchaVerifier.render().then((widgetId) => {
            window.recaptchaWidgetId = widgetId;
        }).catch(err => {
            console.error("Error rendering reCAPTCHA:", err);
            setError("Failed to initialize reCAPTCHA. Please refresh.");
        });
      } catch (e) {
        console.error("Error setting up RecaptchaVerifier:", e);
        setError("Failed to initialize reCAPTCHA. Ensure Firebase setup is correct.");
      }
    }
  }, [toast]);

  useEffect(() => {
    if (isClient) {
      setupRecaptcha();
    }
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        delete window.recaptchaVerifier;
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
        toast({ title: "Account Created!", description: "Welcome to Blisszits! You're now signed in." });
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
      setError("Invalid phone number. Use format: +12223334444");
      return;
    }
    if (!window.recaptchaVerifier) {
      setError("reCAPTCHA not ready. Refresh or wait and try again.");
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
        } catch(e) { console.warn("Could not clear recaptchaVerifier on OTP send error", e)}
        setupRecaptcha();
      }
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    if (!otp.match(/^\d{6}$/)) {
      setError("Invalid OTP format. Enter the 6-digit code.");
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
      setError("Enter your email to reset password.");
      return;
    }
    setError(null);
    try {
      await sendPasswordReset(email);
      toast({ title: "Password Reset Email Sent", description: "Check your inbox for reset instructions." });
    } catch (authError: any) {
      setError(authError.message || "Failed to send password reset email.");
      toast({ title: "Password Reset Error", description: authError.message, variant: "destructive" });
    }
  };

  if (!isClient) {
    return null;
  }

  const PasswordVisibilityToggle = ({ visible, onClick }: { visible: boolean, onClick: () => void }) => (
    <Button type="button" variant="ghost" size="icon" onClick={onClick} className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground">
      {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      <span className="sr-only">{visible ? "Hide password" : "Show password"}</span>
    </Button>
  );

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-muted/50 to-background p-4 sm:p-8 antialiased">
      <Card className="w-full max-w-md shadow-2xl rounded-xl border-border/70">
        <CardHeader className="text-center pt-8 pb-6">
          <AppLogo iconSize={48} showName={false} className="mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold text-foreground font-headline">Welcome to Blisszits</CardTitle>
          <CardDescription className="text-muted-foreground font-body text-base">Your AI content creation partner.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-6 md:px-8 pb-6">
          <form onSubmit={handleEmailAuth} className="space-y-4">
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
                  required
                  className="pl-10 pr-3 py-2.5"
                  aria-label="Email Address"
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 pr-10 py-2.5"
                  aria-label="Password"
                />
                <PasswordVisibilityToggle visible={showPassword} onClick={() => setShowPassword(!showPassword)} />
              </div>
            </div>
            {isSigningUp && (
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative mt-1">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required={isSigningUp}
                    className="pl-10 pr-10 py-2.5"
                    aria-label="Confirm Password"
                  />
                  <PasswordVisibilityToggle visible={showConfirmPassword} onClick={() => setShowConfirmPassword(!showConfirmPassword)} />
                </div>
              </div>
            )}
            <Button type="submit" className="w-full font-semibold py-3 text-base shadow-md hover:shadow-lg" disabled={isLoading}>
              {isLoading ? 'Processing...' : (isSigningUp ? <><UserPlus className="mr-2" />Create Account</> : <><LogIn className="mr-2" />Sign In</>)}
            </Button>
          </form>
          <div className="text-center space-x-1">
            <Button variant="link" onClick={() => { setIsSigningUp(!isSigningUp); setError(null); }} className="text-sm text-primary hover:text-primary/80 px-1">
              {isSigningUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </Button>
            {!isSigningUp && (
              <>
                <span className="text-sm text-muted-foreground">|</span>
                <Button variant="link" onClick={handlePasswordReset} className="text-sm text-muted-foreground hover:text-primary px-1">
                  Forgot password?
                </Button>
              </>
            )}
          </div>

          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">OR</span>
          </div>

          <Button onClick={handleGoogleSignIn} variant="outline" className="w-full font-semibold py-3 text-base border-border hover:bg-muted" disabled={isLoading}>
             <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
            {isLoading ? 'Processing...' : 'Continue with Google'}
          </Button>

          <div className="relative">
            <Separator />
             <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">OR</span>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-center font-medium text-sm text-muted-foreground">Sign in with your phone</h3>
            {!showOtpInput ? (
              <>
                <div>
                  <Label htmlFor="phoneNumber" className="sr-only">Phone Number</Label>
                  <div className="relative mt-1">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="+1 123 456 7890"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="pl-10 py-2.5"
                      aria-label="Phone Number"
                    />
                  </div>
                </div>
                <Button onClick={handleSendOtp} variant="outline" className="w-full font-semibold py-3 text-base border-border hover:bg-muted" disabled={isLoading || !phoneNumber}>
                  {isLoading ? 'Sending OTP...' : 'Send OTP'}
                </Button>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="otp" className="sr-only">Enter OTP</Label>
                  <div className="relative mt-1">
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="otp"
                      type="text"
                      placeholder="6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="pl-10 py-2.5"
                      aria-label="One-Time Password"
                    />
                  </div>
                </div>
                <Button onClick={handleVerifyOtp} className="w-full font-semibold py-3 text-base shadow-md hover:shadow-lg" disabled={isLoading || !otp}>
                  {isLoading ? 'Verifying...' : 'Verify OTP & Sign In'}
                </Button>
                <Button variant="link" onClick={() => {setShowOtpInput(false); setError(null); setOtp('');}} className="text-sm text-muted-foreground hover:text-primary">
                  Change phone or retry
                </Button>
              </>
            )}
             <div id="recaptcha-container" className="my-2 flex justify-center"></div>
          </div>

          {error && (
            <div role="alert" className="p-3 bg-destructive/10 border border-destructive/30 rounded-md text-sm text-destructive flex items-start gap-2">
              <AlertTriangle size={18} className="flex-shrink-0 mt-0.5"/> 
              <span>{error}</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="px-6 md:px-8 pb-8 pt-4">
          <p className="text-xs text-muted-foreground/80 text-center w-full font-body">
            By signing in, you agree to our <a href="/terms" className="underline hover:text-primary">Terms of Service</a> and <a href="/privacy" className="underline hover:text-primary">Privacy Policy</a>.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
