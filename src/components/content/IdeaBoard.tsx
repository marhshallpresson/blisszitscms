// src/components/content/IdeaBoard.tsx
"use client";

// This component was part of the CMS dashboard.
// For the corporate website, it's not directly used.
// If a collaborative ideation feature is added to a client portal,
// this could be adapted.

import { useState, useEffect, FormEvent } from 'react';
// import { useWorkspace, type Idea, IDEA_BOARD_STATUSES, type IdeaBoardStatus } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Loader2, Lightbulb } from 'lucide-react';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { ClientFormattedDate } from '@/components/utils/ClientFormattedDate';
// import { useToast } from '@/hooks/use-toast';

// Placeholder types for structure
type IdeaBoardStatus = 'Ideas' | 'Scripting' | 'Filming' | 'Editing' | 'Published';
const IDEA_BOARD_STATUSES: IdeaBoardStatus[] = ['Ideas', 'Scripting', 'Filming', 'Editing', 'Published'];
interface Idea {
  id: string;
  text: string;
  status: IdeaBoardStatus;
  createdAt: Date;
}

export const IdeaBoard = () => {
  // const { ideas: contextIdeas, isLoadingIdeas, addIdea, updateIdeaStatus: contextUpdateIdeaStatus, deleteIdea: contextDeleteIdea, getIdeas } = useWorkspace();
  const [newIdeaText, setNewIdeaText] = useState('');
  const [isAddingIdea, setIsAddingIdea] = useState(false);
  const [ideas, setIdeasState] = useState<Idea[]>([]); // No data for corporate site
  const isLoadingIdeas = false;
  // const { toast } = useToast();

  // useEffect for fetching ideas removed

  const handleAddIdea = async (e: FormEvent) => {
    e.preventDefault();
    if (!newIdeaText.trim()) return;
    setIsAddingIdea(true);
    console.log("Adding idea (placeholder):", newIdeaText);
    await new Promise(resolve => setTimeout(resolve, 500));
    // toast({ title: "Action (Demo)", description: "Idea board functionality is part of CMS." });
    setNewIdeaText('');
    setIsAddingIdea(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h2 className="text-xl font-semibold text-foreground mb-4">Idea Board (Placeholder)</h2>
      <p className="text-muted-foreground mb-6">
        This component was for managing content ideas in a Kanban-style board within the CMS.
        It is not used in the current corporate website layout.
      </p>
      <div className="opacity-50 pointer-events-none max-w-3xl mx-auto">
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
              <Button type="submit" disabled={!newIdeaText.trim() || isAddingIdea} className="font-semibold bg-primary hover:bg-primary/90 text-primary-foreground">
                {isAddingIdea ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus size={18} />}
                <span className="ml-2 hidden sm:inline">{isAddingIdea ? 'Adding...' : 'Add Idea'}</span>
              </Button>
            </form>
          </CardContent>
        </Card>
         <div className="text-center py-12 border-2 border-dashed border-border rounded-lg bg-card/50 p-10">
          <Lightbulb size={48} className="mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-xl font-semibold font-headline text-foreground">Idea Board is Empty</h3>
        </div>
      </div>
    </div>
  );
};
