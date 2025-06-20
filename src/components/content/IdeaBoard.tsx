
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

interface IdeaCardProps {
  idea: Idea;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: IdeaBoardStatus) => void;
}

const IdeaCard = ({ idea, onDelete, onStatusChange }: IdeaCardProps) => {
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
        <Select value={idea.status} onValueChange={(newStatus) => onStatusChange(idea.id, newStatus as IdeaBoardStatus)}>
            <SelectTrigger className="w-full h-8 text-xs bg-background" aria-label={`Change status for idea: ${idea.text}`}>
                <SelectValue placeholder="Set status" />
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
  const { ideas: contextIdeas, isLoadingIdeas, addIdea, updateIdeaStatus, deleteIdea, getIdeas } = useWorkspace();
  const [newIdeaText, setNewIdeaText] = useState('');
  const [isAddingIdea, setIsAddingIdea] = useState(false);
  const [ideas, setIdeasState] = useState<Idea[]>(contextIdeas); // Local copy for optimistic updates or sorting

  useEffect(() => {
    const unsubscribe = getIdeas(setIdeasState); // Use the callback to update local state
    return () => unsubscribe();
  }, [getIdeas]);

  const handleAddIdea = async (e: FormEvent) => {
    e.preventDefault();
    if (!newIdeaText.trim()) return;
    setIsAddingIdea(true);
    try {
      await addIdea(newIdeaText);
      setNewIdeaText('');
    } catch (error) {
      console.error("Failed to add idea:", error);
      // Add toast notification for error
    } finally {
      setIsAddingIdea(false);
    }
  };

  if (isLoadingIdeas && ideas.length === 0) { // Show loader only if no ideas are displayed yet
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
        <div className="text-center py-12 border-2 border-dashed border-border rounded-lg bg-muted/20">
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
            <div className="flex-grow space-y-3 overflow-y-auto max-h-[calc(100vh-250px)] pr-1">
              {ideas.filter(idea => idea.status === status).length === 0 && (
                <p className="text-sm text-muted-foreground text-center pt-8">No ideas in this stage.</p>
              )}
              {ideas
                .filter(idea => idea.status === status)
                .sort((a, b) => new Date(b.createdAt as Date).getTime() - new Date(a.createdAt as Date).getTime()) // Sort by newest first
                .map(idea => (
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
                    onDelete={deleteIdea}
                    onStatusChange={updateIdeaStatus}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

    