
// src/contexts/WorkspaceContext.tsx
"use client";

import type { Timestamp } from 'firebase/firestore';
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { collection, query, orderBy, onSnapshot, getDocs, doc, addDoc, deleteDoc, updateDoc, serverTimestamp, writeBatch, where } from 'firebase/firestore';
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
  caption?: string; 
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
  authorName: string; 
  authorId: string;
  createdAt: Timestamp | Date;
}

export type IdeaBoardStatus = 'Ideas' | 'Scripting' | 'Filming' | 'Editing' | 'Published';
export const IDEA_BOARD_STATUSES: IdeaBoardStatus[] = ['Ideas', 'Scripting', 'Filming', 'Editing', 'Published'];

export interface Idea {
  id: string;
  text: string;
  status: IdeaBoardStatus;
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
  createContentItem: (item: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>, workspaceId?: string) => Promise<void>;
  updateContentItem: (item: ContentItem) => Promise<void>;
  deleteContentItem: (itemId: string) => Promise<void>;
  
  getComments: (contentItemId: string, callback: (comments: Comment[]) => void) => () => void;
  addComment: (contentItemId: string, text: string) => Promise<void>;

  ideas: Idea[];
  isLoadingIdeas: boolean;
  getIdeas: (callback: (ideas: Idea[]) => void) => () => void;
  addIdea: (text: string) => Promise<void>;
  updateIdeaStatus: (ideaId: string, status: IdeaBoardStatus) => Promise<void>;
  deleteIdea: (ideaId: string) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspaceId, setCurrentWorkspaceIdState] = useState<string | null>(null);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);

  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoadingIdeas, setIsLoadingIdeas] = useState(true);

  useEffect(() => {
    if (!user) {
      setWorkspaces([]);
      setIsLoadingWorkspaces(false);
      setCurrentWorkspaceIdState(null);
      setContentItems([]);
      setIdeas([]);
      return;
    }

    setIsLoadingWorkspaces(true);
    const q = query(collection(db, "workspaces"), where("ownerId", "==", user.uid), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const wsData: Workspace[] = [];
      snapshot.forEach(doc => {
        wsData.push({ id: doc.id, ...doc.data() } as Workspace);
      });
      setWorkspaces(wsData);
      setIsLoadingWorkspaces(false);
    }, (error) => {
        console.error("Error fetching workspaces:", error);
        setIsLoadingWorkspaces(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user || !currentWorkspaceId) {
      setContentItems([]);
      return;
    }
    
    setIsLoadingContent(true);
    const contentQuery = query(collection(db, `workspaces/${currentWorkspaceId}/content`), orderBy("createdAt", "desc"));
    const unsubscribeContent = onSnapshot(contentQuery, (snapshot) => {
      const items: ContentItem[] = [];
      snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() } as ContentItem));
      setContentItems(items);
      setIsLoadingContent(false);
    }, (error) => {
      console.error("Error fetching content items:", error);
      setIsLoadingContent(false);
    });

    return () => unsubscribeContent();
  }, [user, currentWorkspaceId]);

  const setCurrentWorkspaceId = useCallback((id: string | null) => {
    if (user && id) {
      const prefRef = rtdbRef(rtdb, `userPrefs/${user.uid}/lastWorkspace`);
      rtdbSet(prefRef, id);
    }
    setCurrentWorkspaceIdState(id);
  }, [user]);

  useEffect(() => {
    if (user && workspaces.length > 0 && !currentWorkspaceId) {
        const prefRef = rtdbRef(rtdb, `userPrefs/${user.uid}/lastWorkspace`);
        rtdbOnValue(prefRef, (snapshot) => {
            const lastId = snapshot.val();
            if (lastId && workspaces.some(ws => ws.id === lastId)) {
                setCurrentWorkspaceIdState(lastId);
            } else if (workspaces.length > 0) {
                setCurrentWorkspaceIdState(workspaces[0].id);
            }
        }, { onlyOnce: true });
    }
  }, [user, workspaces, currentWorkspaceId]);

  const createWorkspace = async (name: string, description: string = '', seedWithTemplate: boolean = false): Promise<string | undefined> => {
    if (!user || !db) throw new Error("User not logged in or DB not initialized");
    const newWorkspaceRef = await addDoc(collection(db, "workspaces"), {
      name,
      description,
      ownerId: user.uid,
      createdAt: serverTimestamp(),
    });
    
    if (seedWithTemplate) {
        const batch = writeBatch(db);
        thirtyDayChallengeTemplate.forEach((itemTemplate) => {
            const contentRef = doc(collection(db, `workspaces/${newWorkspaceRef.id}/content`));
            batch.set(contentRef, {
                ...itemTemplate,
                status: 'Draft',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
        });
        await batch.commit();
    }
    
    return newWorkspaceRef.id;
  };

  const deleteWorkspace = async (workspaceId: string) => {
    if (!user || !db) throw new Error("User not logged in or DB not initialized");
    
    const contentRef = collection(db, `workspaces/${workspaceId}/content`);
    const contentSnapshot = await getDocs(contentRef);
    const batch = writeBatch(db);
    contentSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    
    await deleteDoc(doc(db, "workspaces", workspaceId));
    
    if (currentWorkspaceId === workspaceId) {
      setCurrentWorkspaceId(null);
    }
  };

  const createContentItem = async (item: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>, workspaceId?: string) => {
    const targetWorkspaceId = workspaceId || currentWorkspaceId;
    if (!user || !db || !targetWorkspaceId) throw new Error("Cannot create content item");
    await addDoc(collection(db, `workspaces/${targetWorkspaceId}/content`), {
      ...item,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const updateContentItem = async (item: ContentItem) => {
    if (!user || !db || !currentWorkspaceId) throw new Error("Cannot update content item");
    const itemRef = doc(db, `workspaces/${currentWorkspaceId}/content`, item.id);
    await updateDoc(itemRef, { ...item, updatedAt: serverTimestamp() });
  };

  const deleteContentItem = async (itemId: string) => {
    if (!user || !db || !currentWorkspaceId) throw new Error("Cannot delete content item");
    await deleteDoc(doc(db, `workspaces/${currentWorkspaceId}/content`, itemId));
  };
  
  const getComments = useCallback((contentItemId: string, callback: (comments: Comment[]) => void) => {
    if (!currentWorkspaceId) return () => {};
    const commentsQuery = query(collection(db, `workspaces/${currentWorkspaceId}/content/${contentItemId}/comments`), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
        const commentsData: Comment[] = [];
        snapshot.forEach(doc => commentsData.push({ id: doc.id, ...doc.data() } as Comment));
        callback(commentsData);
    });
    return unsubscribe;
  }, [currentWorkspaceId]);

  const addComment = async (contentItemId: string, text: string) => {
    if (!user || !db || !currentWorkspaceId) throw new Error("Cannot add comment");
    await addDoc(collection(db, `workspaces/${currentWorkspaceId}/content/${contentItemId}/comments`), {
        text,
        authorId: user.uid,
        authorName: user.displayName || user.email,
        createdAt: serverTimestamp(),
    });
  };

  const getIdeas = useCallback((callback: (ideas: Idea[]) => void) => {
     if (!user || !currentWorkspaceId) return () => {};
     setIsLoadingIdeas(true);
     const ideasQuery = query(collection(db, `workspaces/${currentWorkspaceId}/ideas`), orderBy("createdAt", "desc"));
     const unsubscribe = onSnapshot(ideasQuery, (snapshot) => {
        const ideasData: Idea[] = [];
        snapshot.forEach(doc => ideasData.push({ id: doc.id, ...doc.data() } as Idea));
        setIdeas(ideasData); // Also update context state
        callback(ideasData);
        setIsLoadingIdeas(false);
     }, (error) => {
        console.error("Error fetching ideas:", error);
        setIsLoadingIdeas(false);
     });
     return unsubscribe;
  }, [user, currentWorkspaceId]);

  const addIdea = async (text: string) => {
    if (!user || !db || !currentWorkspaceId) throw new Error("Cannot add idea");
    await addDoc(collection(db, `workspaces/${currentWorkspaceId}/ideas`), {
        text,
        status: 'Ideas',
        createdAt: serverTimestamp(),
    });
  };

  const updateIdeaStatus = async (ideaId: string, status: IdeaBoardStatus) => {
     if (!user || !db || !currentWorkspaceId) throw new Error("Cannot update idea");
     const ideaRef = doc(db, `workspaces/${currentWorkspaceId}/ideas`, ideaId);
     await updateDoc(ideaRef, { status });
  };
  
  const deleteIdea = async (ideaId: string) => {
     if (!user || !db || !currentWorkspaceId) throw new Error("Cannot delete idea");
     await deleteDoc(doc(db, `workspaces/${currentWorkspaceId}/ideas`, ideaId));
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
        ideas,
        isLoadingIdeas,
        getIdeas,
        addIdea,
        updateIdeaStatus,
        deleteIdea,
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
