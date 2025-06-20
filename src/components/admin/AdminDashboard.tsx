// src/components/admin/AdminDashboard.tsx
"use client";

// This component's purpose is shifting from CMS Admin to a simple
// "Workspaces" overview if retained for a client portal, or removed if not needed.
// For a basic corporate site, this might not be used.
// For this step, I'll keep it minimal and focused on listing workspaces (if any).

import { useState } from 'react';
// import { useWorkspace, type Workspace } from '@/contexts/WorkspaceContext'; // WorkspaceContext is simplified
// import { useAuth } from '@/contexts/AuthContext'; // AuthContext is simplified
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Briefcase, ExternalLink, Loader2, Edit, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ClientFormattedDate } from '@/components/utils/ClientFormattedDate';
import Link from 'next/link';

interface AdminDashboardProps {
  // Props related to old CMS functionality
  // onNavigateToWorkspace: (workspaceId: string) => void;
  // onCreateWorkspace: () => void;
}

// Placeholder Workspace type if WorkspaceContext is not used
interface PlaceholderWorkspace {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  contentCount?: number;
}


export const AdminDashboard = ({ /* onNavigateToWorkspace, onCreateWorkspace */ }: AdminDashboardProps) => {
  // const { user } = useAuth();
  // const { workspaces, isLoadingWorkspaces, deleteWorkspace: contextDeleteWorkspace } = useWorkspace();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Mock data for corporate site demo, as WorkspaceContext is not providing this.
  const workspaces: PlaceholderWorkspace[] = [
    {id: '1', name: 'Example Project Alpha', description: 'Social media campaign for Q3 product launch.', createdAt: new Date(2023, 8, 15), contentCount: 25},
    {id: '2', name: 'Client Beta Engagement', description: 'Ongoing content management for Client Beta.', createdAt: new Date(2023, 7, 1), contentCount: 58},
  ];
  const isLoadingWorkspaces = false;
  const user = { uid: 'mock-user-id' }; // Mock user for structure

  const handleDeleteWorkspace = async (workspaceId: string, workspaceName: string) => {
    setIsDeleting(workspaceId);
    console.log("Attempting to delete workspace (corporate site - placeholder):", workspaceId, workspaceName);
    // Placeholder for actual deletion logic if re-enabled
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: "Action (Demo)",
      description: `Workspace "${workspaceName}" deletion is currently disabled.`,
    });
    setIsDeleting(null);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    );
  }


  return (
    <div className="container mx-auto px-4 py-8 md:py-12 space-y-8">
      <Card className="bg-card shadow-xl border-border/80">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
                <Briefcase className="w-10 h-10 text-primary" />
                <div>
                    <CardTitle className="text-3xl font-bold text-foreground font-headline">Client Projects (Demo)</CardTitle>
                    <CardDescription className="text-base text-muted-foreground mt-1">Overview of managed client projects or internal campaigns.</CardDescription>
                </div>
            </div>
            <Button 
              onClick={() => toast({ title: "Action (Demo)", description: "Creating new projects would be part of CMS functionality."})} 
              size="lg" 
              className="font-bold shadow-md hover:shadow-lg transition-shadow bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus size={22} className="mr-2" /> Add New Project (Demo)
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card className="shadow-lg border-border/80">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-card-foreground">Project List</CardTitle>
          <CardDescription>View, open, or manage projects. (This is a placeholder view)</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingWorkspaces ? (
            <div className="flex flex-col items-center justify-center h-60 text-muted-foreground">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg">Loading projects...</p>
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
                          <ClientFormattedDate date={ws.createdAt} options={{ year: 'numeric', month: 'short', day: 'numeric' }} />
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => toast({title: "Action (Demo)", description: "Opening projects would be part of CMS."})} aria-label={`Open project ${ws.name}`} className="hover:border-primary hover:text-primary">
                          <ExternalLink size={14} className="mr-1 md:mr-2" />
                          <span className="hidden md:inline">Open</span>
                        </Button>
                        <Button variant="outline" size="sm" disabled aria-label={`Edit project ${ws.name}`} className="hover:border-primary hover:text-primary">
                          <Edit size={14} className="mr-1 md:mr-2" />
                           <span className="hidden md:inline">Edit</span>
                        </Button>
                         <Button variant="destructive" size="sm" disabled={isDeleting === ws.id} onClick={() => handleDeleteWorkspace(ws.id, ws.name)} aria-label={`Delete project ${ws.name}`}>
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
              <Settings size={56} className="mx-auto text-muted-foreground opacity-70" />
              <h3 className="mt-6 text-2xl font-semibold font-headline text-card-foreground">No projects found.</h3>
              <p className="mt-2 text-muted-foreground font-body">For a live system, projects would be listed here.</p>
            </div>
          )}
        </CardContent>
         {workspaces.length > 0 && (
            <CardFooter className="text-xs text-muted-foreground border-t pt-4">
                Showing {workspaces.length} project{workspaces.length === 1 ? '' : 's'} (demo data).
            </CardFooter>
        )}
      </Card>
    </div>
  );
};
