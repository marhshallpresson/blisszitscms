
// src/app/(app)/workspace/[workspaceId]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace, type Workspace as WorkspaceType, type ContentItem } from '@/contexts/WorkspaceContext';
import { WorkspaceViewWrapper } from '@/components/workspace/WorkspaceViewWrapper';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ContentFormModal } from '@/components/modals/ContentFormModal';
import { ContentDetailsModal } from '@/components/modals/ContentDetailsModal';
import { MarkAsPublishedModal } from '@/components/modals/MarkAsPublishedModal';


export default function WorkspacePage() {
  const { user, isLoadingAuth, userProfile, isLoadingProfile } = useAuth();
  const { setCurrentWorkspaceId, currentWorkspace, isLoadingWorkspaces } = useWorkspace();
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const [isContentFormModalOpen, setIsContentFormModalOpen] = useState(false);
  const [editingContentItem, setEditingContentItem] = useState<ContentItem | null>(null);
  const [viewingContentItem, setViewingContentItem] = useState<ContentItem | null>(null);
  const [publishingContentItem, setPublishingContentItem] = useState<ContentItem | null>(null);

  useEffect(() => {
    if (!isLoadingAuth && !isLoadingProfile) {
      setAuthCheckComplete(true);
      if (!user) {
        router.replace('/auth?mode=signin');
      } else if (userProfile && !userProfile.onboardingCompleted) {
        router.replace('/onboarding');
      }
    }
  }, [user, userProfile, isLoadingAuth, isLoadingProfile, router]);

  useEffect(() => {
    if (workspaceId) {
      setCurrentWorkspaceId(workspaceId);
    }
    // Cleanup current workspace when component unmounts or workspaceId changes
    // This might be too aggressive if navigating between tabs within the same workspace.
    // Consider if this cleanup is needed or if context should persist.
    // return () => setCurrentWorkspaceId(null); 
  }, [workspaceId, setCurrentWorkspaceId]);


  const handleNewContent = () => {
    setEditingContentItem(null); // Ensure it's a new item
    setIsContentFormModalOpen(true);
  };

  const handleEditContent = (item: ContentItem) => {
    setEditingContentItem(item);
    setIsContentFormModalOpen(true);
  };

  const handleViewDetails = (item: ContentItem) => {
    setViewingContentItem(item);
  };
  
  const handleMarkAsPublished = (item: ContentItem) => {
    setPublishingContentItem(item);
  };

  const closeModalAndRefresh = () => {
    setIsContentFormModalOpen(false);
    setEditingContentItem(null);
    setPublishingContentItem(null);
    // Optionally, trigger a refresh of content items if needed, though context should handle it.
  };


  if (!authCheckComplete || isLoadingAuth || (isLoadingProfile && !userProfile && user) || isLoadingWorkspaces) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading workspace...</p>
      </div>
    );
  }

  if (!user) { // Should be caught by useEffect, but as a fallback
    return (
      <div className="flex flex-col items-center justify-center min-h-full p-4">
        <p className="text-destructive mb-4">Access Denied. Please sign in.</p>
        <Button asChild><Link href="/auth?mode=signin">Go to Sign In</Link></Button>
      </div>
    );
  }

  if (userProfile && !userProfile.onboardingCompleted) { // Should be caught by useEffect
     return (
      <div className="flex flex-col items-center justify-center min-h-full p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Redirecting to onboarding...</p>
      </div>
    );
  }

  if (!currentWorkspace && !isLoadingWorkspaces) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full p-6 text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold text-destructive mb-2">Workspace Not Found</h2>
        <p className="text-muted-foreground mb-6">The workspace you are looking for does not exist or you may not have access.</p>
        <Button asChild>
          <Link href="/app/admin">Go to Workspaces</Link>
        </Button>
      </div>
    );
  }
  
  if (!currentWorkspace) { // Still loading or error after initial checks
     return (
      <div className="flex flex-col items-center justify-center min-h-full p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Accessing workspace data...</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <WorkspaceViewWrapper
        workspace={currentWorkspace}
        onNewContent={handleNewContent}
        onEditContent={handleEditContent}
        onViewDetails={handleViewDetails}
        onMarkAsPublished={handleMarkAsPublished}
      />
      <ContentFormModal
        isOpen={isContentFormModalOpen}
        onClose={closeModalAndRefresh}
        item={editingContentItem}
      />
      <ContentDetailsModal
        isOpen={!!viewingContentItem}
        onClose={() => setViewingContentItem(null)}
        item={viewingContentItem}
      />
      <MarkAsPublishedModal
        isOpen={!!publishingContentItem}
        onClose={closeModalAndRefresh}
        item={publishingContentItem}
      />
    </div>
  );
}
