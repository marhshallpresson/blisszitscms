
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace, type ContentItem, type Workspace } from '@/contexts/WorkspaceContext'; // Ensure ContentItem type is imported
import { AuthScreen } from '@/components/auth/AuthScreen';
import { WelcomeDashboard } from '@/components/dashboard/WelcomeDashboard';
import { ContentDashboard } from '@/components/content/ContentDashboard';
import { ProfileDashboard } from '@/components/profile/ProfileDashboard';
import { WorkspaceCreatorModal } from '@/components/modals/WorkspaceCreatorModal';
import { ReminderSetupModal } from '@/components/modals/ReminderSetupModal';
import { ContentFormModal } from '@/components/modals/ContentFormModal';
import { SelectWorkspaceForImportModal } from '@/components/modals/SelectWorkspaceForImportModal'; // New Modal
import { AppLogo } from '@/components/layout/AppLogo';
import { useToast } from '@/hooks/use-toast';

import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSkeleton,
} from '@/components/ui/sidebar';
import { LayoutDashboard, Bell, LogOut, Sparkles, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AppPage() {
  const { user, isAuthReady, isLoading: isAuthLoading, signOut } = useAuth();
  const { workspaces, currentWorkspace, currentWorkspaceId, setCurrentWorkspaceId, isLoadingWorkspaces } = useWorkspace();
  const { toast } = useToast();

  const [isCreatingWorkspace, setCreatingWorkspace] = useState(false);
  const [isSettingReminders, setSettingReminders] = useState(false);
  const [editingContentItem, setEditingContentItem] = useState<ContentItem | null>(null);
  const [isContentFormModalOpen, setIsContentFormModalOpen] = useState(false);
  const [showingProfileSettings, setShowingProfileSettings] = useState(false);
  
  const [sidebarKey, setSidebarKey] = useState(0);

  // State for AI import flow when no workspace is active
  const [isSelectWorkspaceModalOpen, setIsSelectWorkspaceModalOpen] = useState(false);
  const [pendingAiImportData, setPendingAiImportData] = useState<{ title: string, description: string } | null>(null);


  useEffect(() => {
    const handleResize = () => setSidebarKey(prev => prev + 1);
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setCurrentWorkspaceId(null);
    setShowingProfileSettings(false);
  };

  const openNewContentModal = () => {
    setEditingContentItem(null);
    setIsContentFormModalOpen(true);
  };

  const openEditContentModal = (item: ContentItem) => {
    setEditingContentItem(item);
    setIsContentFormModalOpen(true);
  };

  const handleImportAiRecommendation = (title: string, description: string) => {
    if (currentWorkspaceId) { // If a workspace is already active
      setEditingContentItem({
        id: '', 
        title: title,
        idea: description,
        script: '',
        dueDate: '', 
        status: 'Draft', 
      } as ContentItem); // Cast to ContentItem for type consistency
      setIsContentFormModalOpen(true);
    } else { // No active workspace, user is on WelcomeDashboard
      if (!workspaces || workspaces.length === 0) {
          toast({
              title: "No Workspace Found",
              description: "Please create a workspace first before importing an AI idea.",
              variant: "destructive",
          });
          setCreatingWorkspace(true); // Open workspace creator
          return;
      }
      setPendingAiImportData({ title, description });
      setIsSelectWorkspaceModalOpen(true);
    }
  };

  const handleWorkspaceSelectedForImport = (workspaceId: string) => {
    setCurrentWorkspaceId(workspaceId); // Set this as the active workspace context
    setIsSelectWorkspaceModalOpen(false);
    if (pendingAiImportData) {
      setEditingContentItem({
        id: '',
        title: pendingAiImportData.title,
        idea: pendingAiImportData.description,
        script: '',
        dueDate: '',
        status: 'Draft',
      } as ContentItem); // Cast to ContentItem
      setIsContentFormModalOpen(true);
      setPendingAiImportData(null); // Clear pending data
    }
  };

  const handleOpenCreateWorkspaceModalFromSelect = () => {
    setIsSelectWorkspaceModalOpen(false); // Close the selection modal
    setCreatingWorkspace(true); // Open the workspace creator modal
  };


  const handleNavigateToDashboard = () => {
    setCurrentWorkspaceId(null);
    setShowingProfileSettings(false);
  };

  const handleNavigateToProfile = () => {
    setShowingProfileSettings(true);
    setCurrentWorkspaceId(null); // Ensure workspace view is hidden
  };

  if (!isAuthReady || isAuthLoading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-background p-8 text-center antialiased">
        <Sparkles className="text-primary w-24 h-24 mb-6 animate-pulse" />
        <h1 className="text-5xl font-bold text-foreground font-headline">Blisszits</h1>
        <p className="text-xl text-muted-foreground mt-4 font-body antialiased">Loading your AI content buddy...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />; 
  }

  return (
    <SidebarProvider key={sidebarKey} defaultOpen={true}>
      <Sidebar side="left" variant="sidebar" collapsible="icon" className="border-r">
        <SidebarHeader className="p-4">
          <div className="flex items-center justify-between">
             <AppLogo showName={true} />
             <div className="md:hidden">
                <SidebarTrigger />
             </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleNavigateToDashboard}
                isActive={!currentWorkspaceId && !showingProfileSettings}
                tooltip="Dashboard"
              >
                <LayoutDashboard />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={handleNavigateToProfile} 
                isActive={showingProfileSettings}
                tooltip="Profile Settings"
              >
                <UserCircle />
                <span>Profile</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setSettingReminders(true)} tooltip="Reminders">
                <Bell />
                <span>Reminders</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {(isLoadingWorkspaces && !currentWorkspaceId && !showingProfileSettings) && (
              <>
                <SidebarMenuSkeleton showIcon />
                <SidebarMenuSkeleton showIcon />
              </>
            )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleSignOut} tooltip="Sign Out">
                <LogOut />
                <span>Sign Out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex flex-col min-h-screen">
        <header className="p-4 border-b md:hidden sticky top-0 bg-background z-10">
            <div className="flex items-center justify-between">
                <AppLogo showName={false}/>
                <SidebarTrigger />
            </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          {showingProfileSettings ? (
            <ProfileDashboard onBack={handleNavigateToDashboard} />
          ) : currentWorkspace ? (
            <ContentDashboard
              workspace={currentWorkspace}
              onBack={handleNavigateToDashboard}
              onNewContent={openNewContentModal}
              onEditContent={openEditContentModal}
            />
          ) : (
            <WelcomeDashboard
              onSelectWorkspace={(id) => { setCurrentWorkspaceId(id); setShowingProfileSettings(false); }}
              onNewWorkspace={() => setCreatingWorkspace(true)}
              onImportAiRecommendation={handleImportAiRecommendation}
            />
          )}
        </main>
      </SidebarInset>

      <WorkspaceCreatorModal 
        isOpen={isCreatingWorkspace} 
        onClose={() => setCreatingWorkspace(false)} 
      />
      <ReminderSetupModal isOpen={isSettingReminders} onClose={() => setSettingReminders(false)} />
      <ContentFormModal 
        isOpen={isContentFormModalOpen} 
        onClose={() => setIsContentFormModalOpen(false)} 
        item={editingContentItem} 
      />
      <SelectWorkspaceForImportModal
        isOpen={isSelectWorkspaceModalOpen}
        onClose={() => {
          setIsSelectWorkspaceModalOpen(false);
          setPendingAiImportData(null); // Clear pending data if modal is closed without selection
        }}
        workspaces={workspaces || []}
        onSelectWorkspace={handleWorkspaceSelectedForImport}
        onOpenCreateWorkspace={handleOpenCreateWorkspaceModalFromSelect}
      />
    </SidebarProvider>
  );
}
