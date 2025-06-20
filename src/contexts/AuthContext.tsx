
"use client";

import type { User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber as firebaseSignInWithPhoneNumber,
  type ConfirmationResult
} from 'firebase/auth';
import { auth } from '@/lib/firebaseConfig'; // Ensure auth is correctly initialized
import type { EmailPasswordCredentials } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  isAuthReady: boolean;
  isLoading: boolean;
  signUpWithEmail: (credentials: EmailPasswordCredentials) => Promise<User | null>;
  signInWithEmail: (credentials: EmailPasswordCredentials) => Promise<User | null>;
  signInWithGoogle: () => Promise<User | null>;
  signInWithPhoneNumberFlow: (phoneNumber: string, appVerifier: RecaptchaVerifier) => Promise<ConfirmationResult | null>;
  confirmOtp: (otp: string) => Promise<User | null>;
  sendPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  confirmationResult: ConfirmationResult | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);


  useEffect(() => {
    setIsLoading(true); 
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      setIsLoading(false);
    }, (error) => { 
      console.error("Auth state change error:", error);
      setIsAuthReady(true); 
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signUpWithEmail = async ({ email, password }: EmailPasswordCredentials): Promise<User | null> => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      return userCredential.user;
    } catch (error: any) {
      console.error("Email sign up failed:", error);
      if (error.code === 'auth/configuration-not-found') {
        console.error(
          "Firebase Authentication Error (auth/configuration-not-found): " +
          "This usually means the Email/Password sign-in provider is not enabled " +
          "in your Firebase project console. Please go to Firebase Console -> Authentication -> " +
          "Sign-in method and ensure 'Email/Password' is enabled."
        );
      }
      throw error; 
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithEmail = async ({ email, password }: EmailPasswordCredentials): Promise<User | null> => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      return userCredential.user;
    } catch (error: any) {
      console.error("Email sign in failed:", error);
       if (error.code === 'auth/configuration-not-found') {
        console.error(
          "Firebase Authentication Error (auth/configuration-not-found): " +
          "This usually means the Email/Password sign-in provider is not enabled " +
          "in your Firebase project console. Please go to Firebase Console -> Authentication -> " +
          "Sign-in method and ensure 'Email/Password' is enabled."
        );
      }
      throw error; 
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<User | null> => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      return result.user;
    } catch (error: any) {
      console.error("Google sign in failed:", error);
      if (error.code === 'auth/account-exists-with-different-credential') {
        toast({ title: "Sign-in Error", description: "An account already exists with the same email address but different sign-in credentials. Try signing in with the original method.", variant: "destructive" });
      } else if (error.code === 'auth/popup-closed-by-user') {
        toast({ title: "Sign-in Cancelled", description: "Google sign-in was cancelled.", variant: "default" });
      } else {
        toast({ title: "Google Sign-in Error", description: error.message, variant: "destructive" });
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const signInWithPhoneNumberFlow = async (phoneNumber: string, appVerifier: RecaptchaVerifier): Promise<ConfirmationResult | null> => {
    setIsLoading(true);
    try {
      const result = await firebaseSignInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(result);
      return result;
    } catch (error: any) {
      console.error("Phone sign in failed (sending OTP):", error);
      setConfirmationResult(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const confirmOtp = async (otp: string): Promise<User | null> => {
    if (!confirmationResult) {
      throw new Error("No OTP confirmation result found. Please send OTP first.");
    }
    setIsLoading(true);
    try {
      const userCredential = await confirmationResult.confirm(otp);
      setUser(userCredential.user);
      setConfirmationResult(null); // Clear confirmation result
      return userCredential.user;
    } catch (error: any) {
      console.error("OTP confirmation failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };


  const sendPasswordReset = async (email: string): Promise<void> => {
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error("Password reset failed:", error);
      if (error.code === 'auth/configuration-not-found') {
        console.error(
          "Firebase Authentication Error (auth/configuration-not-found) during password reset: " +
          "Check Firebase console settings for Email/Password provider."
        );
      }
      throw error; 
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
        user, 
        isAuthReady, 
        isLoading, 
        signUpWithEmail,
        signInWithEmail,
        signInWithGoogle,
        signInWithPhoneNumberFlow,
        confirmOtp,
        sendPasswordReset,
        signOut,
        confirmationResult
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function for toast (assuming it's part of useToast hook elsewhere)
// This is a placeholder, actual toast should come from your useToast hook
const toast = (options: { title: string; description: string; variant?: "default" | "destructive" }) => {
  console.log(`Toast: ${options.title} - ${options.description}`);
};
