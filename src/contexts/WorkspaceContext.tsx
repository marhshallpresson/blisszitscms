
"use client";

import type { User } from 'firebase/auth';
import type { Timestamp } from 'firebase/firestore';
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { collection, query, orderBy, onSnapshot, getDocs, doc, addDoc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, APP_ID, rtdb } from '@/lib/firebaseConfig'; // Import rtdb
import { ref as rtdbRef, set as rtdbSet, onValue as rtdbOnValue, off as rtdbOff } from 'firebase/database'; // RTDB functions
import { useAuth } from './AuthContext';

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: Timestamp | Date;
  contentCount?: number;
}

export interface ContentItem {
  id: string;
  title: string;
  idea?: string;
  script?: string;
  dueDate?: string;
  status?: ContentStatus;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

export type ContentStatus = 'Draft' | 'In Progress' | 'For Review' | 'Approved' | 'Published';
export const CONTENT_STATUSES: ContentStatus[] = ['Draft', 'In Progress', 'For Review', 'Approved', 'Published'];


interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  currentWorkspaceId: string | null;
  isLoadingWorkspaces: boolean;
  setCurrentWorkspaceId: (id: string | null) => void;
  createWorkspace: (name: string, description?: string) => Promise<void>;
  contentItems: ContentItem[];
  isLoadingContent: boolean;
  createContentItem: (item: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateContentItem: (item: ContentItem) => Promise<void>;
  deleteContentItem: (itemId: string) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspaceId, setCurrentWorkspaceIdState] = useState<string | null>(null);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);

  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [isInitialRtdbLoadAttempted, setIsInitialRtdbLoadAttempted] = useState(false);


  // Effect for Firestore: fetching workspaces
  useEffect(() => {
    if (!user) {
      setWorkspaces([]);
      setIsLoadingWorkspaces(false);
      setCurrentWorkspaceIdState(null);
      setIsInitialRtdbLoadAttempted(false); // Reset RTDB load attempt status on sign out
      return;
    }
    setIsLoadingWorkspaces(true);
    const q = query(collection(db, "artifacts", APP_ID, "users", user.uid, "workspaces"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const workspacesData = await Promise.all(snapshot.docs.map(async (docData) => {
        const contentCol = collection(db, "artifacts", APP_ID, "users", user.uid, "workspaces", docData.id, "contentPlan");
        const contentSnapshot = await getDocs(contentCol);
        return {
          id: docData.id,
          ...docData.data(),
          createdAt: docData.data().createdAt?.toDate ? docData.data().createdAt.toDate() : new Date(),
          contentCount: contentSnapshot.size
        } as Workspace;
      }));
      setWorkspaces(workspacesData);
      setIsLoadingWorkspaces(false);
    }, (error) => {
      console.error("Error fetching workspaces from Firestore:", error);
      setIsLoadingWorkspaces(false);
    });
    return () => unsubscribe();
  }, [user]);

  // Effect for RTDB: fetching last selected workspace ID ONCE after user loads
  useEffect(() => {
    if (!user || !rtdb || isInitialRtdbLoadAttempted) {
      // If user is available but we haven't attempted RTDB load, mark as attempted.
      // This covers cases where RTDB path might be empty or listener doesn't fire immediately.
      if (user && !isInitialRtdbLoadAttempted) {
        setIsInitialRtdbLoadAttempted(true);
      }
      return;
    }

    const preferencePath = `users/${user.uid}/preferences/lastSelectedWorkspaceId`;
    const userPreferenceRef = rtdbRef(rtdb, preferencePath);

    // Use onValue with a cleanup to ensure it's called once effectively for initial load logic
    const listener = rtdbOnValue(userPreferenceRef, (snapshot) => {
      const lastId = snapshot.val() as string | null;
      // Only set if currentWorkspaceId is still null (i.e., user hasn't interacted yet to set it)
      // and this is the first successful load from RTDB for this session.
      if (lastId && currentWorkspaceId === null) {
        setCurrentWorkspaceIdState(lastId);
      }
      setIsInitialRtdbLoadAttempted(true); // Mark that we've processed the initial RTDB value.
      rtdbOff(userPreferenceRef, 'value', listener); // Detach after the first successful read or if value is null.
    }, (error) => {
      console.error("Error fetching last selected workspace ID from RTDB:", error);
      setIsInitialRtdbLoadAttempted(true); // Mark as attempted even on error.
      rtdbOff(userPreferenceRef, 'value', listener); // Detach on error too.
    });

    return () => {
      // Ensure listener is detached if component unmounts before it fires or on user change.
      rtdbOff(userPreferenceRef, 'value', listener);
    };
  }, [user, isInitialRtdbLoadAttempted, currentWorkspaceId]); // currentWorkspaceId added to allow re-check if it becomes null by other means


  // Effect for Firestore: fetching content items for current workspace
  useEffect(() => {
    if (!user || !currentWorkspaceId) {
      setContentItems([]);
      setIsLoadingContent(false);
      return;
    }
    setIsLoadingContent(true);
    const planQuery = query(collection(db, "artifacts", APP_ID, "users", user.uid, "workspaces", currentWorkspaceId, "contentPlan"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(planQuery, snapshot => {
        setContentItems(snapshot.docs.map(docData => ({
          id: docData.id,
          ...docData.data(),
          createdAt: docData.data().createdAt?.toDate ? docData.data().createdAt.toDate() : new Date(),
          updatedAt: docData.data().updatedAt?.toDate ? docData.data().updatedAt.toDate() : new Date(),
        } as ContentItem)));
        setIsLoadingContent(false);
    }, (error) => {
      console.error("Error fetching content items from Firestore:", error);
      setIsLoadingContent(false);
    });
    return () => unsubscribe();
  }, [user, currentWorkspaceId]);


  const setCurrentWorkspaceId = useCallback((id: string | null) => {
    setCurrentWorkspaceIdState(id);
    if (user && rtdb) {
      const preferencePath = `users/${user.uid}/preferences/lastSelectedWorkspaceId`;
      rtdbSet(rtdbRef(rtdb, preferencePath), id).catch(error => {
        console.error("Error saving last selected workspace ID to RTDB:", error);
      });
    }
    // If user explicitly deselects a workspace (sets id to null),
    // we don't need to reset isInitialRtdbLoadAttempted.
    // That flag is for the very first load from RTDB after authentication.
  }, [user]);

  const createWorkspace = async (name: string, description?: string) => {
    if (!user) throw new Error("User not authenticated");
    await addDoc(collection(db, "artifacts", APP_ID, "users", user.uid, "workspaces"), {
      name,
      description: description || "",
      ownerId: user.uid,
      createdAt: serverTimestamp(),
    });
  };

  const createContentItem = async (item: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user || !currentWorkspaceId) throw new Error("User or workspace not available");
    const planCollection = collection(db, "artifacts", APP_ID, "users", user.uid, "workspaces", currentWorkspaceId, "contentPlan");
    await addDoc(planCollection, {
      ...item,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: item.status || 'Draft'
    });
  };

  const updateContentItem = async (item: ContentItem) => {
    if (!user || !currentWorkspaceId) throw new Error("User or workspace not available");
    const itemRef = doc(db, "artifacts", APP_ID, "users", user.uid, "workspaces", currentWorkspaceId, "contentPlan", item.id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...dataToUpdate } = item;
    await updateDoc(itemRef, {
      ...dataToUpdate,
      updatedAt: serverTimestamp()
    });
  };

  const deleteContentItem = async (itemId: string) => {
    if (!user || !currentWorkspaceId) throw new Error("User or workspace not available");
    // Consider adding a confirmation dialog here in a real app
    if (window.confirm("Are you sure you want to delete this post?")) {
      await deleteDoc(doc(db, "artifacts", APP_ID, "users", user.uid, "workspaces", currentWorkspaceId, "contentPlan", itemId));
    }
  };

  const currentWorkspace = workspaces.find(ws => ws.id === currentWorkspaceId) || null;

  return (
    <WorkspaceContext.Provider value={{
        workspaces,
        currentWorkspace,
        currentWorkspaceId,
        isLoadingWorkspaces,
        setCurrentWorkspaceId,
        createWorkspace,
        contentItems,
        isLoadingContent,
        createContentItem,
        updateContentItem,
        deleteContentItem
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = (): WorkspaceContextType => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

