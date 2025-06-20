
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
  const [initialWorkspaceIdLoaded, setInitialWorkspaceIdLoaded] = useState(false);


  // Effect for Firestore: fetching workspaces
  useEffect(() => {
    if (!user) {
      setWorkspaces([]);
      setIsLoadingWorkspaces(false);
      setCurrentWorkspaceIdState(null); 
      setInitialWorkspaceIdLoaded(false);
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

  // Effect for RTDB: fetching last selected workspace ID
  useEffect(() => {
    if (!user || !rtdb) {
      setInitialWorkspaceIdLoaded(true); // Mark as loaded if no user or rtdb
      return;
    }

    const preferencePath = `users/${user.uid}/preferences/lastSelectedWorkspaceId`;
    const userPreferenceRef = rtdbRef(rtdb, preferencePath);

    const listener = rtdbOnValue(userPreferenceRef, (snapshot) => {
      const lastId = snapshot.val();
      if (lastId && !initialWorkspaceIdLoaded && !currentWorkspaceId) { 
        // Only set if it's the initial load and not already set by interaction
        setCurrentWorkspaceIdState(lastId);
      }
      setInitialWorkspaceIdLoaded(true); 
    }, (error) => {
      console.error("Error fetching last selected workspace ID from RTDB:", error);
      setInitialWorkspaceIdLoaded(true); // Mark as loaded even on error
    });

    return () => {
      rtdbOff(userPreferenceRef, 'value', listener);
    };
  }, [user, initialWorkspaceIdLoaded, currentWorkspaceId]);


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
    if (id === null) { // When deselecting workspace, ensure initial load flag is reset for next login/selection
        setInitialWorkspaceIdLoaded(false);
    }
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


