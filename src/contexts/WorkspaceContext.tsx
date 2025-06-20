
"use client";

import type { User } from 'firebase/auth';
import type { Timestamp } from 'firebase/firestore';
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { collection, query, orderBy, onSnapshot, getDocs, doc, addDoc, deleteDoc, updateDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db, APP_ID, rtdb } from '@/lib/firebaseConfig';
import { ref as rtdbRef, set as rtdbSet, onValue as rtdbOnValue, off as rtdbOff } from 'firebase/database';
import { useAuth } from './AuthContext';
import { type ThirtyDayChallengeTemplateItem, thirtyDayChallengeTemplate } from '@/lib/templates';


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
  caption?: string; // Added caption field
  dueDate?: string;
  status?: ContentStatus;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

export type ContentStatus = 'Draft' | 'In Progress' | 'For Review' | 'Approved' | 'Published';
export const CONTENT_STATUSES: ContentStatus[] = ['Draft', 'In Progress', 'For Review', 'Approved', 'Published'];

export interface Comment {
  id: string;
  text: string;
  authorName: string; // Or authorId if you want to link to user profiles
  authorId: string;
  createdAt: Timestamp | Date;
}


interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  currentWorkspaceId: string | null;
  isLoadingWorkspaces: boolean;
  setCurrentWorkspaceId: (id: string | null) => void;
  createWorkspace: (name: string, description?: string, seedWithTemplate?: boolean) => Promise<string | undefined>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;
  contentItems: ContentItem[];
  isLoadingContent: boolean;
  createContentItem: (item: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateContentItem: (item: ContentItem) => Promise<void>;
  deleteContentItem: (itemId: string) => Promise<void>;
  getComments: (contentItemId: string, callback: (comments: Comment[]) => void) => () => void;
  addComment: (contentItemId: string, text: string) => Promise<void>;
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


  useEffect(() => {
    if (!user) {
      setWorkspaces([]);
      setIsLoadingWorkspaces(false);
      setCurrentWorkspaceIdState(null);
      setIsInitialRtdbLoadAttempted(false);
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

  useEffect(() => {
    if (!user || !rtdb || isInitialRtdbLoadAttempted) {
      if (user && !isInitialRtdbLoadAttempted) {
        setIsInitialRtdbLoadAttempted(true);
      }
      return;
    }

    const preferencePath = `users/${user.uid}/preferences/lastSelectedWorkspaceId`;
    const userPreferenceRef = rtdbRef(rtdb, preferencePath);

    const listener = rtdbOnValue(userPreferenceRef, (snapshot) => {
      const lastId = snapshot.val() as string | null;
      if (lastId && currentWorkspaceId === null) {
        setCurrentWorkspaceIdState(lastId);
      }
      setIsInitialRtdbLoadAttempted(true);
      rtdbOff(userPreferenceRef, 'value', listener);
    }, (error) => {
      console.error("Error fetching last selected workspace ID from RTDB:", error);
      setIsInitialRtdbLoadAttempted(true);
      rtdbOff(userPreferenceRef, 'value', listener);
    });

    return () => {
      rtdbOff(userPreferenceRef, 'value', listener);
    };
  }, [user, isInitialRtdbLoadAttempted, currentWorkspaceId]);


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
  }, [user]);

  const createWorkspace = async (name: string, description?: string, seedWithTemplate: boolean = false): Promise<string | undefined> => {
    if (!user) throw new Error("User not authenticated");
    const newWorkspaceRef = await addDoc(collection(db, "artifacts", APP_ID, "users", user.uid, "workspaces"), {
      name,
      description: description || "",
      ownerId: user.uid,
      createdAt: serverTimestamp(),
    });

    if (seedWithTemplate) {
      const planCollectionRef = collection(db, "artifacts", APP_ID, "users", user.uid, "workspaces", newWorkspaceRef.id, "contentPlan");
      const batch = writeBatch(db);
      thirtyDayChallengeTemplate.forEach((item: ThirtyDayChallengeTemplateItem) => {
        const docRef = doc(planCollectionRef); // Auto-generate ID
        const newItem: Omit<ContentItem, 'id' | 'updatedAt'> = {
          title: item.title,
          idea: item.coreIdea,
          script: item.script,
          caption: item.caption,
          status: 'Draft',
          createdAt: serverTimestamp(),
        };
        batch.set(docRef, newItem);
      });
      await batch.commit();
    }
    return newWorkspaceRef.id;
  };

  const deleteWorkspace = async (workspaceId: string) => {
    if (!user) throw new Error("User not authenticated");
    // Add logic to delete subcollections (contentPlan, comments) if necessary before deleting workspace doc
    // For simplicity, this example only deletes the workspace doc.
    // In a real app, a Firebase Function might be better for cascading deletes.
    const contentPlanRef = collection(db, "artifacts", APP_ID, "users", user.uid, "workspaces", workspaceId, "contentPlan");
    const contentPlanSnapshot = await getDocs(contentPlanRef);
    const batch = writeBatch(db);
    contentPlanSnapshot.forEach(docSnapshot => {
      batch.delete(docSnapshot.ref);
      // Could also queue deletion of comments subcollection here if needed
    });
    await batch.commit();

    await deleteDoc(doc(db, "artifacts", APP_ID, "users", user.uid, "workspaces", workspaceId));
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
    if (window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
       // Also delete comments subcollection for this item
      const commentsRef = collection(db, "artifacts", APP_ID, "users", user.uid, "workspaces", currentWorkspaceId, "contentPlan", itemId, "comments");
      const commentsSnapshot = await getDocs(commentsRef);
      const batch = writeBatch(db);
      commentsSnapshot.forEach(docSnapshot => {
        batch.delete(docSnapshot.ref);
      });
      await batch.commit();

      await deleteDoc(doc(db, "artifacts", APP_ID, "users", user.uid, "workspaces", currentWorkspaceId, "contentPlan", itemId));
    }
  };

  const getComments = useCallback((contentItemId: string, callback: (comments: Comment[]) => void) => {
    if (!user || !currentWorkspaceId) {
      callback([]);
      return () => {};
    }
    const commentsQuery = query(
      collection(db, "artifacts", APP_ID, "users", user.uid, "workspaces", currentWorkspaceId, "contentPlan", contentItemId, "comments"),
      orderBy("createdAt", "asc")
    );
    const unsubscribe = onSnapshot(commentsQuery, snapshot => {
      callback(snapshot.docs.map(docData => ({
        id: docData.id,
        ...docData.data(),
        createdAt: docData.data().createdAt?.toDate ? docData.data().createdAt.toDate() : new Date(),
      } as Comment)));
    }, (error) => {
        console.error("Error fetching comments:", error);
        callback([]);
    });
    return unsubscribe;
  }, [user, currentWorkspaceId]);

  const addComment = async (contentItemId: string, text: string) => {
    if (!user || !currentWorkspaceId) throw new Error("User or workspace not available");
    if (!text.trim()) throw new Error("Comment text cannot be empty");

    await addDoc(collection(db, "artifacts", APP_ID, "users", user.uid, "workspaces", currentWorkspaceId, "contentPlan", contentItemId, "comments"), {
      text,
      authorId: user.uid,
      authorName: user.displayName || user.email || "Anonymous User",
      createdAt: serverTimestamp(),
    });
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
        deleteWorkspace,
        contentItems,
        isLoadingContent,
        createContentItem,
        updateContentItem,
        deleteContentItem,
        getComments,
        addComment,
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
