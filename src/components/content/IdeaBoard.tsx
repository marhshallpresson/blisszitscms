
"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useWorkspace, type Idea, IDEA_BOARD_STATUSES, type IdeaBoardStatus } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Loader2, Lightbulb } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClientFormattedDate } from '@/components/utils/ClientFormattedDate';
import { useToast } from '@/hooks/use-toast';

interface IdeaCardProps {
  idea: Idea;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: IdeaBoardStatus) => void;
  isUpdatingStatus: string | null; // Track which idea status is being updated
}

const IdeaCard = ({ idea, onDelete, onStatusChange, isUpdatingStatus }: IdeaCardProps) => {
  return (
    <Card className="mb-4 shadow-md bg-card hover:shadow-lg transition-shadow">
      <CardContent className="pt-4 pb-3">
        <p className="text-card-foreground text-base mb-3 break-words whitespace-pre-wrap">{idea.text}</p>
         <div className="flex items-center justify-between text-xs text-muted-foreground">
            <ClientFormattedDate date={idea.createdAt as Date} options={{dateStyle:'short', timeStyle:'short'}} />
            <Button variant="ghost" size="icon" onClick={() => onDelete(idea.id)} aria-label="Delete idea" className="h-7 w-7 text-destructive hover:bg-destructive/10">
                <Trash2 size={14} />
            </Button>
         </div>
      </CardContent>
      <CardFooter className="p-3 border-t bg-muted/30">
        <Select 
            value={idea.status} 
            onValueChange={(newStatus) => onStatusChange(idea.id, newStatus as IdeaBoardStatus)}
            disabled={isUpdatingStatus === idea.id}
        >
            <SelectTrigger className="w-full h-8 text-xs bg-background" aria-label={`Change status for idea: ${idea.text}`}>
                {isUpdatingStatus === idea.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <SelectValue placeholder="Set status" />}
            </SelectTrigger>
            <SelectContent>
                {IDEA_BOARD_STATUSES.map(status => (
                <SelectItem key={status} value={status} className="text-xs">{status}</SelectItem>
                ))}
            </SelectContent>
        </Select>
      </CardFooter>
    </Card>
  );
};

export const IdeaBoard = () => {
  const { ideas: contextIdeas, isLoadingIdeas, addIdea, updateIdeaStatus: contextUpdateIdeaStatus, deleteIdea: contextDeleteIdea, getIdeas } = useWorkspace();
  const [newIdeaText, setNewIdeaText] = useState('');
  const [isAddingIdea, setIsAddingIdea] = useState(false);
  const [ideas, setIdeasState] = useState<Idea[]>(contextIdeas);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = getIdeas((fetchedIdeas) => {
        setIdeasState(fetchedIdeas); // Update local state with fetched ideas
    }); 
    return () => unsubscribe();
  }, [getIdeas]); // Ensure getIdeas is stable or correctly memoized in context

  const handleAddIdea = async (e: FormEvent) => {
    e.preventDefault();
    if (!newIdeaText.trim()) return;
    setIsAddingIdea(true);
    try {
      await addIdea(newIdeaText);
      setNewIdeaText('');
      toast({ title: "Idea Added", description: "Your new idea has been saved to the board." });
    } catch (error: any) {
      console.error("Failed to add idea:", error);
      toast({ title: "Error Adding Idea", description: error.message || "Could not save your idea.", variant: "destructive" });
    } finally {
      setIsAddingIdea(false);
    }
  };

  const handleStatusChange = async (id: string, status: IdeaBoardStatus) => {
    setIsUpdatingStatus(id);
    try {
      await contextUpdateIdeaStatus(id, status);
      toast({ title: "Status Updated", description: `Idea status changed to "${status}".` });
    } catch (error: any) {
      console.error("Failed to update idea status:", error);
      toast({ title: "Error Updating Status", description: error.message || "Could not update idea status.", variant: "destructive" });
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const handleDeleteIdea = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this idea?");
    if (confirmed) {
        try {
            await contextDeleteIdea(id);
            toast({ title: "Idea Deleted", description: "The idea has been removed from the board." });
        } catch (error: any) {
            console.error("Failed to delete idea:", error);
            toast({ title: "Error Deleting Idea", description: error.message || "Could not delete the idea.", variant: "destructive" });
        }
    }
  };


  if (isLoadingIdeas && ideas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg">Loading your brilliant ideas...</p>
      </div>
    );
  }

  return (
    <div className="p-1 md:p-0">
      <Card className="mb-6 shadow-sm bg-card">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center gap-2 text-primary"><Lightbulb/> Add New Idea</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddIdea} className="flex items-center gap-3">
            <Input
              type="text"
              value={newIdeaText}
              onChange={(e) => setNewIdeaText(e.target.value)}
              placeholder="Jot down your next big content idea..."
              className="flex-grow bg-input"
              aria-label="New idea text"
              disabled={isAddingIdea}
            />
            <Button type="submit" disabled={!newIdeaText.trim() || isAddingIdea} className="font-semibold">
              {isAddingIdea ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus size={18} />}
              <span className="ml-2 hidden sm:inline">{isAddingIdea ? 'Adding...' : 'Add Idea'}</span>
            </Button>
          </form>
        </CardContent>
      </Card>

      {ideas.length === 0 && !isLoadingIdeas && (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-lg bg-card/50 p-10">
          <Lightbulb size={48} className="mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-xl font-semibold font-headline text-foreground">Your Idea Board is Empty</h3>
          <p className="mt-1 text-muted-foreground">
            Start by adding some content ideas using the form above.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {IDEA_BOARD_STATUSES.map(status => (
          <div key={status} className="bg-muted/50 p-3 md:p-4 rounded-lg flex flex-col min-h-[200px]">
            <h3 className="font-semibold text-lg mb-4 text-foreground capitalize pb-2 border-b border-border">{status}</h3>
            <div className="flex-grow space-y-3 overflow-y-auto max-h-[calc(100vh-350px)] pr-1 custom-scrollbar"> {/* Added custom-scrollbar */}
              {ideas.filter(idea => idea.status === status).length === 0 && (
                <p className="text-sm text-muted-foreground text-center pt-8">No ideas in this stage.</p>
              )}
              {ideas
                .filter(idea => idea.status === status)
                .sort((a, b) => new Date(b.createdAt as Date).getTime() - new Date(a.createdAt as Date).getTime()) 
                .map(idea => (
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
                    onDelete={handleDeleteIdea}
                    onStatusChange={handleStatusChange}
                    isUpdatingStatus={isUpdatingStatus}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
