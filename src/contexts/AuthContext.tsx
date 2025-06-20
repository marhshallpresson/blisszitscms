
// src/contexts/AuthContext.tsx
"use client";

import type { User as FirebaseUser } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updatePassword as firebaseUpdatePassword,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebaseConfig'; 
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { EmailPasswordCredentials } from '@/types/auth';
import type { UserProfile } from '@/types/user';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  isAuthReady: boolean; 
  isLoadingAuth: boolean; 
  isLoadingProfile: boolean; 
  signUpWithEmail: (credentials: EmailPasswordCredentials) => Promise<FirebaseUser | null>;
  signInWithEmail: (credentials: EmailPasswordCredentials) => Promise<FirebaseUser | null>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updateUserPassword: (newPassword: string) => Promise<void>;
  fetchUserProfile: (uid: string) => Promise<UserProfile | null>;
  saveOnboardingProfile: (profileData: Partial<Pick<UserProfile, 'displayName' | 'phoneNumber' | 'dateOfBirth'>>) => Promise<void>;
  updateUserProfile: (profileData: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false); 
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); 
  const [isLoadingProfile, setIsLoadingProfile] = useState(true); 
  const { toast } = useToast();

  const fetchUserProfile = useCallback(async (uid: string): Promise<UserProfile | null> => {
    if (!db) {
      console.error("Firestore is not initialized.");
      setIsLoadingProfile(false);
      return null;
    }
    setIsLoadingProfile(true);
    try {
      const userDocRef = doc(db, "users", uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const profile = userDocSnap.data() as UserProfile;
        setUserProfile(profile);
        return profile;
      } else {
        setUserProfile(null); 
        return null;
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUserProfile(null);
      return null;
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsLoadingAuth(false);
      if (currentUser) {
        await fetchUserProfile(currentUser.uid);
      } else {
        setUserProfile(null);
        setIsLoadingProfile(false);
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, [fetchUserProfile]);


  const signUpWithEmail = async ({ email, password }: EmailPasswordCredentials): Promise<FirebaseUser | null> => {
    if (!auth || !db) throw new Error("Firebase not initialized.");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      const userDocRef = doc(db, "users", newUser.uid);
      const initialProfile: UserProfile = {
        uid: newUser.uid,
        email: newUser.email || '', 
        onboardingCompleted: false,
        createdAt: serverTimestamp() as Timestamp,
      };
      await setDoc(userDocRef, initialProfile);
      setUserProfile(initialProfile);
      return newUser;
    } catch (error: any) {
      throw error;
    }
  };

  const signInWithEmail = async ({ email, password }: EmailPasswordCredentials): Promise<FirebaseUser | null> => {
    if (!auth) throw new Error("Firebase Auth not initialized.");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      throw error;
    }
  };
  
  const saveOnboardingProfile = async (profileData: Partial<Pick<UserProfile, 'displayName' | 'phoneNumber' | 'dateOfBirth'>>): Promise<void> => {
    if (!user || !db) throw new Error("User not authenticated or Firestore not initialized.");
    setIsLoadingProfile(true);
    try {
      const userDocRef = doc(db, "users", user.uid);
      const dataToUpdate = {
        ...profileData, 
        onboardingCompleted: true,
        updatedAt: serverTimestamp() as Timestamp,
      };
      await updateDoc(userDocRef, dataToUpdate);
      await fetchUserProfile(user.uid);
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoadingProfile(false);
    }
  };
  
  const updateUserProfile = async (profileData: Partial<UserProfile>): Promise<void> => {
    if (!user || !db) throw new Error("User not authenticated or Firestore not initialized.");
    setIsLoadingProfile(true);
    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        ...profileData,
        updatedAt: serverTimestamp()
      });
      await fetchUserProfile(user.uid);
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const signOut = async () => {
    if (!auth) return;
    await firebaseSignOut(auth);
    setUser(null); 
    setUserProfile(null); 
  };

  const sendPasswordReset = async (email: string) => {
    if (!auth) throw new Error("Firebase Auth not initialized.");
    await sendPasswordResetEmail(auth, email);
  };
  
  const updateUserPassword = async (newPassword: string) => {
    if (!auth.currentUser) throw new Error("User not authenticated.");
    await firebaseUpdatePassword(auth.currentUser, newPassword);
  };

  return (
    <AuthContext.Provider value={{ 
        user,
        userProfile, 
        isAuthReady, 
        isLoadingAuth,
        isLoadingProfile,
        signUpWithEmail,
        signInWithEmail,
        signOut,
        sendPasswordReset,
        updateUserPassword,
        fetchUserProfile,
        saveOnboardingProfile,
        updateUserProfile,
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
