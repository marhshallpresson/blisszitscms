
"use client";

import { useState } from 'react';
import { useWorkspace, type Workspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Briefcase, ExternalLink, Loader2, Edit, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ClientFormattedDate } from '@/components/utils/ClientFormattedDate';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AdminDashboardProps {
  onNavigateToWorkspace: (workspaceId: string) => void;
  onCreateWorkspace: () => void;
}

export const AdminDashboard = ({ onNavigateToWorkspace, onCreateWorkspace }: AdminDashboardProps) => {
  const { user } = useAuth();
  const { workspaces, isLoadingWorkspaces, deleteWorkspace: contextDeleteWorkspace } = useWorkspace();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDeleteWorkspace = async (workspaceId: string, workspaceName: string) => {
    setIsDeleting(workspaceId);
    try {
      await contextDeleteWorkspace(workspaceId);
      toast({
        title: "Workspace Deleted",
        description: `Workspace "${workspaceName}" and its content have been deleted.`,
      });
    } catch (error: any) {
      console.error("Error deleting workspace:", error);
      toast({
        title: "Deletion Failed",
        description: error.message || "Could not delete the workspace.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  if (!user) {
    return (
      <div className="p-4 md:p-8 text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Authenticating user...</p>
      </div>
    );
  }


  return (
    <div className="space-y-8">
      <Card className="bg-card shadow-xl border-border/80">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
                <Briefcase className="w-10 h-10 text-primary" />
                <div>
                    <CardTitle className="text-3xl font-bold text-foreground font-headline">Manage Workspaces</CardTitle>
                    <CardDescription className="text-base text-muted-foreground mt-1">Oversee, create, or remove content workspaces.</CardDescription>
                </div>
            </div>
            <Button onClick={onCreateWorkspace} size="lg" className="font-bold shadow-md hover:shadow-lg transition-shadow">
              <Plus size={22} className="mr-2" /> Create New Workspace
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card className="shadow-lg border-border/80">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-card-foreground">Your Workspaces</CardTitle>
          <CardDescription>View, open, or delete existing workspaces.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingWorkspaces ? (
            <div className="flex flex-col items-center justify-center h-60 text-muted-foreground">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg">Loading your workspaces...</p>
            </div>
          ) : workspaces.length > 0 ? (
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
                          <ClientFormattedDate date={ws.createdAt as Date} options={{ year: 'numeric', month: 'short', day: 'numeric' }} />
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => onNavigateToWorkspace(ws.id)} aria-label={`Open workspace ${ws.name}`} className="hover:border-primary hover:text-primary">
                          <ExternalLink size={14} className="mr-1 md:mr-2" />
                          <span className="hidden md:inline">Open</span>
                        </Button>
                        <Button variant="outline" size="sm" disabled /*onClick={() => alert("Edit functionality coming soon!")}*/ aria-label={`Edit workspace ${ws.name}`} className="hover:border-primary hover:text-primary">
                          <Edit size={14} className="mr-1 md:mr-2" />
                           <span className="hidden md:inline">Edit</span>
                        </Button>
                         <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" disabled={isDeleting === ws.id} aria-label={`Delete workspace ${ws.name}`}>
                              {isDeleting === ws.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                               <span className="ml-1 hidden md:inline">Delete</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the workspace
                                <span className="font-semibold"> "{ws.name}"</span> and all of its content, including ideas and comments.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel disabled={!!isDeleting}>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteWorkspace(ws.id, ws.name)}
                                disabled={!!isDeleting}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                {isDeleting === ws.id ? 'Deleting...' : 'Yes, delete it'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-border/70 rounded-xl bg-card/50">
              <Settings size={56} className="mx-auto text-muted-foreground opacity-70" />
              <h3 className="mt-6 text-2xl font-semibold font-headline text-card-foreground">No workspaces found.</h3>
              <p className="mt-2 text-muted-foreground font-body">Get started by creating your first content workspace.</p>
            </div>
          )}
        </CardContent>
         {workspaces.length > 0 && (
            <CardFooter className="text-xs text-muted-foreground border-t pt-4">
                Showing {workspaces.length} workspace{workspaces.length === 1 ? '' : 's'}.
            </CardFooter>
        )}
      </Card>
    </div>
  );
};
