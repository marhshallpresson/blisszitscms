// src/contexts/WorkspaceContext.tsx
"use client";

import type { Timestamp } from 'firebase/firestore';
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { collection, query, orderBy, onSnapshot, doc, addDoc, deleteDoc, updateDoc, serverTimestamp, writeBatch, where } from 'firebase/firestore';
import { db, rtdb } from '@/lib/firebaseConfig';
import { ref as rtdbRef, set as rtdbSet, onValue as rtdbOnValue } from 'firebase/database';
import { useAuth } from './AuthContext';
import { normalizeNetworkKey } from '@/lib/network-capabilities';

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  contentCount?: number;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

export interface PostVariant {
  id: string;
  network: string;
  text: string;
  mediaUrl?: string;
  scheduledAt?: string;
}

export interface SocialAccount {
  id: string;
  workspaceId: string;
  network: string;
  accountName: string;
  status: 'connected' | 'expiring' | 'expired' | 'revoked' | 'error' | 'disconnected';
  integrationMode: 'metadata_only' | 'oauth';
  credentialRef?: string;
  accountExternalId?: string;
  scope?: string[];
  expiresAt?: string;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

export interface ContentItem {
  id: string;
  workspaceId: string;
  title: string;
  idea?: string;
  script?: string;
  caption?: string;
  dueDate?: string;
  status?: ContentStatus;
  approvalStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  variants?: PostVariant[];
  scheduledAt?: string;
  publishedAt?: string;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

export type ContentStatus = 'idea' | 'draft' | 'in_progress' | 'review' | 'approved' | 'scheduled' | 'published' | 'failed';
export type ApprovalStatus = 'none' | 'pending' | 'approved' | 'rejected';

export const CONTENT_STATUSES: ContentStatus[] = [
  'idea',
  'draft',
  'in_progress',
  'review',
  'approved',
  'scheduled',
  'published',
  'failed',
];

export const CONTENT_STATUS_LABELS: Record<ContentStatus, string> = {
  idea: 'Idea',
  draft: 'Draft',
  in_progress: 'In Progress',
  review: 'For Review',
  approved: 'Approved',
  scheduled: 'Scheduled',
  published: 'Published',
  failed: 'Failed',
};

const CONTENT_STATUS_MAP: Record<string, ContentStatus> = {
  idea: 'idea',
  draft: 'draft',
  'in progress': 'in_progress',
  in_progress: 'in_progress',
  review: 'review',
  'for review': 'review',
  for_review: 'review',
  approved: 'approved',
  scheduled: 'scheduled',
  published: 'published',
  failed: 'failed',
};

export const normalizeContentStatus = (status?: string): ContentStatus => {
  if (!status) return 'draft';
  const raw = status.trim().toLowerCase();
  return CONTENT_STATUS_MAP[raw] ?? CONTENT_STATUS_MAP[raw.replace(/\s+/g, '_')] ?? 'draft';
};

export const getContentStatusLabel = (status?: ContentStatus): string => {
  if (!status) return CONTENT_STATUS_LABELS.draft;
  return CONTENT_STATUS_LABELS[status] ?? CONTENT_STATUS_LABELS.draft;
};

const CONTENT_TRANSITIONS: Record<ContentStatus, ContentStatus[]> = {
  idea: ['draft', 'failed'],
  draft: ['in_progress', 'review', 'failed'],
  in_progress: ['draft', 'review', 'failed'],
  review: ['draft', 'approved', 'failed'],
  approved: ['draft', 'scheduled', 'published', 'failed'],
  scheduled: ['draft', 'published', 'failed'],
  published: [],
  failed: ['draft', 'in_progress'],
};

export const isValidContentTransition = (
  from: ContentStatus | undefined,
  to: ContentStatus | undefined,
  approvalStatus: ApprovalStatus = 'none'
): boolean => {
  const source = normalizeContentStatus(from);
  const target = normalizeContentStatus(to);

  if (source === target) return true;
  if (!CONTENT_TRANSITIONS[source].includes(target)) return false;

  if (target === 'approved' && approvalStatus !== 'approved') return false;
  if (target === 'scheduled' && approvalStatus !== 'approved') return false;

  return true;
};

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

export interface ContentSeed {
  title: string;
  idea: string;
}

export type PublishJobStatus = 'queued' | 'claimed' | 'processing' | 'published' | 'retrying' | 'failed' | 'dead_letter';

export interface PublishJob {
  id: string;
  workspaceId: string;
  contentItemId: string;
  network: string;
  status: PublishJobStatus;
  scheduledFor: string;
  nextAttemptAt?: string;
  publishedAt?: string;
  providerRequestId?: string;
  externalPostId?: string;
  errorCode?: string;
  attemptCount: number;
  maxAttempts: number;
  lastError?: string;
  idempotencyKey: string;
  taskName?: string;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  currentWorkspaceId: string | null;
  isLoadingWorkspaces: boolean;
  setCurrentWorkspaceId: (id: string | null) => void;
  createWorkspace: (name: string, description?: string, contentPlan?: ContentSeed[]) => Promise<string | undefined>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;

  contentItems: ContentItem[];
  isLoadingContent: boolean;
  createContentItem: (item: Omit<ContentItem, 'id' | 'workspaceId' | 'createdAt' | 'updatedAt'>, workspaceId?: string) => Promise<void>;
  updateContentItem: (item: ContentItem) => Promise<void>;
  deleteContentItem: (itemId: string) => Promise<void>;

  getComments: (contentItemId: string, callback: (comments: Comment[]) => void) => () => void;
  addComment: (contentItemId: string, text: string) => Promise<void>;

  ideas: Idea[];
  isLoadingIdeas: boolean;
  addIdea: (text: string) => Promise<void>;
  updateIdeaStatus: (ideaId: string, status: IdeaBoardStatus) => Promise<void>;
  deleteIdea: (ideaId: string) => Promise<void>;

  socialAccounts: SocialAccount[];
  connectAccount: (network: string, name: string) => Promise<void>;
  disconnectAccount: (id: string) => Promise<void>;

  publishJobs: PublishJob[];
  isLoadingPublishJobs: boolean;
  scheduleContentItemForPublishing: (contentItemId: string, scheduledFor?: string) => Promise<void>;
  runDuePublishJobs: () => Promise<void>;
  retryPublishJob: (jobId: string) => Promise<void>;
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
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [publishJobs, setPublishJobs] = useState<PublishJob[]>([]);
  const [isLoadingPublishJobs, setIsLoadingPublishJobs] = useState(true);

  useEffect(() => {
    if (!user || !db) {
      setWorkspaces([]);
      setIsLoadingWorkspaces(false);
      setCurrentWorkspaceIdState(null);
      setContentItems([]);
      setIdeas([]);
      setSocialAccounts([]);
      setPublishJobs([]);
      setIsLoadingPublishJobs(false);
      return;
    }

    setIsLoadingWorkspaces(true);
    const q = query(collection(db, "workspaces"), where("ownerId", "==", user.uid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const wsData: Workspace[] = [];
        snapshot.forEach((docSnap) => wsData.push({ id: docSnap.id, ...(docSnap.data() as Omit<Workspace, 'id'>) }));
        wsData.sort((a, b) => {
          const dateA = a.createdAt ? (a.createdAt as Timestamp).toDate().getTime() : 0;
          const dateB = b.createdAt ? (b.createdAt as Timestamp).toDate().getTime() : 0;
          return dateB - dateA;
        });
        setWorkspaces(wsData);
        setIsLoadingWorkspaces(false);
      },
      (error) => {
        console.error('Error listening to workspaces:', error);
        setWorkspaces([]);
        setIsLoadingWorkspaces(false);
      }
    );

    return () => unsubscribe();
  }, [user]);
  
  useEffect(() => {
    if (!user || !currentWorkspaceId || !db) {
      setContentItems([]);
      setIsLoadingContent(false);
      return;
    }
    
    setIsLoadingContent(true);
    const contentQuery = query(collection(db, `workspaces/${currentWorkspaceId}/content`), orderBy("createdAt", "desc"));
    const unsubscribeContent = onSnapshot(
      contentQuery,
      (snapshot) => {
        const items: ContentItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Partial<ContentItem> & { status?: string };
          items.push({
            id: docSnap.id,
            workspaceId: currentWorkspaceId,
            title: data.title || '',
            idea: data.idea,
            script: data.script,
            caption: data.caption,
            dueDate: data.dueDate,
            status: normalizeContentStatus(data.status),
            approvalStatus: data.approvalStatus ?? 'none',
            variants: data.variants ?? [],
            scheduledAt: data.scheduledAt,
            publishedAt: data.publishedAt,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        });
        setContentItems(items);
        setIsLoadingContent(false);
      },
      (error) => {
        console.error('Error listening to content items:', error);
        setContentItems([]);
        setIsLoadingContent(false);
      }
    );

    return () => unsubscribeContent();
  }, [user, currentWorkspaceId]);

  useEffect(() => {
    if (!user || !currentWorkspaceId || !db) {
      setIdeas([]);
      setIsLoadingIdeas(false);
      return;
    }
     setIsLoadingIdeas(true);
     const ideasQuery = query(collection(db, `workspaces/${currentWorkspaceId}/ideas`), orderBy("createdAt", "desc"));
     const unsubscribe = onSnapshot(
      ideasQuery,
      (snapshot) => {
        const ideasData: Idea[] = [];
        snapshot.forEach((docSnap) => ideasData.push({ id: docSnap.id, ...(docSnap.data() as Omit<Idea, 'id'>) }));
        setIdeas(ideasData);
        setIsLoadingIdeas(false);
      },
      (error) => {
        console.error('Error listening to ideas:', error);
        setIdeas([]);
        setIsLoadingIdeas(false);
      }
    );
     return unsubscribe;
  }, [user, currentWorkspaceId]);

  useEffect(() => {
    if (!user || !currentWorkspaceId || !db) {
      setSocialAccounts([]);
      return;
    }
    const q = query(collection(db, `workspaces/${currentWorkspaceId}/social_accounts`));
    return onSnapshot(
      q,
      (snapshot) => {
        const accs: SocialAccount[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Partial<SocialAccount>;
          accs.push({
            id: docSnap.id,
            workspaceId: currentWorkspaceId,
            network: data.network || 'Unknown',
            accountName: data.accountName || 'Unknown Account',
            status: data.status || 'connected',
            integrationMode: data.integrationMode || 'metadata_only',
            credentialRef: data.credentialRef,
            accountExternalId: data.accountExternalId,
            scope: data.scope,
            expiresAt: data.expiresAt,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        });
        setSocialAccounts(accs);
      },
      (error) => {
        console.error('Error listening to social accounts:', error);
        setSocialAccounts([]);
      }
    );
  }, [user, currentWorkspaceId]);

  useEffect(() => {
    if (!user || !currentWorkspaceId || !db) {
      setPublishJobs([]);
      setIsLoadingPublishJobs(false);
      return;
    }

    setIsLoadingPublishJobs(true);
    const publishJobsQuery = query(
      collection(db, `workspaces/${currentWorkspaceId}/publish_jobs`),
      orderBy('scheduledFor', 'asc')
    );

    return onSnapshot(
      publishJobsQuery,
      (snapshot) => {
        const jobs: PublishJob[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Partial<PublishJob>;
          jobs.push({
            id: docSnap.id,
            workspaceId: currentWorkspaceId,
            contentItemId: data.contentItemId || '',
            network: data.network || 'unknown',
            status: (data.status as PublishJobStatus) || 'queued',
            scheduledFor: data.scheduledFor || new Date().toISOString(),
            nextAttemptAt: data.nextAttemptAt,
            publishedAt: data.publishedAt,
            providerRequestId: data.providerRequestId,
            externalPostId: data.externalPostId,
            errorCode: data.errorCode,
            attemptCount: data.attemptCount ?? 0,
            maxAttempts: data.maxAttempts ?? 3,
            lastError: data.lastError,
            idempotencyKey: data.idempotencyKey || `${docSnap.id}:${currentWorkspaceId}`,
            taskName: data.taskName,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        });
        setPublishJobs(jobs);
        setIsLoadingPublishJobs(false);
      },
      (error) => {
        console.error('Error listening to publish jobs:', error);
        setPublishJobs([]);
        setIsLoadingPublishJobs(false);
      }
    );
  }, [user, currentWorkspaceId]);

  const setCurrentWorkspaceId = useCallback((id: string | null) => {
    if (user && id && rtdb) {
      const prefRef = rtdbRef(rtdb, `userPrefs/${user.uid}/lastWorkspace`);
      rtdbSet(prefRef, id);
    }
    setCurrentWorkspaceIdState(id);
  }, [user]);

  useEffect(() => {
    if (user && workspaces.length > 0 && !currentWorkspaceId && rtdb) {
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

  const postWithAuth = useCallback(
    async <TResponse,>(path: string, body: Record<string, unknown>): Promise<TResponse> => {
      if (!user) throw new Error('User not authenticated.');
      const idToken = await user.getIdToken();
      const response = await fetch(path, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(body),
      });

      let payload: unknown = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok) {
        const message =
          typeof payload === 'object' &&
          payload !== null &&
          'error' in payload &&
          typeof (payload as { error?: unknown }).error === 'string'
            ? ((payload as { error: string }).error)
            : 'Request failed.';
        throw new Error(message);
      }

      return payload as TResponse;
    },
    [user]
  );

  const createWorkspace = async (name: string, description: string = '', contentPlan: ContentSeed[] = []): Promise<string | undefined> => {
    if (!user || !db) throw new Error("User not logged in");
    const firestore = db;
    const batch = writeBatch(firestore);
    const newWorkspaceRef = doc(collection(firestore, "workspaces"));
    batch.set(newWorkspaceRef, { name, description, ownerId: user.uid, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    if (contentPlan.length > 0) {
      contentPlan.forEach((itemTemplate) => {
        const contentRef = doc(collection(firestore, `workspaces/${newWorkspaceRef.id}/content`));
        batch.set(contentRef, {
          workspaceId: newWorkspaceRef.id,
          title: itemTemplate.title,
          idea: itemTemplate.idea,
          status: 'draft',
          approvalStatus: 'none',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });
    }
    await batch.commit();
    return newWorkspaceRef.id;
  };

  const deleteWorkspace = async (workspaceId: string) => {
    if (!user || !db) throw new Error("User not logged in");
    await postWithAuth<{ ok: boolean }>('/api/workspaces/delete', { workspaceId });
    if (currentWorkspaceId === workspaceId) setCurrentWorkspaceId(null);
  };

  const createContentItem = async (item: Omit<ContentItem, 'id' | 'workspaceId' | 'createdAt' | 'updatedAt'>, workspaceId?: string) => {
    const targetWorkspaceId = workspaceId || currentWorkspaceId;
    if (!user || !db || !targetWorkspaceId) throw new Error("No workspace selected.");
    const nextStatus = normalizeContentStatus(item.status);
    await addDoc(collection(db, `workspaces/${targetWorkspaceId}/content`), {
      ...item,
      workspaceId: targetWorkspaceId,
      status: nextStatus,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const updateContentItem = async (item: ContentItem) => {
    if (!user || !db || !currentWorkspaceId) throw new Error("No workspace selected.");
    const existingItem = contentItems.find((content) => content.id === item.id);
    const currentStatus = normalizeContentStatus(existingItem?.status);
    const nextStatus = normalizeContentStatus(item.status);
    const nextApprovalStatus = (item.approvalStatus ?? existingItem?.approvalStatus ?? 'none') as ApprovalStatus;

    if (!isValidContentTransition(currentStatus, nextStatus, nextApprovalStatus)) {
      throw new Error(`Invalid status transition: ${currentStatus} -> ${nextStatus}`);
    }

    const itemRef = doc(db, `workspaces/${currentWorkspaceId}/content`, item.id);
    await updateDoc(itemRef, {
      ...item,
      workspaceId: currentWorkspaceId,
      status: nextStatus,
      updatedAt: serverTimestamp(),
    });
  };

  const deleteContentItem = async (itemId: string) => {
    if (!user || !db || !currentWorkspaceId) throw new Error("No workspace selected.");
    await deleteDoc(doc(db, `workspaces/${currentWorkspaceId}/content`, itemId));
  };
  
  const getComments = useCallback((contentItemId: string, callback: (comments: Comment[]) => void) => {
    if (!currentWorkspaceId || !db) return () => {};
    const commentsQuery = query(collection(db, `workspaces/${currentWorkspaceId}/content/${contentItemId}/comments`), orderBy("createdAt", "asc"));
    return onSnapshot(
      commentsQuery,
      (snapshot) => {
        const commentsData: Comment[] = [];
        snapshot.forEach((docSnap) => commentsData.push({ id: docSnap.id, ...(docSnap.data() as Omit<Comment, 'id'>) }));
        callback(commentsData);
      },
      (error) => {
        console.error('Error listening to comments:', error);
        callback([]);
      }
    );
  }, [currentWorkspaceId]);

  const addComment = async (contentItemId: string, text: string) => {
    if (!user || !db || !currentWorkspaceId) throw new Error("No workspace selected.");
    await addDoc(collection(db, `workspaces/${currentWorkspaceId}/content/${contentItemId}/comments`), {
        text, authorId: user.uid, authorName: user.displayName || user.email, createdAt: serverTimestamp(),
    });
  };

  const addIdea = async (text: string) => {
    if (!user || !db || !currentWorkspaceId) throw new Error("No workspace selected.");
    await addDoc(collection(db, `workspaces/${currentWorkspaceId}/ideas`), { text, status: 'Ideas', createdAt: serverTimestamp() });
  };

  const updateIdeaStatus = async (ideaId: string, status: IdeaBoardStatus) => {
     if (!user || !db || !currentWorkspaceId) throw new Error("No workspace selected.");
     await updateDoc(doc(db, `workspaces/${currentWorkspaceId}/ideas`, ideaId), { status });
  };
  
  const deleteIdea = async (ideaId: string) => {
     if (!user || !db || !currentWorkspaceId) throw new Error("No workspace selected.");
     await deleteDoc(doc(db, `workspaces/${currentWorkspaceId}/ideas`, ideaId));
  };

  const scheduleContentItemForPublishing = async (contentItemId: string, scheduledFor?: string) => {
    if (!user || !db || !currentWorkspaceId) throw new Error("No workspace selected.");
    const item = contentItems.find((content) => content.id === contentItemId);
    if (!item) throw new Error("Content item not found.");

    const approvalStatus = item.approvalStatus ?? 'none';
    const currentStatus = normalizeContentStatus(item.status);
    if (approvalStatus !== 'approved' && currentStatus !== 'scheduled') {
      throw new Error("Content must be approved before scheduling.");
    }

    const candidateNetworks = (item.variants ?? [])
      .map((variant) => normalizeNetworkKey(variant.network))
      .filter((network): network is NonNullable<typeof network> => !!network);

    const fallbackNetworks = socialAccounts
      .map((account) => normalizeNetworkKey(account.network))
      .filter((network): network is NonNullable<typeof network> => !!network);

    const targetNetworks = Array.from(new Set(candidateNetworks.length > 0 ? candidateNetworks : fallbackNetworks));
    if (targetNetworks.length === 0) {
      throw new Error("Connect at least one social account or add a platform variant before scheduling.");
    }

    const scheduleIso = new Date(scheduledFor || item.scheduledAt || item.dueDate || new Date().toISOString()).toISOString();

    await postWithAuth('/api/publishing/schedule', {
      workspaceId: currentWorkspaceId,
      contentItemId: item.id,
      scheduledFor: scheduleIso,
    });
  };

  const runDuePublishJobs = async () => {
    if (!user || !db || !currentWorkspaceId) throw new Error("No workspace selected.");
    await postWithAuth('/api/publishing/run-due', {
      workspaceId: currentWorkspaceId,
      limit: 50,
    });
  };

  const retryPublishJob = async (jobId: string) => {
    if (!user || !db || !currentWorkspaceId) throw new Error("No workspace selected.");
    const job = publishJobs.find((publishJob) => publishJob.id === jobId);
    if (!job) throw new Error("Publish job not found.");
    if (job.status !== 'failed' && job.status !== 'dead_letter') {
      throw new Error("Only failed/dead-letter jobs can be retried.");
    }

    await postWithAuth('/api/publishing/retry', {
      workspaceId: currentWorkspaceId,
      jobId: job.id,
    });
  };

  const connectAccount = async (network: string, name: string) => {
    if (!user || !db || !currentWorkspaceId) throw new Error("No workspace selected.");
    await postWithAuth<{ id: string }>('/api/social-accounts', {
      workspaceId: currentWorkspaceId,
      network,
      accountName: name,
    });
  };

  const disconnectAccount = async (id: string) => {
    if (!user || !db || !currentWorkspaceId) throw new Error("No workspace selected.");
    await fetch('/api/social-accounts', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await user.getIdToken()}`,
      },
      body: JSON.stringify({
        workspaceId: currentWorkspaceId,
        socialAccountId: id,
      }),
    }).then(async (response) => {
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || 'Failed to disconnect account.');
      }
    });
  };

  const currentWorkspace = workspaces.find(ws => ws.id === currentWorkspaceId) || null;

  return (
    <WorkspaceContext.Provider value={{
        workspaces, currentWorkspace, currentWorkspaceId, isLoadingWorkspaces, setCurrentWorkspaceId,
        createWorkspace, deleteWorkspace, contentItems, isLoadingContent, createContentItem,
        updateContentItem, deleteContentItem, getComments, addComment, ideas, isLoadingIdeas,
        addIdea, updateIdeaStatus, deleteIdea, socialAccounts, connectAccount, disconnectAccount,
        publishJobs, isLoadingPublishJobs, scheduleContentItemForPublishing, runDuePublishJobs, retryPublishJob
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = (): WorkspaceContextType => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) throw new Error('useWorkspace must be used within a WorkspaceProvider');
  return context;
};
