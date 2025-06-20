
"use client";

import type { GenerateContentIdeasOutput } from '@/ai/flows/generate-content-ideas';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, DownloadCloud, Loader2, Edit } from 'lucide-react';
import { generateContentIdeas } from '@/ai/flows/generate-content-ideas';
import { useToast } from '@/hooks/use-toast';

interface AiRecommendationCardProps {
  onImportRecommendation: (title: string, description: string, caption?: string) => void;
  onOpenOnboardingModal: () => void;
  isOnboardingCompleted: boolean;
}

export const AiRecommendationCard = ({ 
  onImportRecommendation,
  onOpenOnboardingModal,
  isOnboardingCompleted
}: AiRecommendationCardProps) => {
  const [recommendations, setRecommendations] = useState<GenerateContentIdeasOutput>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchRecommendations = useCallback(async () => {
    setIsLoading(true);
    try {
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

  useEffect(() => {
    if (isOnboardingCompleted && recommendations.length === 0 && !isLoading) { // Fetch only if completed and no recs yet
      fetchRecommendations();
    }
  }, [fetchRecommendations, isOnboardingCompleted, recommendations.length, isLoading]);

  const handleGetNewIdeasClick = () => {
    if (!isOnboardingCompleted) {
      onOpenOnboardingModal();
    } else {
      fetchRecommendations();
    }
  };


  return (
    <Card className="mt-10 bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground shadow-xl rounded-xl p-2 md:p-0">
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-3 md:space-y-0 pb-4 px-6 pt-6">
        <div className="flex items-center gap-3">
          <Sparkles className="w-10 h-10" />
          <div>
            <CardTitle className="text-2xl md:text-3xl font-bold font-headline">AI Content Inspiration</CardTitle>
            <CardDescription className="text-primary-foreground/80 text-sm md:text-base">Kickstart your creativity with fresh ideas.</CardDescription>
          </div>
        </div>
        <Button
          onClick={handleGetNewIdeasClick}
          disabled={isLoading}
          variant="secondary"
          size="lg"
          className="bg-background/20 hover:bg-background/30 text-primary-foreground font-semibold shadow-md hover:shadow-lg transition-shadow w-full md:w-auto"
          aria-label={isLoading ? "Generating new ideas" : "Get new content ideas"}
        >
          {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
          {isLoading ? "Generating..." : (isOnboardingCompleted ? "Get New Ideas" : "Personalize Ideas")}
        </Button>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        { !isOnboardingCompleted && recommendations.length === 0 && !isLoading && (
            <div className="text-center py-10 bg-background/10 rounded-lg backdrop-blur-sm">
                <Edit size={36} className="mx-auto mb-3 opacity-70"/>
                <p className="text-lg font-semibold font-body opacity-95">Tell us your interests!</p>
                <p className="text-sm opacity-80 mb-4">Complete a quick setup to get personalized content ideas.</p>
                <Button
                    onClick={onOpenOnboardingModal}
                    variant="outline"
                    className="bg-background/20 hover:bg-background/30 text-primary-foreground font-semibold border-primary-foreground/50 hover:border-primary-foreground/80"
                >
                    Setup Your Interests
                </Button>
            </div>
        )}
        <div className={`mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 ${(!isOnboardingCompleted && recommendations.length === 0 && !isLoading) ? 'hidden' : ''}`}>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-background/10 p-6 rounded-xl animate-pulse backdrop-blur-sm">
                <div className="h-6 bg-background/20 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-background/20 rounded w-full mb-1"></div>
                <div className="h-4 bg-background/20 rounded w-5/6 mb-1"></div>
                <div className="h-4 bg-background/20 rounded w-full mb-4"></div>
                <div className="mt-auto h-10 bg-background/20 rounded w-1/2"></div>
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
                  onClick={() => onImportRecommendation(rec.title, rec.description, '')}
                  variant="outline" 
                  size="default"
                  className="w-full bg-background/20 hover:bg-background/30 text-primary-foreground border-primary-foreground/50 hover:border-primary-foreground/80 font-semibold mt-auto"
                  aria-label={`Import idea: ${rec.title}`}
                >
                  <DownloadCloud size={18} className="mr-2" />
                  Import Idea
                </Button>
              </div>
            ))
          ) : (
             !isLoading && isOnboardingCompleted && (
                <p className="col-span-1 md:col-span-3 text-center opacity-80 py-10 text-lg bg-background/10 rounded-lg backdrop-blur-sm">
                    No recommendations available right now. Try generating new ideas!
                </p>
             )
          )}
        </div>
      </CardContent>
    </Card>
  );
};
