
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace, type ContentItem } from '@/contexts/WorkspaceContext';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { WelcomeDashboard } from '@/components/dashboard/WelcomeDashboard';
import { WorkspaceViewWrapper } from '@/components/workspace/WorkspaceViewWrapper';
import { ProfileDashboard } from '@/components/profile/ProfileDashboard';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { InboxView } from '@/components/inbox/InboxView';
import { WorkspaceCreatorModal } from '@/components/modals/WorkspaceCreatorModal';
import { ContentFormModal } from '@/components/modals/ContentFormModal';
import { ContentDetailsModal } from '@/components/modals/ContentDetailsModal';
import { MarkAsPublishedModal } from '@/components/modals/MarkAsPublishedModal';
import { SelectWorkspaceForImportModal } from '@/components/modals/SelectWorkspaceForImportModal';
import { OnboardingModal } from '@/components/modals/OnboardingModal';
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
import { LayoutDashboard, LogOut, UserCircle, Briefcase, BarChart2, MessageSquare, ArrowLeft, Settings, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';


type ActiveView = 'welcome' | 'workspace' | 'profile' | 'manageWorkspaces' | 'analytics' | 'inbox';


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

  
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);
  const [userInterests, setUserInterests] = useState<string[]>([]);


  useEffect(() => {
    const handleResize = () => setResizeKey(prev => prev + 1);
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    if (user && !isOnboardingCompleted) {
        // Simple check: if user has no interests stored (you'd check Firestore in real app)
        // For now, we assume if they load and this flag is false, they need onboarding.
        // This could be refined with a Firestore check for `user.uid` onboarding status
        // setIsOnboardingModalOpen(true); // Temporarily disable auto-popup
    }
  }, [user, isOnboardingCompleted]);

  useEffect(() => {
    if (currentWorkspaceId && activeView !== 'profile' && activeView !== 'manageWorkspaces' && activeView !== 'analytics' && activeView !== 'inbox') {
      setActiveView('workspace');
    } else if (!currentWorkspaceId && (activeView === 'workspace')) {
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
    if (!isOnboardingCompleted) {
      toast({
        title: "Let's Personalize!",
        description: "Please complete the quick onboarding to get AI ideas tailored for you.",
      });
      handleOpenOnboardingModal();
      return;
    }
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
    setActiveView('workspace');
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
        if(workspaceId) setActiveView('workspace');
        else if(view !== 'workspace') setActiveView(view);
        else setActiveView('welcome');
    } else {
        setActiveView(view);
        if (view !== 'workspace' && view !== 'profile' && view !== 'manageWorkspaces' && view !== 'analytics' && view !== 'inbox') {
           if(activeView === 'workspace') setCurrentWorkspaceId(null);
        }
    }
  };
  
  const handleOpenOnboardingModal = () => {
    setIsOnboardingModalOpen(true);
  };

  const handleSaveUserInterests = (interests: string[]) => {
    setUserInterests(interests); // In a real app, save this to Firestore user profile
    setIsOnboardingCompleted(true);
    setIsOnboardingModalOpen(false);
    toast({
      title: "Preferences Saved!",
      description: "Your content preferences have been updated. You can now get AI ideas!",
    });
    console.log("User interests saved:", interests);
  };


  if (!isAuthReady || isAuthLoading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-background p-8 text-center antialiased">
        <AppLogo iconSize={60} showName={false} className="mb-6"/>
        <h1 className="text-5xl font-bold text-foreground font-headline">Blisszits</h1>
        <p className="text-xl text-muted-foreground mt-4 font-body antialiased">Loading your AI content buddy...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  const sidebarProviderKey = `${resizeKey}-${isAuthReady}-${isAuthLoading}-${user?.uid || 'no-user'}-${currentWorkspaceId || 'no-workspace'}`;

  return (
    <SidebarProvider key={sidebarProviderKey} defaultOpen={true}>
      <Sidebar side="left" variant="sidebar" collapsible="icon" className="border-r bg-sidebar text-sidebar-foreground">
        <SidebarHeader className="p-4">
          <div className="flex items-center justify-between">
             <AppLogo showName={true} iconSize={32} />
             <div className="md:hidden">
                <SidebarTrigger className="text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent" />
             </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {currentWorkspaceId && (
                 <SidebarMenuItem>
                    <SidebarMenuButton
                        onClick={() => navigateTo('welcome', null)}
                        isActive={false}
                        tooltip="Back to Main Dashboard"
                        className="font-semibold text-sidebar-primary hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                        <ArrowLeft />
                        <span>Back to Main Dashboard</span>
                    </SidebarMenuButton>
                 </SidebarMenuItem>
            )}
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => navigateTo('welcome', null)}
                isActive={activeView === 'welcome' && !currentWorkspaceId}
                tooltip="Dashboard"
                className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
                className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
                className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
                className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <BarChart2 />
                <span>Analytics</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => navigateTo('manageWorkspaces', null)}
                isActive={activeView === 'manageWorkspaces'}
                tooltip="Manage Workspaces"
                className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <Briefcase />
                <span>Manage Workspaces</span>
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
        <SidebarFooter className="p-4 border-t border-sidebar-border">
          <SidebarMenu>
             <SidebarMenuItem>
                <SidebarMenuButton onClick={() => { /* Logic for help/support */ }} tooltip="Help & Support" className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                    <HelpCircle />
                    <span>Help & Support</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton onClick={() => { /* Logic for settings, could be same as profile or different */ navigateTo('profile', null) }} tooltip="App Settings" className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                    <Settings />
                    <span>Settings</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleSignOut} tooltip="Sign Out" className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                <LogOut />
                <span>Sign Out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <Button variant="outline" size="sm" className="w-full mt-4 group-data-[collapsible=icon]:hidden text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" onClick={() => window.open("https://firebase.google.com/products/studio", "_blank")}>
                Powered by Firebase Studio
            </Button>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex flex-col min-h-screen bg-background">
        <header className="p-4 border-b md:hidden sticky top-0 bg-background z-10">
            <div className="flex items-center justify-between">
                <AppLogo showName={false} iconSize={28}/>
                <SidebarTrigger className="text-foreground hover:text-primary hover:bg-muted" />
            </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {activeView === 'profile' && <ProfileDashboard onBack={() => navigateTo('welcome', null)} />}
          {activeView === 'manageWorkspaces' && <AdminDashboard onNavigateToWorkspace={(id) => navigateTo('workspace', id)} onCreateWorkspace={() => setCreatingWorkspace(true)} />}
          {activeView === 'analytics' && <AnalyticsDashboard />}
          {activeView === 'inbox' && <InboxView />}
          {activeView === 'workspace' && currentWorkspace && (
            <WorkspaceViewWrapper
              workspace={currentWorkspace}
              onNewContent={openNewContentModal}
              onEditContent={openEditContentModal}
              onViewDetails={openDetailsModal}
              onMarkAsPublished={openMarkAsPublishedModal}
            />
          )}
          {activeView === 'welcome' && (
            <WelcomeDashboard
              onSelectWorkspace={(id) => navigateTo('workspace', id)}
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
            setActiveView('workspace');
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
