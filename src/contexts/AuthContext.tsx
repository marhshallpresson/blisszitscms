// src/contexts/AuthContext.tsx
"use client";

// This file is being kept for potential future use if authentication is added
// to the corporate website (e.g., for a client portal).
// For the current "minimalistic basic frontend corporate website", it is not actively used.

import type { User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  // createUserWithEmailAndPassword, // Commented out - not used for basic site
  // signInWithEmailAndPassword, // Commented out - not used for basic site
  // sendPasswordResetEmail, // Commented out - not used for basic site
  // GoogleAuthProvider, // Commented out - not used for basic site
  // signInWithPopup, // Commented out - not used for basic site
  // RecaptchaVerifier, // Commented out - not used for basic site
  // signInWithPhoneNumber as firebaseSignInWithPhoneNumber, // Commented out - not used for basic site
  // type ConfirmationResult, // Commented out - not used for basic site
  // updatePassword as firebaseUpdatePassword, // Commented out - not used for basic site
} from 'firebase/auth';
import { auth } from '@/lib/firebaseConfig'; // Ensure auth is correctly initialized
// import type { EmailPasswordCredentials } from '@/lib/types'; // Commented out
// import { useToast } from '@/hooks/use-toast'; // Commented out

interface AuthContextType {
  user: User | null;
  isAuthReady: boolean;
  isLoading: boolean;
  // signUpWithEmail: (credentials: EmailPasswordCredentials) => Promise<User | null>;
  // signInWithEmail: (credentials: EmailPasswordCredentials) => Promise<User | null>;
  // signInWithGoogle: () => Promise<User | null>;
  // signInWithPhoneNumberFlow: (phoneNumber: string, appVerifier: RecaptchaVerifier) => Promise<ConfirmationResult | null>;
  // confirmOtp: (otp: string) => Promise<User | null>;
  // sendPasswordReset: (email: string) => Promise<void>;
  // updateUserPassword: (newPassword: string) => Promise<void>;
  signOut: () => Promise<void>;
  // confirmationResult: ConfirmationResult | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  // const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true); 
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Will likely always be null if anonymous auth is removed
      setIsAuthReady(true);
      setIsLoading(false);
    }, (error) => { 
      console.error("Auth state change error:", error);
      setIsAuthReady(true); 
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // All auth methods (signUp, signIn, etc.) are commented out as they are not
  // typically part of a basic corporate frontend website.
  // They can be re-enabled if a client portal or similar feature is added.

  const signOut = async () => {
    setIsLoading(true);
    try {
      if (auth) { // Check if auth is initialized
        await firebaseSignOut(auth);
      }
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
        signOut,
        // ... other methods would go here if re-enabled
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // If not using AuthProvider in layout, this error is expected.
    // For a basic corporate site, direct use of this hook might not be necessary.
    console.warn('useAuth hook called outside of AuthProvider. This is expected if AuthProvider is not used for a public corporate site.');
    return {
      user: null,
      isAuthReady: true, // Assume ready if no auth context
      isLoading: false,
      signOut: async () => {},
    } as AuthContextType; // Cast to allow usage without provider in a non-auth site
  }
  return context;
};
