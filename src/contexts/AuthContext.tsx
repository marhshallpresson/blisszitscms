
"use client";

import type { User, AuthProvider as FirebaseAuthProvider } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  FacebookAuthProvider, // Added for placeholder
  OAuthProvider, // For Apple Sign-In
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '@/lib/firebaseConfig';
import type { EmailPasswordCredentials } from '@/lib/types'; // Will create this type

interface AuthContextType {
  user: User | null;
  isAuthReady: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<User | null>;
  signInWithApple: () => Promise<User | null>;
  signInWithFacebook: () => Promise<User | null>; // Placeholder
  signUpWithEmail: (credentials: EmailPasswordCredentials) => Promise<User | null>;
  signInWithEmail: (credentials: EmailPasswordCredentials) => Promise<User | null>;
  sendPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignInWithProvider = async (provider: FirebaseAuthProvider): Promise<User | null> => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      return result.user;
    } catch (error) {
      console.error("Sign in with provider failed:", error);
      // Consider using toast notifications for user feedback
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = () => handleSignInWithProvider(new GoogleAuthProvider());
  const signInWithApple = () => handleSignInWithProvider(new OAuthProvider('apple.com'));
  
  const signInWithFacebook = async (): Promise<User | null> => {
    // Placeholder: Facebook sign-in requires app setup in Facebook Developer portal
    console.warn("Facebook sign-in not fully implemented. Requires developer setup.");
    // return handleSignInWithProvider(new FacebookAuthProvider()); // Uncomment when configured
    alert("Facebook sign-in is a placeholder. Full implementation requires developer setup.");
    return null;
  };

  const signUpWithEmail = async ({ email, password }: EmailPasswordCredentials): Promise<User | null> => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      return userCredential.user;
    } catch (error) {
      console.error("Email sign up failed:", error);
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
    } catch (error) {
      console.error("Email sign in failed:", error);
      throw error; // Re-throw
    } finally {
      setIsLoading(false);
    }
  };
  
  const sendPasswordReset = async (email: string): Promise<void> => {
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Password reset failed:", error);
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
        user, 
        isAuthReady, 
        isLoading, 
        signInWithGoogle,
        signInWithApple,
        signInWithFacebook,
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
