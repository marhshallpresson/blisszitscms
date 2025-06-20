// src/components/content/IdeaBoard.tsx
"use client";

import { useState, useMemo, FormEvent } from 'react';
import { useWorkspace, type Idea, IDEA_BOARD_STATUSES, type IdeaBoardStatus } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Loader2, Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ClientFormattedDate } from '../utils/ClientFormattedDate';

const IdeaCard = ({ idea, onStatusChange, onDelete }: { idea: Idea; onStatusChange: (ideaId: string, newStatus: IdeaBoardStatus) => void; onDelete: (ideaId: string) => void; }) => {
    const currentIndex = IDEA_BOARD_STATUSES.indexOf(idea.status);
    const canMoveBack = currentIndex > 0;
    const canMoveForward = currentIndex < IDEA_BOARD_STATUSES.length - 1;

    return (
        <Card className="bg-card/90 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-3">
                <p className="text-sm text-card-foreground mb-3">{idea.text}</p>
                <div className="flex justify-between items-center">
                    <div className="text-xs text-muted-foreground">
                        <ClientFormattedDate date={idea.createdAt} options={{ month: 'short', day: 'numeric' }} />
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" disabled={!canMoveBack} onClick={() => onStatusChange(idea.id, IDEA_BOARD_STATUSES[currentIndex - 1])}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" disabled={!canMoveForward} onClick={() => onStatusChange(idea.id, IDEA_BOARD_STATUSES[currentIndex + 1])}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/70 hover:text-destructive" onClick={() => onDelete(idea.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export const IdeaBoard = () => {
  const { ideas, isLoadingIdeas, addIdea, updateIdeaStatus, deleteIdea } = useWorkspace();
  const [newIdeaText, setNewIdeaText] = useState('');
  const [isAddingIdea, setIsAddingIdea] = useState(false);
  const { toast } = useToast();

  const handleAddIdea = async (e: FormEvent) => {
    e.preventDefault();
    if (!newIdeaText.trim()) return;
    setIsAddingIdea(true);
    try {
      await addIdea(newIdeaText);
      setNewIdeaText('');
      toast({ title: "Idea Added!", description: "Your new idea is on the board." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Could not add idea.", variant: "destructive" });
    } finally {
      setIsAddingIdea(false);
    }
  };
  
  const handleDeleteIdea = async (ideaId: string) => {
    if (!confirm("Are you sure you want to delete this idea? This action cannot be undone.")) return;
    try {
        await deleteIdea(ideaId);
        toast({ title: "Idea Deleted" });
    } catch (error: any) {
        toast({ title: "Error", description: error.message || "Could not delete idea.", variant: "destructive" });
    }
  };

  const columns = useMemo(() => {
    const cols: Record<IdeaBoardStatus, Idea[]> = {
      'Ideas': [],
      'Scripting': [],
      'Filming': [],
      'Editing': [],
      'Published': [],
    };
    ideas.forEach(idea => {
      cols[idea.status]?.push(idea);
    });
    return cols;
  }, [ideas]);

  return (
    <div className="space-y-6">
       <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center gap-2"><Lightbulb className="text-primary"/> Add New Idea</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleAddIdea} className="flex flex-col sm:flex-row items-start gap-3">
                    <Textarea
                        value={newIdeaText}
                        onChange={(e) => setNewIdeaText(e.target.value)}
                        placeholder="Jot down your next big content idea..."
                        className="flex-grow bg-input"
                        aria-label="New idea text"
                        disabled={isAddingIdea}
                        rows={2}
                    />
                    <Button type="submit" disabled={!newIdeaText.trim() || isAddingIdea} className="font-semibold bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
                        {isAddingIdea ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus size={18} />}
                        <span className="ml-2">{isAddingIdea ? 'Adding...' : 'Add Idea'}</span>
                    </Button>
                </form>
            </CardContent>
        </Card>
    
      {isLoadingIdeas ? (
        <div className="flex justify-center p-10"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
      ) : ideas.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-border/70 rounded-xl bg-card/50">
              <Lightbulb size={56} className="mx-auto text-muted-foreground opacity-70" />
              <h3 className="mt-6 text-2xl font-semibold font-headline text-card-foreground">Your Idea Board is Empty</h3>
              <p className="mt-2 text-muted-foreground font-body">Use the form above to add your first idea!</p>
          </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-start">
            {IDEA_BOARD_STATUSES.map(status => (
                <div key={status} className="bg-muted/50 rounded-lg p-3 h-full">
                    <h3 className="font-semibold text-center text-card-foreground p-2 mb-3">{status} ({columns[status].length})</h3>
                    <div className="space-y-3 min-h-[100px]">
                        {columns[status].map(idea => (
                            <IdeaCard key={idea.id} idea={idea} onStatusChange={updateIdeaStatus} onDelete={handleDeleteIdea} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};
