// src/app/app/workspace/[workspaceId]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useWorkspace, type ContentItem } from '@/contexts/WorkspaceContext';
import { WorkspaceViewWrapper } from '@/components/workspace/WorkspaceViewWrapper';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ContentFormModal } from '@/components/modals/ContentFormModal';
import { ContentDetailsModal } from '@/components/modals/ContentDetailsModal';
import { MarkAsPublishedModal } from '@/components/modals/MarkAsPublishedModal';


export default function WorkspacePage() {
  const { setCurrentWorkspaceId, currentWorkspace, isLoadingWorkspaces } = useWorkspace();
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const [isContentFormModalOpen, setIsContentFormModalOpen] = useState(false);
  const [editingContentItem, setEditingContentItem] = useState<ContentItem | null>(null);
  const [viewingContentItem, setViewingContentItem] = useState<ContentItem | null>(null);
  const [publishingContentItem, setPublishingContentItem] = useState<ContentItem | null>(null);

  useEffect(() => {
    if (workspaceId) {
      setCurrentWorkspaceId(workspaceId);
    }
  }, [workspaceId, setCurrentWorkspaceId]);


  const handleNewContent = () => {
    setEditingContentItem(null);
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
  };


  // AppLayout handles main auth. We just check for workspace data loading.
  if (isLoadingWorkspaces) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full p-4" suppressHydrationWarning>
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading workspace...</p>
      </div>
    );
  }
  
  if (!currentWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full p-6 text-center" suppressHydrationWarning>
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold text-destructive mb-2">Workspace Not Found</h2>
        <p className="text-muted-foreground mb-6">The workspace you are looking for does not exist or you may not have access.</p>
        <Button asChild>
          <Link href="/app/admin">Go to Workspaces</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full" suppressHydrationWarning>
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
