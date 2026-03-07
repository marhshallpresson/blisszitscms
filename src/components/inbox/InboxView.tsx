// src/components/inbox/InboxView.tsx
"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Inbox as InboxIconLucide, Link as LinkIcon, Loader2, MessageCircle } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { InboxThreadList } from '@/components/inbox/InboxThreadList';
import { InboxThreadView } from '@/components/inbox/InboxThreadView';
import type { InboxMessage, InboxThread, InboxThreadStatus } from './types';

interface InboxViewProps {
  initialThreadId?: string;
}

const SAVED_REPLIES = [
  'Thanks for reaching out. We will review and follow up shortly.',
  'Great question. We can share the template in your inbox today.',
  'Appreciate the feedback. We are adding this to our next sprint.',
];

export const InboxView = ({ initialThreadId }: InboxViewProps) => {
  const { user, userProfile } = useAuth();
  const { socialAccounts, currentWorkspaceId } = useWorkspace();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();

  const [threads, setThreads] = useState<InboxThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | undefined>(initialThreadId);
  const [isMobileThreadOpen, setIsMobileThreadOpen] = useState(Boolean(initialThreadId));
  const [replyText, setReplyText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<InboxThreadStatus | 'all'>('all');

  const fetchWithAuth = async <TResponse,>(url: string, init?: RequestInit): Promise<TResponse> => {
    if (!user) throw new Error('User not authenticated.');
    const token = await user.getIdToken();
    const response = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(init?.headers || {}),
      },
    });
    const payload = (await response.json().catch(() => null)) as { error?: string } & TResponse;
    if (!response.ok) throw new Error(payload?.error || 'Request failed.');
    return payload as TResponse;
  };

  const refreshThreads = async () => {
    if (!currentWorkspaceId || !user || socialAccounts.length === 0) {
      setThreads([]);
      setSelectedThreadId(undefined);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const payload = await fetchWithAuth<{ threads: InboxThread[] }>(
        `/api/inbox/threads?workspaceId=${encodeURIComponent(currentWorkspaceId)}`
      );
      setThreads(payload.threads);
      const preferred =
        initialThreadId && payload.threads.some((thread) => thread.id === initialThreadId)
          ? initialThreadId
          : payload.threads[0]?.id;
      setSelectedThreadId(preferred);
      if (isMobile && initialThreadId && preferred) {
        setIsMobileThreadOpen(true);
      }
    } catch (error) {
      setThreads([]);
      setSelectedThreadId(undefined);
      setIsMobileThreadOpen(false);
      toast({
        title: 'Inbox load failed',
        description: error instanceof Error ? error.message : 'Unable to fetch inbox threads.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshThreads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWorkspaceId, user, initialThreadId, socialAccounts.length, isMobile]);

  useEffect(() => {
    if (isMobile && initialThreadId) {
      setIsMobileThreadOpen(true);
      setSelectedThreadId(initialThreadId);
    }
  }, [isMobile, initialThreadId]);

  const filteredThreads = useMemo(() => {
    return threads.filter((thread) => {
      const searchMatch =
        thread.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        thread.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()) ||
        thread.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const statusMatch = statusFilter === 'all' || thread.status === statusFilter;
      return searchMatch && statusMatch;
    });
  }, [threads, searchTerm, statusFilter]);

  useEffect(() => {
    if (!selectedThreadId && filteredThreads.length > 0) {
      setSelectedThreadId(filteredThreads[0].id);
      return;
    }
    if (selectedThreadId && !filteredThreads.some((thread) => thread.id === selectedThreadId)) {
      setSelectedThreadId(filteredThreads[0]?.id);
      if (isMobile && !filteredThreads[0]?.id) {
        setIsMobileThreadOpen(false);
      }
    }
  }, [filteredThreads, selectedThreadId, isMobile]);

  useEffect(() => {
    if (!pathname) return;
    const currentThreadParam = searchParams?.get('thread') ?? undefined;
    if (currentThreadParam === selectedThreadId) return;

    const nextParams = new URLSearchParams(searchParams?.toString() ?? '');
    if (selectedThreadId) {
      nextParams.set('thread', selectedThreadId);
    } else {
      nextParams.delete('thread');
    }

    const nextQuery = nextParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }, [pathname, router, searchParams, selectedThreadId]);

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.id === selectedThreadId) ?? null,
    [threads, selectedThreadId]
  );

  const updateThreadLocal = (threadId: string, updater: (current: InboxThread) => InboxThread) => {
    setThreads((prev) => prev.map((thread) => (thread.id === threadId ? updater(thread) : thread)));
  };

  const replaceThread = (thread: InboxThread) => {
    setThreads((prev) => prev.map((existing) => (existing.id === thread.id ? thread : existing)));
  };

  const updateThreadRemote = async (
    threadId: string,
    body: Partial<Pick<InboxThread, 'status' | 'assignee' | 'tags' | 'read'>>
  ) => {
    if (!currentWorkspaceId) return;
    const payload = await fetchWithAuth<{ thread: InboxThread }>('/api/inbox/threads', {
      method: 'PATCH',
      body: JSON.stringify({
        workspaceId: currentWorkspaceId,
        threadId,
        ...body,
      }),
    });
    replaceThread(payload.thread);
  };

  const handleSelectThread = (thread: InboxThread) => {
    setSelectedThreadId(thread.id);
    if (isMobile) {
      setIsMobileThreadOpen(true);
    }
    updateThreadLocal(thread.id, (current) => ({ ...current, read: true }));
    void updateThreadRemote(thread.id, { read: true });
  };

  const handleStatusChange = async (status: InboxThreadStatus) => {
    if (!selectedThread) return;
    updateThreadLocal(selectedThread.id, (current) => ({ ...current, status }));
    try {
      await updateThreadRemote(selectedThread.id, { status });
      toast({ title: `Thread marked as ${status}` });
    } catch (error) {
      toast({
        title: 'Thread update failed',
        description: error instanceof Error ? error.message : 'Unable to update status.',
        variant: 'destructive',
      });
      await refreshThreads();
    }
  };

  const handleAssigneeChange = async (assignee: string) => {
    if (!selectedThread) return;
    updateThreadLocal(selectedThread.id, (current) => ({ ...current, assignee }));
    try {
      await updateThreadRemote(selectedThread.id, { assignee });
    } catch (error) {
      toast({
        title: 'Assignment failed',
        description: error instanceof Error ? error.message : 'Unable to update assignee.',
        variant: 'destructive',
      });
      await refreshThreads();
    }
  };

  const handleToggleTag = async (tag: string) => {
    if (!selectedThread) return;
    const nextTags = selectedThread.tags.includes(tag)
      ? selectedThread.tags.filter((existing) => existing !== tag)
      : [...selectedThread.tags, tag];

    updateThreadLocal(selectedThread.id, (current) => {
      const localNextTags = current.tags.includes(tag)
        ? current.tags.filter((existing) => existing !== tag)
        : [...current.tags, tag];
      return { ...current, tags: localNextTags };
    });

    try {
      await updateThreadRemote(selectedThread.id, { tags: nextTags });
    } catch (error) {
      toast({
        title: 'Tag update failed',
        description: error instanceof Error ? error.message : 'Unable to update tags.',
        variant: 'destructive',
      });
      await refreshThreads();
    }
  };

  const handleReply = async () => {
    if (!selectedThread || !replyText.trim()) return;
    const outboundMessage: InboxMessage = {
      id: `out_${Date.now()}`,
      text: replyText.trim(),
      direction: 'outbound',
      timestamp: new Date(),
      author: 'You',
    };

    updateThreadLocal(selectedThread.id, (current) => ({
      ...current,
      status: current.status === 'done' ? 'pending' : current.status,
      lastMessage: outboundMessage.text,
      timestamp: outboundMessage.timestamp,
      read: true,
      messages: [...current.messages, outboundMessage],
    }));

    const message = replyText.trim();
    setReplyText('');

    try {
      if (!currentWorkspaceId) throw new Error('No active workspace selected.');
      const payload = await fetchWithAuth<{ thread: InboxThread }>('/api/inbox/reply', {
        method: 'POST',
        body: JSON.stringify({
          workspaceId: currentWorkspaceId,
          threadId: selectedThread.id,
          text: message,
          author: userProfile?.displayName || userProfile?.email || 'You',
        }),
      });
      replaceThread(payload.thread);
      toast({ title: 'Reply sent', description: 'Your message has been delivered to this thread.' });
    } catch (error) {
      toast({
        title: 'Reply failed',
        description: error instanceof Error ? error.message : 'Unable to send reply.',
        variant: 'destructive',
      });
      await refreshThreads();
    }
  };

  const handleSync = async () => {
    if (!currentWorkspaceId) {
      toast({ title: 'No workspace selected', variant: 'destructive' });
      return;
    }

    setIsSyncing(true);
    try {
      await fetchWithAuth<{ upsertedThreads: number }>('/api/inbox/sync', {
        method: 'POST',
        body: JSON.stringify({ workspaceId: currentWorkspaceId }),
      });
      await refreshThreads();
      toast({ title: 'Inbox synced', description: 'Latest thread data loaded for this workspace.' });
    } catch (error) {
      toast({
        title: 'Sync failed',
        description: error instanceof Error ? error.message : 'Unable to sync inbox.',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const showMobileThreadPane = Boolean(isMobile && isMobileThreadOpen && selectedThread);

  if (socialAccounts.length === 0) {
    return (
      <div className="space-y-8 flex h-full flex-col">
        <Card className="flex-shrink-0 border-border/80 bg-card shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-4">
              <MessageCircle className="h-10 w-10 flex-shrink-0 text-primary" />
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="font-headline text-3xl font-bold text-foreground">All-in-Inbox</CardTitle>
                  <Badge variant="secondary">Connector Sync Ready</Badge>
                </div>
                <CardDescription className="mt-1 text-base text-muted-foreground">
                  Connect accounts and run sync to populate workspace threads. Provider webhook ingestion is next.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="flex flex-grow items-center justify-center border-border/70 p-8 text-center shadow-lg">
          <div className="max-w-md text-muted-foreground">
            <InboxIconLucide size={56} className="mx-auto mb-4 opacity-70" />
            <h3 className="text-xl font-semibold text-foreground">No social channels connected</h3>
            <p className="mt-2 text-sm">
              Connect your social accounts in settings to unify DMs and comments in one inbox workflow.
            </p>
            <Button asChild className="mt-4 bg-primary">
              <Link href="/app/settings">
                <LinkIcon className="mr-2 h-4 w-4" /> Connect Channels
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 flex h-full flex-col">
      <Card className="flex-shrink-0 border-border/80 bg-card shadow-lg">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-4">
              <MessageCircle className="h-10 w-10 flex-shrink-0 text-primary" />
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="font-headline text-3xl font-bold text-foreground">Unified Engagement Inbox</CardTitle>
                  <Badge variant="secondary">Phase 2 Connector Sync</Badge>
                </div>
                <CardDescription className="mt-1 text-base text-muted-foreground">
                  Workspace-backed thread state with assignment and reply tracking.
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleSync} disabled={isSyncing}>
              {isSyncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Sync Inbox
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card className="flex min-h-[620px] flex-grow flex-col overflow-hidden border-border/70 shadow-lg md:flex-row">
        <div className={`w-full border-r border-border/70 md:w-2/5 lg:w-1/3 ${showMobileThreadPane ? 'hidden md:block' : ''}`}>
          {isLoading ? (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
              <p className="text-lg">Fetching threads...</p>
            </div>
          ) : filteredThreads.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No messages match the current filters.</div>
          ) : (
            <InboxThreadList
              threads={filteredThreads}
              selectedThreadId={selectedThreadId}
              onSelectThread={handleSelectThread}
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
            />
          )}
        </div>
        <div className={`${showMobileThreadPane ? 'flex' : 'hidden md:flex'} w-full md:w-3/5 lg:w-2/3`}>
          <InboxThreadView
            thread={selectedThread}
            replyText={replyText}
            savedReplies={SAVED_REPLIES}
            onReplyTextChange={setReplyText}
            onReplySubmit={() => {
              void handleReply();
            }}
            onUseSavedReply={setReplyText}
            onStatusChange={(value) => {
              void handleStatusChange(value);
            }}
            onAssigneeChange={(value) => {
              void handleAssigneeChange(value);
            }}
            onToggleTag={(value) => {
              void handleToggleTag(value);
            }}
            onBack={isMobile ? () => setIsMobileThreadOpen(false) : undefined}
          />
        </div>
      </Card>
    </div>
  );
};
