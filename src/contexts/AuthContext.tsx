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
  updateUserProfile: (profileData: Partial<Omit<UserProfile, 'uid' | 'email' | 'createdAt' | 'onboardingCompleted'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false); // Tracks if initial auth check is done
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); // Tracks auth operation in progress
  const [isLoadingProfile, setIsLoadingProfile] = useState(true); // Tracks profile operation in progress
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
    setIsLoadingAuth(true); // Start loading auth state
    setIsLoadingProfile(true); // Start loading profile state
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchUserProfile(currentUser.uid); // Profile loading is handled by this function
      } else {
        setUserProfile(null); 
        setIsLoadingProfile(false); // No profile to load
      }
      setIsAuthReady(true); // Initial auth check is done
      setIsLoadingAuth(false); // Auth loading is done
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
        email: newUser.email || '', // Firebase user email should be non-null after creation
        onboardingCompleted: false,
        createdAt: serverTimestamp() as Timestamp,
        // Other fields like displayName, etc., will be added during onboarding
      };
      await setDoc(userDocRef, initialProfile);
      setUserProfile(initialProfile); 
      // Don't set isLoadingProfile here, fetchUserProfile will handle it
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
    setIsLoadingProfile(true); // Will fetch profile after sign-in
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Profile will be fetched by onAuthStateChanged effect, which triggers fetchUserProfile
      return userCredential.user;
    } catch (error: any) {
      console.error("Sign in error:", error);
      setIsLoadingProfile(false); // Failed to sign in, so no profile fetch
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
      await fetchUserProfile(user.uid); // Re-fetch to update context state
    } catch (error: any) {
      console.error("Error saving onboarding profile:", error);
      toast({ title: "Profile Save Failed", description: error.message, variant: "destructive" });
      throw error;
    } finally {
      setIsLoadingProfile(false);
    }
  };
  
  const updateUserProfile = async (profileData: Partial<Omit<UserProfile, 'uid' | 'email' | 'createdAt' | 'onboardingCompleted'>>): Promise<void> => {
    if (!user || !db) throw new Error("User not authenticated or Firestore not initialized.");
    setIsLoadingProfile(true);
    try {
      const userDocRef = doc(db, "users", user.uid);
      
      const dataToUpdate: Record<string, any> = { // Use Record<string, any> for flexible update payload
        ...profileData,
        updatedAt: serverTimestamp() as Timestamp,
      };

      // Handle nested address object: ensure to merge, not overwrite
      if (profileData.address) {
        const currentAddress = userProfile?.address || {};
        dataToUpdate.address = { ...currentAddress, ...profileData.address };
      }
      // Handle nested socialMedia object
      if (profileData.socialMedia) {
        const currentSocials = userProfile?.socialMedia || {};
        dataToUpdate.socialMedia = { ...currentSocials, ...profileData.socialMedia };
         // Clean up empty social media links (set to undefined to remove from Firestore if desired, or handle in component)
        for (const key in dataToUpdate.socialMedia) {
          if (!dataToUpdate.socialMedia[key]) {
            delete dataToUpdate.socialMedia[key]; // Or set to null / FieldValue.delete()
          }
        }
      }
      
      await updateDoc(userDocRef, dataToUpdate);
      await fetchUserProfile(user.uid); // Re-fetch to update context state
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
      setUser(null); // Explicitly set user to null
      setUserProfile(null); // Explicitly set profile to null
      // isLoadingProfile will be set to false by onAuthStateChanged via fetchUserProfile
    } catch (error: any) {
      console.error("Sign out failed:", error);
      toast({ title: "Sign Out Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoadingAuth(false);
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
      // It's good practice to re-authenticate the user for sensitive operations if this fails often.
      // Firebase might throw an error requiring recent login.
      toast({ title: "Password Update Error", description: error.message + " You might need to sign in again.", variant: "destructive" });
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
