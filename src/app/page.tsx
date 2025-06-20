
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace, type ContentItem, type Workspace } from '@/contexts/WorkspaceContext';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { WelcomeDashboard } from '@/components/dashboard/WelcomeDashboard';
import { WorkspaceViewWrapper } from '@/components/workspace/WorkspaceViewWrapper'; // Changed
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
import { LayoutDashboard, LogOut, Sparkles, UserCircle, Briefcase, BarChart2, MessageSquare, Shield, ArrowLeft } from 'lucide-react';


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
    if (currentWorkspaceId && activeView !== 'profile' && activeView !== 'manageWorkspaces' && activeView !== 'analytics' && activeView !== 'inbox') {
      setActiveView('workspace'); // Changed from 'content'
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
    setActiveView('workspace'); // Changed from 'content'
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
    if (workspaceId !== undefined) { // if workspaceId is explicitly passed
        setCurrentWorkspaceId(workspaceId);
        if(workspaceId) setActiveView('workspace'); // If workspaceId is truthy, go to workspace view
        else if(view !== 'workspace') setActiveView(view); // If workspaceId is null, set to passed view unless it's 'workspace'
        else setActiveView('welcome'); // Fallback to welcome if navigating to workspace with null id
    } else { // if workspaceId is not passed, just set the view
        setActiveView(view);
        if (view !== 'workspace' && view !== 'profile' && view !== 'manageWorkspaces' && view !== 'analytics' && view !== 'inbox') {
           // If navigating away from a specific workspace or specific non-workspace views, clear currentWorkspaceId
           // This logic might need refinement based on desired behavior for all views
           if(activeView === 'workspace') setCurrentWorkspaceId(null);
        }
    }
  };
  
  const handleOpenOnboardingModal = () => {
    setIsOnboardingModalOpen(true);
  };

  const handleSaveUserInterests = (interests: string[]) => {
    setUserInterests(interests);
    setIsOnboardingCompleted(true); 
    setIsOnboardingModalOpen(false);
    toast({
      title: "Interests Saved!",
      description: "Your content preferences have been updated.",
    });
    
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

  const sidebarProviderKey = `${resizeKey}-${isAuthReady}-${isAuthLoading}-${user?.uid || 'no-user'}-${currentWorkspaceId || 'no-workspace'}`;

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
            {currentWorkspaceId && (
                 <SidebarMenuItem>
                    <SidebarMenuButton
                        onClick={() => navigateTo('welcome', null)} 
                        isActive={false} 
                        tooltip="Back to Main Dashboard"
                        className="font-semibold text-primary"
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
                onClick={() => navigateTo('manageWorkspaces', null)} 
                isActive={activeView === 'manageWorkspaces'}
                tooltip="Manage Workspaces"
              >
                <Briefcase /> {/* Changed icon from Shield */}
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
          {activeView === 'manageWorkspaces' && <AdminDashboard onNavigateToWorkspace={(id) => navigateTo('workspace', id)} onCreateWorkspace={() => setCreatingWorkspace(true)} />}
          {activeView === 'analytics' && <AnalyticsDashboard />}
          {activeView === 'inbox' && <InboxView />}
          {activeView === 'workspace' && currentWorkspace && (
            <WorkspaceViewWrapper // Changed from ContentDashboard
              workspace={currentWorkspace}
              // onBack is handled by sidebar button now
              onNewContent={openNewContentModal}
              onEditContent={openEditContentModal}
              onViewDetails={openDetailsModal}
              onMarkAsPublished={openMarkAsPublishedModal}
            />
          )}
          {activeView === 'welcome' && (
            <WelcomeDashboard
              onSelectWorkspace={(id) => navigateTo('workspace', id)} // Changed to 'workspace'
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
            setActiveView('workspace'); // Changed to 'workspace'
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
