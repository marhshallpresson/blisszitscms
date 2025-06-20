
"use client";

import { useState } from 'react';
import { useWorkspace, type Workspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Briefcase, ExternalLink, Loader2 } from 'lucide-react';
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
    return <p className="p-4">You must be signed in to manage workspaces.</p>;
  }


  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-4xl font-bold text-foreground font-headline">Manage Workspaces</h1>
            <p className="text-lg text-muted-foreground mt-1">Oversee all workspaces, create new ones, or remove existing ones.</p>
        </div>
        <Button onClick={onCreateWorkspace} className="font-bold">
          <Plus size={20} className="mr-2" /> Create New Workspace
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Your Workspaces</CardTitle>
          <CardDescription>View, open, or delete existing workspaces.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingWorkspaces ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : workspaces.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead className="hidden sm:table-cell">Content Items</TableHead>
                  <TableHead className="hidden lg:table-cell">Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workspaces.map((ws) => (
                  <TableRow key={ws.id}>
                    <TableCell className="font-medium">{ws.name}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground truncate max-w-xs">{ws.description || "N/A"}</TableCell>
                    <TableCell className="hidden sm:table-cell text-center">{ws.contentCount || 0}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                        <ClientFormattedDate date={ws.createdAt as Date} />
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => onNavigateToWorkspace(ws.id)} aria-label={`Open workspace ${ws.name}`}>
                        <ExternalLink size={14} className="mr-1 md:mr-2" />
                        <span className="hidden md:inline">Open</span>
                      </Button>
                       <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" disabled={isDeleting === ws.id} aria-label={`Delete workspace ${ws.name}`}>
                            {isDeleting === ws.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={14} />}
                             <span className="ml-1 hidden md:inline">Delete</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the workspace
                              <span className="font-semibold"> "{ws.name}"</span> and all of its content, including comments and ideas.
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
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-lg bg-card">
              <Briefcase size={40} className="mx-auto text-muted-foreground" />
              <h3 className="mt-3 text-lg font-semibold text-card-foreground">No workspaces found.</h3>
              <p className="mt-1 text-sm text-muted-foreground">Create the first workspace to get started.</p>
            </div>
          )}
        </CardContent>
         {workspaces.length > 0 && (
            <CardFooter className="text-xs text-muted-foreground">
                Showing {workspaces.length} workspace(s).
            </CardFooter>
        )}
      </Card>
      
    </div>
  );
};
