
"use client";

import type { User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '@/lib/firebaseConfig'; // Ensure auth is correctly initialized
import type { EmailPasswordCredentials } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  isAuthReady: boolean;
  isLoading: boolean;
  signUpWithEmail: (credentials: EmailPasswordCredentials) => Promise<User | null>;
  signInWithEmail: (credentials: EmailPasswordCredentials) => Promise<User | null>;
  sendPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start true until auth state is resolved

  useEffect(() => {
    setIsLoading(true); // Explicitly set loading true when effect runs
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      setIsLoading(false);
    }, (error) => { // Optional: Add error handling for onAuthStateChanged itself
      console.error("Auth state change error:", error);
      setIsAuthReady(true); // Still set ready to allow app to proceed (e.g. show login)
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
      throw error; // Re-throw to be caught by UI
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
      throw error; // Re-throw
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
      throw error; // Re-throw
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
      // Potentially handle specific sign-out errors if needed
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
        sendPasswordReset,
        signOut 
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
