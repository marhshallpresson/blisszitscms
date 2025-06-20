
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace, type ContentItem, type Workspace } from '@/contexts/WorkspaceContext';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { WelcomeDashboard } from '@/components/dashboard/WelcomeDashboard';
import { ContentDashboard } from '@/components/content/ContentDashboard';
import { ProfileDashboard } from '@/components/profile/ProfileDashboard';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { InboxView } from '@/components/inbox/InboxView';
import { WorkspaceCreatorModal } from '@/components/modals/WorkspaceCreatorModal';
import { ContentFormModal } from '@/components/modals/ContentFormModal';
import { ContentDetailsModal } from '@/components/modals/ContentDetailsModal';
import { MarkAsPublishedModal } from '@/components/modals/MarkAsPublishedModal';
import { SelectWorkspaceForImportModal } from '@/components/modals/SelectWorkspaceForImportModal';
import { OnboardingModal } from '@/components/modals/OnboardingModal'; // New Import
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
import { LayoutDashboard, LogOut, Sparkles, UserCircle, Briefcase, BarChart2, MessageSquare, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ActiveView = 'welcome' | 'content' | 'profile' | 'admin' | 'analytics' | 'inbox';


export default function AppPage() {
  const { user, isAuthReady, isLoading: isAuthLoading, signOut } = useAuth();
  const { workspaces, currentWorkspace, currentWorkspaceId, setCurrentWorkspaceId, isLoadingWorkspaces } = useWorkspace();
  const { toast } = useToast();

  const [activeView, setActiveView] = useState<ActiveView>('welcome');
  const [isCreatingWorkspace, setCreatingWorkspace] = useState(false);
  const [editingContentItem, setEditingContentItem] = useState<ContentItem | null>(null);
  const [viewingContentItem, setViewingContentItem] = useState<ContentItem | null>(null);
  const [markingContentItem, setMarkingContentItem] = useState<ContentItem | null>(null);

  const [isContentFormModalOpen, setIsContentFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isMarkAsPublishedModalOpen, setIsMarkAsPublishedModalOpen] = useState(false);
  
  const [resizeKey, setResizeKey] = useState(0); 

  const [isSelectWorkspaceModalOpen, setIsSelectWorkspaceModalOpen] = useState(false);
  const [pendingAiImportData, setPendingAiImportData] = useState<{ title: string, description: string, caption?: string } | null>(null);

  // Onboarding State
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false); // Store this in user profile later
  const [userInterests, setUserInterests] = useState<string[]>([]); // Store this in user profile later


  useEffect(() => {
    const handleResize = () => setResizeKey(prev => prev + 1);
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    if (currentWorkspaceId && activeView !== 'profile' && activeView !== 'admin' && activeView !== 'analytics' && activeView !== 'inbox') {
      setActiveView('content');
    } else if (!currentWorkspaceId && (activeView === 'content')) {
      setActiveView('welcome');
    }
  }, [currentWorkspaceId, activeView]);

  const handleSignOut = async () => {
    await signOut();
    setCurrentWorkspaceId(null);
    setActiveView('welcome'); 
  };

  const openNewContentModal = () => {
    setEditingContentItem(null);
    setIsContentFormModalOpen(true);
  };

  const openEditContentModal = (item: ContentItem) => {
    setEditingContentItem(item);
    setIsContentFormModalOpen(true);
  };

  const openDetailsModal = (item: ContentItem) => {
    setViewingContentItem(item);
    setIsDetailsModalOpen(true);
  };

  const openMarkAsPublishedModal = (item: ContentItem) => {
    setMarkingContentItem(item);
    setIsMarkAsPublishedModalOpen(true);
  }

  const handleImportAiRecommendation = (title: string, description: string, caption?: string) => {
    if (currentWorkspaceId) {
      setEditingContentItem({
        id: '', 
        title: title,
        idea: description,
        caption: caption || '',
        script: '',
        dueDate: '', 
        status: 'Draft', 
      } as ContentItem);
      setIsContentFormModalOpen(true);
    } else {
      if (!workspaces || workspaces.length === 0) {
          toast({
              title: "No Workspace Found",
              description: "Please create a workspace first before importing an AI idea.",
              variant: "destructive",
          });
          setCreatingWorkspace(true); 
          return;
      }
      setPendingAiImportData({ title, description, caption });
      setIsSelectWorkspaceModalOpen(true);
    }
  };

  const handleWorkspaceSelectedForImport = (workspaceId: string) => {
    setCurrentWorkspaceId(workspaceId); 
    setActiveView('content');
    setIsSelectWorkspaceModalOpen(false);
    if (pendingAiImportData) {
      setEditingContentItem({
        id: '',
        title: pendingAiImportData.title,
        idea: pendingAiImportData.description,
        caption: pendingAiImportData.caption || '',
        script: '',
        dueDate: '',
        status: 'Draft',
      } as ContentItem);
      setIsContentFormModalOpen(true);
      setPendingAiImportData(null); 
    }
  };

  const handleOpenCreateWorkspaceModalFromSelect = () => {
    setIsSelectWorkspaceModalOpen(false);
    setCreatingWorkspace(true); 
  };

  const navigateTo = (view: ActiveView, workspaceId?: string | null) => {
    if (workspaceId !== undefined) {
        setCurrentWorkspaceId(workspaceId);
    }
    setActiveView(view);
  };

  // Onboarding Modal Handlers
  const handleOpenOnboardingModal = () => {
    setIsOnboardingModalOpen(true);
  };

  const handleSaveUserInterests = (interests: string[]) => {
    setUserInterests(interests);
    setIsOnboardingCompleted(true); // Mark onboarding as complete
    setIsOnboardingModalOpen(false);
    toast({
      title: "Interests Saved!",
      description: "Your content preferences have been updated.",
    });
    // Future: Save interests to user profile in Firestore/RTDB
    console.log("User interests saved:", interests);
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

  const sidebarProviderKey = `${resizeKey}-${isAuthReady}-${isAuthLoading}-${user?.uid || 'no-user'}`;

  return (
    <SidebarProvider key={sidebarProviderKey} defaultOpen={true}>
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
                onClick={() => navigateTo('welcome', null)}
                isActive={activeView === 'welcome'}
                tooltip="Dashboard"
              >
                <LayoutDashboard />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={() => navigateTo('profile', null)} 
                isActive={activeView === 'profile'}
                tooltip="Profile Settings"
              >
                <UserCircle />
                <span>Profile</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={() => navigateTo('inbox', null)} 
                isActive={activeView === 'inbox'}
                tooltip="Inbox"
              >
                <MessageSquare />
                <span>Inbox</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={() => navigateTo('analytics', null)} 
                isActive={activeView === 'analytics'}
                tooltip="Analytics"
              >
                <BarChart2 />
                <span>Analytics</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={() => navigateTo('admin', null)} 
                isActive={activeView === 'admin'}
                tooltip="Admin Panel"
              >
                <Shield />
                <span>Admin</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            {(isLoadingWorkspaces && activeView === 'welcome') && (
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
          {activeView === 'profile' && <ProfileDashboard onBack={() => navigateTo('welcome', null)} />}
          {activeView === 'admin' && <AdminDashboard onNavigateToWorkspace={(id) => navigateTo('content', id)} onCreateWorkspace={() => setCreatingWorkspace(true)} />}
          {activeView === 'analytics' && <AnalyticsDashboard />}
          {activeView === 'inbox' && <InboxView />}
          {activeView === 'content' && currentWorkspace && (
            <ContentDashboard
              workspace={currentWorkspace}
              onBack={() => navigateTo('welcome', null)}
              onNewContent={openNewContentModal}
              onEditContent={openEditContentModal}
              onViewDetails={openDetailsModal}
              onMarkAsPublished={openMarkAsPublishedModal}
            />
          )}
          {activeView === 'welcome' && (
            <WelcomeDashboard
              onSelectWorkspace={(id) => navigateTo('content', id)}
              onNewWorkspace={() => setCreatingWorkspace(true)}
              onImportAiRecommendation={handleImportAiRecommendation}
              onOpenOnboardingModal={handleOpenOnboardingModal}
              isOnboardingCompleted={isOnboardingCompleted}
            />
          )}
        </main>
      </SidebarInset>

      <WorkspaceCreatorModal 
        isOpen={isCreatingWorkspace} 
        onClose={() => setCreatingWorkspace(false)} 
        onWorkspaceCreated={(newId) => {
            setCurrentWorkspaceId(newId); 
            setActiveView('content');
        }}
      />
      <ContentFormModal 
        isOpen={isContentFormModalOpen} 
        onClose={() => setIsContentFormModalOpen(false)} 
        item={editingContentItem} 
      />
      <ContentDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        item={viewingContentItem}
      />
      <MarkAsPublishedModal
        isOpen={isMarkAsPublishedModalOpen}
        onClose={() => setIsMarkAsPublishedModalOpen(false)}
        item={markingContentItem}
      />
      <SelectWorkspaceForImportModal
        isOpen={isSelectWorkspaceModalOpen}
        onClose={() => {
          setIsSelectWorkspaceModalOpen(false);
          setPendingAiImportData(null); 
        }}
        workspaces={workspaces || []}
        onSelectWorkspace={handleWorkspaceSelectedForImport}
        onOpenCreateWorkspace={handleOpenCreateWorkspaceModalFromSelect}
      />
      <OnboardingModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
        onSaveInterests={handleSaveUserInterests}
      />
    </SidebarProvider>
  );
}
