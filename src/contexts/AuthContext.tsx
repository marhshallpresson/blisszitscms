
"use client";

import type { User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signInAnonymously, signOut as firebaseSignOut, signInWithCustomToken } from 'firebase/auth';
import { auth }                           from '@/lib/firebaseConfig'; // Adjusted path

interface AuthContextType {
  user: User | null;
  isAuthReady: boolean;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper for initial auth token, similar to user's __initial_auth_token
// In a real app, this might come from server props or an environment variable
const getInitialAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    // Example: reading from a global variable injected by a script
    // return (window as any).__initial_auth_token || null;
  }
  return null; // Placeholder
};


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setIsLoading(true);
      if (currentUser) {
        setUser(currentUser);
      } else {
        // Try to sign in if no user
        // This logic mirrors the user's original useEffect
        try {
          const initialToken = getInitialAuthToken();
          if (initialToken) {
            await signInWithCustomToken(auth, initialToken);
            // onAuthStateChanged will pick up the new user
          } else {
            await signInAnonymously(auth);
            // onAuthStateChanged will pick up the new user
          }
        } catch (error) {
          console.error("Automatic anonymous sign-in failed:", error);
          setUser(null); // Ensure user is null on failure
        }
      }
      setIsAuthReady(true);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    setIsLoading(true);
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error("Sign in failed:", error);
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
    <AuthContext.Provider value={{ user, isAuthReady, isLoading, signIn, signOut }}>
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
