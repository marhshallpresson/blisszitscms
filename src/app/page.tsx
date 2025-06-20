
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace, ContentItem } from '@/contexts/WorkspaceContext';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { WelcomeDashboard } from '@/components/dashboard/WelcomeDashboard';
import { ContentDashboard } from '@/components/content/ContentDashboard';
import { WorkspaceCreatorModal } from '@/components/modals/WorkspaceCreatorModal';
import { ReminderSetupModal } from '@/components/modals/ReminderSetupModal';
import { ContentFormModal } from '@/components/modals/ContentFormModal';
import { AppLogo } from '@/components/layout/AppLogo';

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
import { LayoutDashboard, Bell, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AppPage() {
  const { user, isAuthReady, isLoading: isAuthLoading, signOut } = useAuth();
  const { currentWorkspace, currentWorkspaceId, setCurrentWorkspaceId, isLoadingWorkspaces } = useWorkspace();

  const [isCreatingWorkspace, setCreatingWorkspace] = useState(false);
  const [isSettingReminders, setSettingReminders] = useState(false);
  const [editingContentItem, setEditingContentItem] = useState<ContentItem | null>(null); // null for new, object for edit
  const [isContentFormModalOpen, setIsContentFormModalOpen] = useState(false);
  
  // This state ensures sidebar re-renders correctly on mobile when collapsing/expanding
  const [sidebarKey, setSidebarKey] = useState(0);
  useEffect(() => {
    const handleResize = () => setSidebarKey(prev => prev + 1);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const handleSignOut = async () => {
    await signOut();
    setCurrentWorkspaceId(null);
  };

  const openNewContentModal = () => {
    setEditingContentItem(null);
    setIsContentFormModalOpen(true);
  };

  const openEditContentModal = (item: ContentItem) => {
    setEditingContentItem(item);
    setIsContentFormModalOpen(true);
  };

  if (!isAuthReady || isAuthLoading) {
    return <AuthScreen />;
  }

  return (
    <SidebarProvider key={sidebarKey} defaultOpen={true}>
      <Sidebar side="left" variant="sidebar" collapsible="icon" className="border-r">
        <SidebarHeader className="p-4">
          <div className="flex items-center justify-between">
             <AppLogo showName={true} />
             <div className="md:hidden"> {/* Only show trigger on mobile when sidebar is collapsible */}
                <SidebarTrigger />
             </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setCurrentWorkspaceId(null)}
                isActive={!currentWorkspaceId}
                tooltip="Dashboard"
              >
                <LayoutDashboard />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setSettingReminders(true)} tooltip="Reminders">
                <Bell />
                <span>Reminders</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
             {/* Placeholder for workspace list if needed in sidebar */}
            {(isLoadingWorkspaces && !currentWorkspaceId) && (
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
        <header className="p-4 border-b md:hidden sticky top-0 bg-background z-10"> {/* Mobile header with trigger */}
            <div className="flex items-center justify-between">
                <AppLogo showName={false}/>
                <SidebarTrigger />
            </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          {currentWorkspace ? (
            <ContentDashboard
              workspace={currentWorkspace}
              onBack={() => setCurrentWorkspaceId(null)}
              onNewContent={openNewContentModal}
              onEditContent={openEditContentModal}
            />
          ) : (
            <WelcomeDashboard
              onSelectWorkspace={setCurrentWorkspaceId}
              onNewWorkspace={() => setCreatingWorkspace(true)}
            />
          )}
        </main>
      </SidebarInset>

      <WorkspaceCreatorModal isOpen={isCreatingWorkspace} onClose={() => setCreatingWorkspace(false)} />
      <ReminderSetupModal isOpen={isSettingReminders} onClose={() => setSettingReminders(false)} />
      <ContentFormModal 
        isOpen={isContentFormModalOpen} 
        onClose={() => setIsContentFormModalOpen(false)} 
        item={editingContentItem} 
      />
    </SidebarProvider>
  );
}
