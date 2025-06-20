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
  const [isLoadingProfile, setIsLoadingProfile] = useState(true); // Start as true
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
        setIsLoadingProfile(false);
        return profile;
      } else {
        setUserProfile(null); 
        setIsLoadingProfile(false);
        return null;
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUserProfile(null);
      setIsLoadingProfile(false);
      return null;
    }
  }, []);

  useEffect(() => {
    setIsLoadingAuth(true);
    setIsLoadingProfile(true); 
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchUserProfile(currentUser.uid);
      } else {
        setUserProfile(null); 
        setIsLoadingProfile(false); 
      }
      setIsAuthReady(true);
      setIsLoadingAuth(false);
    }, (error) => { 
      console.error("Auth state change error:", error);
      setUser(null);
      setUserProfile(null);
      setIsAuthReady(true); 
      setIsLoadingAuth(false);
      setIsLoadingProfile(false);
    });
    return () => unsubscribe();
  }, [fetchUserProfile]);


  const signUpWithEmail = async ({ email, password }: EmailPasswordCredentials): Promise<FirebaseUser | null> => {
    if (!auth || !db) throw new Error("Firebase not initialized.");
    setIsLoadingAuth(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      const userDocRef = doc(db, "users", newUser.uid);
      const initialProfile: UserProfile = {
        uid: newUser.uid,
        email: newUser.email || '',
        onboardingCompleted: false,
        createdAt: serverTimestamp() as Timestamp, // Use serverTimestamp for creation
      };
      await setDoc(userDocRef, initialProfile);
      setUserProfile(initialProfile); 
      return newUser;
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast({ title: "Sign Up Failed", description: error.message, variant: "destructive" });
      throw error;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const signInWithEmail = async ({ email, password }: EmailPasswordCredentials): Promise<FirebaseUser | null> => {
    if (!auth) throw new Error("Firebase Auth not initialized.");
    setIsLoadingAuth(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Profile will be fetched by onAuthStateChanged effect
      return userCredential.user;
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast({ title: "Sign In Failed", description: error.message, variant: "destructive" });
      throw error;
    } finally {
      setIsLoadingAuth(false);
    }
  };
  
  const saveOnboardingProfile = async (profileData: Partial<Pick<UserProfile, 'displayName' | 'phoneNumber' | 'dateOfBirth'>>): Promise<void> => {
    if (!user || !db) throw new Error("User not authenticated or Firestore not initialized.");
    setIsLoadingProfile(true);
    try {
      const userDocRef = doc(db, "users", user.uid);
      const dataToSave = {
        ...profileData,
        onboardingCompleted: true,
        updatedAt: serverTimestamp() as Timestamp,
      };
      await updateDoc(userDocRef, dataToSave);
      await fetchUserProfile(user.uid); 
    } catch (error: any) {
      console.error("Error saving onboarding profile:", error);
      toast({ title: "Profile Save Failed", description: error.message, variant: "destructive" });
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
      
      // Prepare data, ensuring nested objects are merged correctly if they exist
      const currentProfile = userProfile || {}; // Use empty object if profile is null
      const dataToUpdate: Partial<UserProfile> = {
        ...profileData, // Start with new data
        updatedAt: serverTimestamp() as Timestamp,
      };

      // Deep merge address if provided
      if (profileData.address) {
        dataToUpdate.address = { ...(currentProfile.address || {}), ...profileData.address };
      }
      // Deep merge socialMedia if provided
      if (profileData.socialMedia) {
         dataToUpdate.socialMedia = { ...(currentProfile.socialMedia || {}), ...profileData.socialMedia };
      }
      
      await updateDoc(userDocRef, dataToUpdate);
      await fetchUserProfile(user.uid);
    } catch (error: any) {
      console.error("Error updating user profile:", error);
      toast({ title: "Profile Update Failed", description: error.message, variant: "destructive" });
      throw error;
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const signOut = async () => {
    if (!auth) return;
    setIsLoadingAuth(true);
    try {
      await firebaseSignOut(auth);
      // State (user, userProfile) will be cleared by onAuthStateChanged
    } catch (error: any) {
      console.error("Sign out failed:", error);
      toast({ title: "Sign Out Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoadingAuth(false); // Ensure loading state is reset
    }
  };

  const sendPasswordReset = async (email: string) => {
    if (!auth) throw new Error("Firebase Auth not initialized.");
    try {
      await sendPasswordResetEmail(auth, email);
      toast({ title: "Password Reset Email Sent", description: "Check your inbox for instructions." });
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast({ title: "Password Reset Failed", description: error.message, variant: "destructive" });
      throw error;
    }
  };
  
  const updateUserPassword = async (newPassword: string) => {
    if (!auth || !auth.currentUser) throw new Error("User not authenticated.");
    try {
      await firebaseUpdatePassword(auth.currentUser, newPassword);
    } catch (error: any) {
      console.error("Password update error:", error);
      throw error; 
    }
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
