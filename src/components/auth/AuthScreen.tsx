// src/components/auth/AuthScreen.tsx
"use client";

// This component is no longer used in the basic corporate website layout.
// It's kept for potential future use if a client portal or login functionality is added.

import { useState, useEffect, useCallback } from 'react';
// import { useAuth } from '@/contexts/AuthContext'; // AuthContext is simplified
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AppLogo } from '@/components/layout/AppLogo';
import { Mail, KeyRound, UserPlus, LogIn, AlertTriangle, Smartphone, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
// import { RecaptchaVerifier } from 'firebase/auth'; // Firebase auth methods simplified/removed
// import { auth } from '@/lib/firebaseConfig'; // Firebase auth methods simplified/removed

// declare global {
//   interface Window {
//     recaptchaVerifier?: RecaptchaVerifier;
//     recaptchaWidgetId?: number;
//   }
// }

export const AuthScreen = () => {
  // const {
  //   signUpWithEmail,
  //   signInWithEmail,
  //   signInWithGoogle,
  //   signInWithPhoneNumberFlow,
  //   confirmOtp,
  //   sendPasswordReset,
  //   isLoading
  // } = useAuth(); // Auth methods are not used in basic corporate site
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
  const [isLoading, setIsLoading] = useState(false); // Local loading state

  useEffect(() => {
    setIsClient(true);
  }, []);

  // setupRecaptcha and other auth-related useEffects are removed as they depend on Firebase auth
  // which is not part of the basic corporate site.

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    console.log("Email auth attempt (corporate site - placeholder):", { email, password, isSigningUp });
    // Placeholder for actual auth logic if re-enabled
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({ title: "Action (Demo)", description: "Authentication is currently disabled for this site." });
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    console.log("Google sign-in attempt (corporate site - placeholder)");
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({ title: "Action (Demo)", description: "Google Sign-In is currently disabled." });
    setIsLoading(false);
  };
  
  const handleSendOtp = async () => {
    setError(null);
    setIsLoading(true);
    console.log("Send OTP attempt (corporate site - placeholder):", phoneNumber);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({ title: "Action (Demo)", description: "Phone Sign-In is currently disabled." });
    setIsLoading(false);
  };

  const handleVerifyOtp = async () => {
    setError(null);
    setIsLoading(true);
    console.log("Verify OTP attempt (corporate site - placeholder):", otp);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({ title: "Action (Demo)", description: "Phone Sign-In is currently disabled." });
    setIsLoading(false);
  };
  
  const handlePasswordReset = async () => {
    setError(null);
    setIsLoading(true);
    console.log("Password reset attempt (corporate site - placeholder):", email);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({ title: "Action (Demo)", description: "Password reset is currently disabled." });
    setIsLoading(false);
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
          <CardTitle className="text-3xl font-bold text-foreground font-headline">Welcome</CardTitle>
          <CardDescription className="text-muted-foreground font-body text-base">Access your account (Currently Disabled)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-6 md:px-8 pb-6">
          <p className="text-center text-muted-foreground">User authentication is not enabled for this corporate website demonstration.</p>
          {/* Form kept for UI structure, but submission is a placeholder */}
          <form onSubmit={handleEmailAuth} className="space-y-4 opacity-50 pointer-events-none">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 pr-3 py-2.5" disabled/>
              </div>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10 py-2.5" disabled/>
                <PasswordVisibilityToggle visible={showPassword} onClick={() => setShowPassword(!showPassword)} />
              </div>
            </div>
            <Button type="submit" className="w-full font-semibold py-3 text-base shadow-md" disabled={isLoading || true}>
              {isLoading ? 'Processing...' : (isSigningUp ? 'Create Account' : 'Sign In')}
            </Button>
          </form>

          <Separator />
           <p className="text-center text-sm text-muted-foreground">
            This is a demonstration of a corporate website. CMS features are not active here.
          </p>

        </CardContent>
        <CardFooter className="px-6 md:px-8 pb-8 pt-4">
          <p className="text-xs text-muted-foreground/80 text-center w-full font-body">
            Explore our <Link href="/services" className="underline hover:text-primary">Services</Link> or <Link href="/contact" className="underline hover:text-primary">Contact Us</Link>.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
