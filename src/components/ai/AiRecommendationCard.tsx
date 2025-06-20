
"use client";

import type { GenerateContentIdeasOutput } from '@/ai/flows/generate-content-ideas';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, DownloadCloud, Loader2 } from 'lucide-react'; // Added Loader2
import { generateContentIdeas } from '@/ai/flows/generate-content-ideas';
import { useToast } from '@/hooks/use-toast';

interface AiRecommendationCardProps {
  onImportRecommendation: (title: string, description: string, caption?: string) => void;
  onOpenOnboardingModal: () => void; // New prop
  isOnboardingCompleted: boolean; // New prop
}

export const AiRecommendationCard = ({ 
  onImportRecommendation,
  onOpenOnboardingModal, // New
  isOnboardingCompleted // New
}: AiRecommendationCardProps) => {
  const [recommendations, setRecommendations] = useState<GenerateContentIdeasOutput>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchRecommendations = useCallback(async () => {
    setIsLoading(true);
    try {
      // For now, interests are not passed to generateContentIdeas
      // This will be enhanced when backend supports interest-based generation
      const result = await generateContentIdeas({ topic: "social media trends for creators", numIdeas: 3 });
      setRecommendations(result);
    } catch (error) {
      console.error("AI Recommendation Error:", error);
      toast({
        title: "AI Error",
        description: "Could not fetch AI recommendations at this time.",
        variant: "destructive",
      });
      setRecommendations([]); 
    }
    setIsLoading(false);
  }, [toast]);

  // Automatically fetch recommendations once when the component mounts,
  // but only if onboarding is already completed.
  useEffect(() => {
    if (isOnboardingCompleted) {
      fetchRecommendations();
    }
  }, [fetchRecommendations, isOnboardingCompleted]);

  const handleGetNewIdeasClick = () => {
    if (!isOnboardingCompleted) {
      onOpenOnboardingModal(); // Open onboarding if not completed
    } else {
      fetchRecommendations(); // Otherwise, fetch ideas directly
    }
  };


  return (
    <Card className="mt-10 bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <Sparkles className="w-8 h-8" />
          <CardTitle className="text-2xl font-bold font-headline">AI Content Inspiration</CardTitle>
        </div>
        <Button
          onClick={handleGetNewIdeasClick}
          disabled={isLoading}
          variant="secondary"
          className="bg-white/20 hover:bg-white/30 text-primary-foreground font-semibold"
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isLoading ? "Generating..." : "Get New Ideas"}
        </Button>
      </CardHeader>
      <CardContent>
        { !isOnboardingCompleted && recommendations.length === 0 && !isLoading && (
            <div className="text-center py-8">
                <p className="text-lg opacity-90 font-body">Tell us your interests to get personalized content ideas!</p>
                <Button
                    onClick={onOpenOnboardingModal}
                    variant="secondary"
                    className="mt-4 bg-white/20 hover:bg-white/30 text-primary-foreground font-semibold"
                >
                    Setup Your Interests
                </Button>
            </div>
        )}
        <div className={`mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 ${(!isOnboardingCompleted && recommendations.length === 0 && !isLoading) ? 'hidden' : ''}`}>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white/10 p-4 rounded-xl animate-pulse">
                <div className="h-5 bg-white/20 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-white/20 rounded w-full"></div>
                <div className="h-3 bg-white/20 rounded w-5/6 mt-1"></div>
                <div className="mt-4 h-8 bg-white/20 rounded w-1/2"></div>
              </div>
            ))
          ) : recommendations.length > 0 ? (
            recommendations.map((rec, i) => (
              <div key={i} className="bg-white/10 p-6 rounded-xl backdrop-blur-sm flex flex-col justify-between">
                <div>
                  <h4 className="font-bold font-headline text-lg">{rec.title}</h4>
                  <p className="text-sm opacity-90 mt-1 font-body mb-4">{rec.description}</p>
                </div>
                <Button 
                  onClick={() => onImportRecommendation(rec.title, rec.description, '')} // Assuming no caption from this flow for now
                  variant="outline" 
                  size="sm"
                  className="w-full bg-white/20 hover:bg-white/30 text-primary-foreground border-white/30 hover:border-white/50 font-semibold"
                >
                  <DownloadCloud size={16} className="mr-2" />
                  Import Idea
                </Button>
              </div>
            ))
          ) : (
             !isLoading && isOnboardingCompleted && <p className="col-span-3 text-center opacity-80 py-4">No recommendations available. Try generating new ideas.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
