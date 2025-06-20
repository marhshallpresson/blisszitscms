
"use client";

import type { GenerateContentIdeasOutput } from '@/ai/flows/generate-content-ideas';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { generateContentIdeas } from '@/ai/flows/generate-content-ideas';
import { useToast } from '@/hooks/use-toast';

export const AiRecommendationCard = () => {
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
      setRecommendations([]); // Clear recommendations or set an error state
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return (
    <Card className="mt-10 bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <Sparkles className="w-8 h-8" />
          <CardTitle className="text-2xl font-bold font-headline">AI Content Inspiration</CardTitle>
        </div>
        <Button
          onClick={fetchRecommendations}
          disabled={isLoading}
          variant="secondary"
          className="bg-white/20 hover:bg-white/30 text-primary-foreground font-semibold"
        >
          {isLoading ? "Generating..." : "Get New Ideas"}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white/10 p-4 rounded-xl animate-pulse">
                <div className="h-5 bg-white/20 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-white/20 rounded w-full"></div>
                <div className="h-3 bg-white/20 rounded w-5/6 mt-1"></div>
              </div>
            ))
          ) : recommendations.length > 0 ? (
            recommendations.map((rec, i) => (
              <div key={i} className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                <h4 className="font-bold font-headline text-lg">{rec.title}</h4>
                <p className="text-sm opacity-90 mt-1 font-body">{rec.description}</p>
              </div>
            ))
          ) : (
            <p className="col-span-3 text-center opacity-80">No recommendations available. Try generating new ideas.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
