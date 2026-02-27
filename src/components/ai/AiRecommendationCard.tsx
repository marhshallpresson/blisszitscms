// src/components/ai/AiRecommendationCard.tsx
"use client";

import type { GenerateContentIdeasOutput } from '@/ai/flows/generate-content-ideas';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, DownloadCloud, Loader2 } from 'lucide-react';
import { generateContentIdeas } from '@/ai/flows/generate-content-ideas';
import { useToast } from '@/hooks/use-toast';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { SelectWorkspaceForImportModal } from '@/components/modals/SelectWorkspaceForImportModal';
import { WorkspaceCreatorModal } from '@/components/modals/WorkspaceCreatorModal';

interface AiRecommendationCardProps {
  onOpenOnboardingModal: () => void;
  isOnboardingCompleted: boolean;
}

export const AiRecommendationCard = ({ 
  onOpenOnboardingModal,
  isOnboardingCompleted
}: AiRecommendationCardProps) => {
  const [recommendations, setRecommendations] = useState<GenerateContentIdeasOutput>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const { workspaces, createContentItem } = useWorkspace();
  const [isSelectWorkspaceModalOpen, setIsSelectWorkspaceModalOpen] = useState(false);
  const [isCreateWorkspaceModalOpen, setIsCreateWorkspaceModalOpen] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<{ title: string; description: string; } | null>(null);

  const fetchRecommendations = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await generateContentIdeas({ 
        topic: "social media trends for creators", 
        numIdeas: 3,
        interests: userProfile?.interests
      });
      setRecommendations(result);
    } catch (error) {
      console.error("AI Recommendation Error:", error);
      toast({
        title: "AI Error",
        description: "Could not fetch AI recommendations at this time.",
        variant: "destructive",
      });
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast, userProfile?.interests]);

  useEffect(() => {
    // Automatically fetch ideas if onboarding is done and we have no recommendations.
    if (isOnboardingCompleted && recommendations.length === 0 && !isLoading) {
      fetchRecommendations();
    }
  }, [isOnboardingCompleted, fetchRecommendations, recommendations.length, isLoading]);

  const handleGetNewIdeasClick = () => {
    // If user has not selected interests yet, prompt them to do so.
    if (!userProfile?.interests || userProfile.interests.length === 0) {
      onOpenOnboardingModal();
    } else {
      fetchRecommendations();
    }
  };

  const handleImportClick = (rec: { title: string; description: string; }) => {
    if (workspaces.length === 0) {
      setIsCreateWorkspaceModalOpen(true);
    } else {
      setSelectedRecommendation(rec);
      setIsSelectWorkspaceModalOpen(true);
    }
  };

  const handleSelectWorkspace = async (workspaceId: string) => {
    if (!selectedRecommendation) return;

    try {
      await createContentItem({
        title: selectedRecommendation.title,
        idea: selectedRecommendation.description,
        status: 'draft',
      }, workspaceId);
      
      toast({
        title: "Idea Imported!",
        description: `"${selectedRecommendation.title}" has been added to your workspace.`,
      });
    } catch (error: any) {
       toast({
        title: "Import Failed",
        description: error.message || "Could not import the idea.",
        variant: "destructive",
      });
    } finally {
        setIsSelectWorkspaceModalOpen(false);
        setSelectedRecommendation(null);
    }
  };

  return (
    <>
      <Card className="bg-gradient-to-br from-primary via-primary/80 to-accent text-primary-foreground shadow-xl rounded-xl">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 px-6 pt-6">
          <div className="flex items-center gap-4">
            <Sparkles className="w-10 h-10 flex-shrink-0" />
            <div>
              <CardTitle className="text-2xl md:text-3xl font-bold font-headline">AI Content Inspiration</CardTitle>
              <CardDescription className="text-primary-foreground/80 text-base">Let AI kickstart your next viral piece of content.</CardDescription>
            </div>
          </div>
          <Button
            onClick={handleGetNewIdeasClick}
            disabled={isLoading}
            variant="secondary"
            size="lg"
            className="bg-background/20 hover:bg-background/30 text-primary-foreground font-semibold shadow-md hover:shadow-lg transition-shadow w-full md:w-auto flex-shrink-0"
            aria-label={isLoading ? "Generating new ideas" : "Get new content ideas"}
          >
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
            {isLoading ? "Generating..." : "Get New Ideas"}
          </Button>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className={`mt-4 grid grid-cols-1 md:grid-cols-3 gap-6`}>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-background/10 p-6 rounded-xl animate-pulse backdrop-blur-sm">
                  <div className="h-6 bg-background/20 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-background/20 rounded w-full mb-1"></div>
                  <div className="h-4 bg-background/20 rounded w-5/6 mb-4"></div>
                  <div className="mt-auto h-10 bg-background/20 rounded w-full"></div>
                </div>
              ))
            ) : recommendations.length > 0 ? (
              recommendations.map((rec, i) => (
                <div key={i} className="bg-background/10 p-6 rounded-xl backdrop-blur-sm flex flex-col justify-between shadow-lg hover:shadow-xl transition-shadow">
                  <div>
                    <h4 className="font-bold font-headline text-lg leading-tight">{rec.title}</h4>
                    <p className="text-sm opacity-90 mt-2 font-body mb-5 h-16 line-clamp-3">{rec.description}</p>
                  </div>
                  <Button 
                    onClick={() => handleImportClick(rec)}
                    variant="outline" 
                    className="w-full bg-background/20 hover:bg-background/30 text-primary-foreground border-primary-foreground/50 hover:border-primary-foreground/80 font-semibold mt-auto"
                    aria-label={`Import idea: ${rec.title}`}
                  >
                    <DownloadCloud size={18} className="mr-2" />
                    Import Idea
                  </Button>
                </div>
              ))
            ) : (
              !isLoading && (
                  <div className="col-span-1 md:col-span-3 text-center opacity-80 py-10 text-lg bg-background/10 rounded-lg backdrop-blur-sm">
                      <p>Click "Get New Ideas" to start!</p>
                      <p className="text-sm mt-1">If this is your first time, we'll ask for your interests.</p>
                  </div>
              )
            )}
          </div>
        </CardContent>
      </Card>
      <SelectWorkspaceForImportModal
        isOpen={isSelectWorkspaceModalOpen}
        onClose={() => setIsSelectWorkspaceModalOpen(false)}
        workspaces={workspaces}
        onSelectWorkspace={handleSelectWorkspace}
        onOpenCreateWorkspace={() => {
          setIsSelectWorkspaceModalOpen(false);
          setIsCreateWorkspaceModalOpen(true);
        }}
      />
      <WorkspaceCreatorModal
        isOpen={isCreateWorkspaceModalOpen}
        onClose={() => setIsCreateWorkspaceModalOpen(false)}
        onWorkspaceCreated={(workspaceId) => {
          setIsCreateWorkspaceModalOpen(false);
          if (workspaceId && selectedRecommendation) {
            handleSelectWorkspace(workspaceId);
          }
        }}
      />
    </>
  );
};
