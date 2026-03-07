// src/contexts/AuthContext.tsx
"use client";

import type { AuthCredential, User as FirebaseUser } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { 
  GoogleAuthProvider,
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  sendPasswordResetEmail,
  updatePassword as firebaseUpdatePassword,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebaseConfig'; 
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { EmailPasswordCredentials, GoogleSignInResult } from '@/types/auth';
import type { UserProfile } from '@/types/user';
import {
  createAuthFlowError,
  isPopupFallbackError,
  mapFirebaseGoogleAuthError,
} from '@/lib/auth/firebase-auth-errors';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  pendingGoogleLinkEmail: string | null;
  isAuthReady: boolean; 
  isLoadingAuth: boolean; 
  isLoadingProfile: boolean; 
  signUpWithEmail: (credentials: EmailPasswordCredentials) => Promise<FirebaseUser | null>;
  signInWithEmail: (credentials: EmailPasswordCredentials) => Promise<FirebaseUser | null>;
  signInWithGoogle: () => Promise<GoogleSignInResult>;
  clearPendingGoogleLink: () => void;
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
  const [pendingGoogleLinkEmail, setPendingGoogleLinkEmail] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false); 
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); 
  const [isLoadingProfile, setIsLoadingProfile] = useState(true); 
  const pendingGoogleCredentialRef = useRef<AuthCredential | null>(null);

  const normalizeEmail = (value: unknown) => String(value || '').trim().toLowerCase();
  const normalizeOnboardingCompleted = (profile: Partial<UserProfile>): boolean => {
    if (typeof profile.onboardingCompleted === 'boolean') return profile.onboardingCompleted;
    const legacy = (profile as any).onboardingComplete;
    if (typeof legacy === 'boolean') return legacy;
    return false;
  };

  const fetchUserProfile = useCallback(async (uid: string): Promise<UserProfile | null> => {
    if (!db) {
      setIsLoadingProfile(false);
      return null;
    }
    setIsLoadingProfile(true);
    try {
      const userDocRef = doc(db, "users", uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const rawProfile = userDocSnap.data() as Partial<UserProfile>;
        const profile: UserProfile = {
          ...(rawProfile as UserProfile),
          onboardingCompleted: normalizeOnboardingCompleted(rawProfile),
        };
        setUserProfile(profile);
        return profile;
      } else {
        setUserProfile(null); 
        return null;
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUserProfile((prev) => (prev?.uid === uid ? prev : null));
      return null;
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);

  const clearPendingGoogleLink = useCallback(() => {
    pendingGoogleCredentialRef.current = null;
    setPendingGoogleLinkEmail(null);
  }, []);

  const ensureUserProfileDoc = useCallback(
    async (firebaseUser: FirebaseUser): Promise<UserProfile | null> => {
      if (!db) {
        setIsLoadingProfile(false);
        return null;
      }

      setIsLoadingProfile(true);

      try {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const rawExisting = userDocSnap.data() as Partial<UserProfile>;
          const existing: UserProfile = {
            ...(rawExisting as UserProfile),
            onboardingCompleted: normalizeOnboardingCompleted(rawExisting),
          };
          const patch: Partial<UserProfile> = {};
          if (!existing.email && firebaseUser.email) patch.email = firebaseUser.email;
          if (!existing.displayName && firebaseUser.displayName) patch.displayName = firebaseUser.displayName;
          if (typeof (rawExisting as any).onboardingCompleted !== 'boolean') {
            patch.onboardingCompleted = existing.onboardingCompleted;
          }

          if (Object.keys(patch).length) {
            await setDoc(
              userDocRef,
              {
                ...patch,
                updatedAt: serverTimestamp() as Timestamp,
              },
              { merge: true },
            );
            return fetchUserProfile(firebaseUser.uid);
          }

          setUserProfile(existing);
          return existing;
        }

        await setDoc(
          userDocRef,
          {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || undefined,
            onboardingCompleted: false,
            createdAt: serverTimestamp() as Timestamp,
            updatedAt: serverTimestamp() as Timestamp,
          },
          { merge: true },
        );

        return fetchUserProfile(firebaseUser.uid);
      } finally {
        setIsLoadingProfile(false);
      }
    },
    [fetchUserProfile],
  );

  const linkPendingGoogleCredential = useCallback(
    async (firebaseUser: FirebaseUser, email: string) => {
      const pendingCredential = pendingGoogleCredentialRef.current;
      if (!pendingCredential) return;

      const normalizedTarget = normalizeEmail(pendingGoogleLinkEmail || '');
      const normalizedCurrent = normalizeEmail(email || firebaseUser.email || '');
      if (!normalizedTarget || normalizedTarget !== normalizedCurrent) return;

      try {
        await linkWithCredential(firebaseUser, pendingCredential);
      } catch (error: any) {
        const code = String(error?.code || '').trim();
        const alreadyLinked =
          code === 'auth/provider-already-linked' || code === 'auth/credential-already-in-use';
        if (!alreadyLinked) {
          throw createAuthFlowError(
            'GOOGLE_FAILED',
            'Signed in, but failed to link Google account. Please try again.',
            code || undefined,
          );
        }
      } finally {
        clearPendingGoogleLink();
      }
    },
    [clearPendingGoogleLink, pendingGoogleLinkEmail],
  );

  useEffect(() => {
    if (!auth) {
      setIsLoadingAuth(false);
      setIsLoadingProfile(false);
      setIsAuthReady(true);
      return;
    }

    let isMounted = true;

    void getRedirectResult(auth)
      .then(async (result) => {
        if (!result?.user || !isMounted) return;
        await ensureUserProfileDoc(result.user).catch((error) => {
          console.error('Failed to bootstrap profile after Google redirect sign-in:', error);
        });
      })
      .catch((error) => {
        console.warn('Google redirect result check failed:', error);
      });

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!isMounted) return;

      setUser(currentUser);
      setIsLoadingAuth(false);
      if (currentUser) {
        void ensureUserProfileDoc(currentUser).catch((error) => {
          console.error('Error ensuring user profile:', error);
          setUserProfile((prev) => (prev?.uid === currentUser.uid ? prev : null));
          setIsLoadingProfile(false);
        });
      } else {
        clearPendingGoogleLink();
        setUserProfile(null);
        setIsLoadingProfile(false);
      }
      setIsAuthReady(true);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [clearPendingGoogleLink, ensureUserProfileDoc]);

  useEffect(() => {
    if (!user || userProfile || isLoadingProfile) return;

    const retryProfileBootstrap = () => {
      void ensureUserProfileDoc(user).catch((error) => {
        console.warn('Profile bootstrap retry failed:', error);
      });
    };

    if (typeof navigator !== 'undefined' && navigator.onLine) {
      retryProfileBootstrap();
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('online', retryProfileBootstrap);
      return () => {
        window.removeEventListener('online', retryProfileBootstrap);
      };
    }
  }, [ensureUserProfileDoc, isLoadingProfile, user, userProfile]);


  const signUpWithEmail = async ({ email, password }: EmailPasswordCredentials): Promise<FirebaseUser | null> => {
    if (!auth || !db) {
      throw new Error("Firebase is not configured. Please check your environment variables (NEXT_PUBLIC_FIREBASE_*).");
    }
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
    if (!auth) {
      throw new Error("Firebase is not configured. Please check your environment variables (NEXT_PUBLIC_FIREBASE_*).");
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await linkPendingGoogleCredential(userCredential.user, email);
      await ensureUserProfileDoc(userCredential.user);
      return userCredential.user;
    } catch (error: any) {
      throw error;
    }
  };

  const signInWithGoogle = async (): Promise<GoogleSignInResult> => {
    if (!auth || !db) {
      throw new Error("Firebase is not configured. Please check your environment variables (NEXT_PUBLIC_FIREBASE_*).");
    }

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const userCredential = await signInWithPopup(auth, provider);
      await ensureUserProfileDoc(userCredential.user);
      clearPendingGoogleLink();
      return { redirectStarted: false };
    } catch (error: any) {
      const rawCode = String(error?.code || '').trim();

      if (rawCode === 'auth/account-exists-with-different-credential') {
        const pendingCredential = GoogleAuthProvider.credentialFromError(error) as AuthCredential | null;
        const collisionEmail = normalizeEmail(error?.customData?.email || error?.email);

        if (pendingCredential && collisionEmail) {
          const methods = await fetchSignInMethodsForEmail(auth, collisionEmail).catch(() => [] as string[]);
          if (methods.includes('password')) {
            pendingGoogleCredentialRef.current = pendingCredential;
            setPendingGoogleLinkEmail(collisionEmail);
            throw createAuthFlowError(
              'ACCOUNT_LINK_REQUIRED',
              'This email already uses password sign-in. Sign in with password to link Google.',
              rawCode,
            );
          }
        }
      }

      if (isPopupFallbackError(error)) {
        await signInWithRedirect(auth, provider);
        return { redirectStarted: true };
      }

      throw mapFirebaseGoogleAuthError(error);
    }
  };
  
  const saveOnboardingProfile = async (profileData: Partial<Pick<UserProfile, 'displayName' | 'phoneNumber' | 'dateOfBirth'>>): Promise<void> => {
    if (!user || !db) throw new Error("User not authenticated or Firestore not initialized.");
    setIsLoadingProfile(true);
    try {
      const userDocRef = doc(db, "users", user.uid);
      const dataToUpdate = {
        ...profileData, 
        uid: user.uid,
        email: user.email || '',
        onboardingCompleted: true,
        updatedAt: serverTimestamp() as Timestamp,
      };
      // Use setDoc with merge: true to handle cases where the document might not exist yet
      await setDoc(userDocRef, dataToUpdate, { merge: true });
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
      await setDoc(userDocRef, {
        ...profileData,
        updatedAt: serverTimestamp()
      }, { merge: true });
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
    clearPendingGoogleLink();
    setUser(null); 
    setUserProfile(null); 
  };

  const sendPasswordReset = async (email: string) => {
    if (!auth) throw new Error("Firebase Auth not initialized.");
    await sendPasswordResetEmail(auth, email);
  };
  
  const updateUserPassword = async (newPassword: string) => {
    if (!auth || !auth.currentUser) throw new Error("User not authenticated or Auth not initialized.");
    await firebaseUpdatePassword(auth.currentUser, newPassword);
  };

  return (
    <AuthContext.Provider value={{ 
        user,
        userProfile, 
        isAuthReady, 
        isLoadingAuth,
        isLoadingProfile,
        pendingGoogleLinkEmail,
        signUpWithEmail,
        signInWithEmail,
        signInWithGoogle,
        clearPendingGoogleLink,
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
