// src/components/admin/AdminDashboard.tsx
"use client";

import { useState } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Briefcase, ExternalLink, Loader2, AlertTriangle, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ClientFormattedDate } from '@/components/utils/ClientFormattedDate';
import { useRouter } from 'next/navigation'; 
import { WorkspaceCreatorModal } from '@/components/modals/WorkspaceCreatorModal';
import { AiWorkspaceGeneratorModal } from '@/components/modals/AiWorkspaceGeneratorModal'; 

export const AdminDashboard = () => {
  const { user, isLoadingAuth } = useAuth();
  const { workspaces, isLoadingWorkspaces, deleteWorkspace, setCurrentWorkspaceId } = useWorkspace();
  const { toast } = useToast();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false);
  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState(false);

  const handleDeleteWorkspace = async (workspaceId: string, workspaceName: string) => {
    if (!user) {
      toast({ title: "Authentication Error", description: "You must be logged in to delete workspaces.", variant: "destructive" });
      return;
    }
    const confirmed = confirm(`Are you sure you want to delete "${workspaceName}"? This will delete all associated content and cannot be undone.`);
    if (!confirmed) return;

    setIsDeleting(workspaceId);
    try {
      await deleteWorkspace(workspaceId);
      toast({
        title: "Workspace Deleted",
        description: `Workspace "${workspaceName}" has been successfully deleted.`,
      });
    } catch (error: any) {
      toast({
        title: "Deletion Failed",
        description: error.message || "Could not delete the workspace.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleNavigateToWorkspace = (workspaceId: string) => {
    setCurrentWorkspaceId(workspaceId);
    router.push(`/app/workspace/${workspaceId}`); 
  };
  
  if (isLoadingAuth || isLoadingWorkspaces) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading workspaces...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-0 py-0 space-y-8">
      <Card className="bg-card shadow-lg border-border/80">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
                <Briefcase className="w-10 h-10 text-primary" />
                <div>
                    <CardTitle className="text-3xl font-bold text-foreground font-headline">Manage Workspaces</CardTitle>
                    <CardDescription className="text-base text-muted-foreground mt-1">Create, view, or delete your content workspaces.</CardDescription>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button 
                onClick={() => setIsCreatorModalOpen(true)}
                size="lg" 
                variant="outline"
                className="font-bold shadow-md hover:shadow-lg transition-shadow"
              >
                <Plus size={20} className="mr-2" /> Create Manually
              </Button>
              <Button 
                onClick={() => setIsAiGeneratorOpen(true)} 
                size="lg" 
                className="font-bold shadow-md hover:shadow-lg transition-shadow bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Sparkles size={20} className="mr-2" /> Create with AI
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="shadow-lg border-border/80">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-card-foreground">Workspace List</CardTitle>
          <CardDescription>Select a workspace to manage its content or create a new one.</CardDescription>
        </CardHeader>
        <CardContent>
          {workspaces.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px] sm:w-auto">Name</TableHead>
                    <TableHead className="hidden md:table-cell">Description</TableHead>
                    <TableHead className="hidden sm:table-cell text-center">Items</TableHead>
                    <TableHead className="hidden lg:table-cell">Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workspaces.map((ws) => (
                    <TableRow key={ws.id} className="hover:bg-muted/50">
                      <TableCell className="font-semibold text-card-foreground">{ws.name}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground truncate max-w-xs">{ws.description || "N/A"}</TableCell>
                      <TableCell className="hidden sm:table-cell text-center font-medium">{ws.contentCount || 0}</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">
                          <ClientFormattedDate date={ws.createdAt} options={{ year: 'numeric', month: 'short', day: 'numeric' }} />
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleNavigateToWorkspace(ws.id)} aria-label={`Open workspace ${ws.name}`} className="hover:border-primary hover:text-primary">
                          <ExternalLink size={14} className="mr-1 md:mr-2" />
                          <span className="hidden md:inline">Open</span>
                        </Button>
                         <Button variant="destructive" size="sm" disabled={isDeleting === ws.id} onClick={() => handleDeleteWorkspace(ws.id, ws.name)} aria-label={`Delete workspace ${ws.name}`}>
                            {isDeleting === ws.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                            <span className="ml-1 hidden md:inline">Delete</span>
                         </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-border/70 rounded-xl bg-card/50">
              <Briefcase size={56} className="mx-auto text-muted-foreground opacity-70" />
              <h3 className="mt-6 text-2xl font-semibold font-headline text-card-foreground">No workspaces found.</h3>
              <p className="mt-2 text-muted-foreground font-body">Get started by creating your first workspace.</p>
              <Button onClick={() => setIsAiGeneratorOpen(true)} className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground">
                <Sparkles size={18} className="mr-2" /> Create with AI
              </Button>
            </div>
          )}
        </CardContent>
         {workspaces.length > 0 && (
            <CardFooter className="text-xs text-muted-foreground border-t pt-4">
                Showing {workspaces.length} workspace{workspaces.length === 1 ? '' : 's'}.
            </CardFooter>
        )}
      </Card>
      
      <WorkspaceCreatorModal
        isOpen={isCreatorModalOpen}
        onClose={() => setIsCreatorModalOpen(false)}
        onWorkspaceCreated={(id) => {
          setIsCreatorModalOpen(false); 
          if (id) handleNavigateToWorkspace(id);
        }}
      />
      <AiWorkspaceGeneratorModal
        isOpen={isAiGeneratorOpen}
        onClose={() => setIsAiGeneratorOpen(false)}
        onWorkspaceCreated={(id) => {
          setIsAiGeneratorOpen(false);
          if (id) handleNavigateToWorkspace(id);
        }}
      />
    </div>
  );
};
