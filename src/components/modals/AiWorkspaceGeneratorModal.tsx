// src/components/modals/AiWorkspaceGeneratorModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Edit, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { generateAdvancedWorkspacePlan, type GenerateAdvancedWorkspacePlanOutput } from '@/ai/flows/generate-advanced-workspace-plan';
import { Progress } from '../ui/progress';
import { AiFieldActions } from '@/components/ai/AiFieldActions';
import { AiAssistantPreviewPanel } from '@/components/ai/AiAssistantPreviewPanel';
import { useAiTextAssistant } from '@/hooks/useAiTextAssistant';

interface AiWorkspaceGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkspaceCreated?: (workspaceId: string) => void; 
}

const PREDEFINED_INTERESTS = [
  'Technology', 'Photography', 'Cooking', 'Fitness', 'Travel', 'Vlogging', 'Filmmaking', 
  'Comedy', 'Education', 'Startups', 'AI', 'Fashion', 'Beauty', 'Gaming', 'Music', 
  'Art & Design', 'Lifestyle', 'Business', 'Marketing', 'Health & Wellness', 
  'DIY & Crafts', 'Finance & Investing', 'Book Reviews', 'Parenting'
];

const SOCIAL_PLATFORMS = [
  'Instagram', 'TikTok', 'YouTube', 'Facebook', 'LinkedIn', 'Twitter (X)', 'Pinterest', 'Blog'
];

type WizardStep = 'topic' | 'interests' | 'platforms' | 'generating' | 'review';

export const AiWorkspaceGeneratorModal = ({ isOpen, onClose, onWorkspaceCreated }: AiWorkspaceGeneratorModalProps) => {
  const [step, setStep] = useState<WizardStep>('topic');
  const [topic, setTopic] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [generatedPlan, setGeneratedPlan] = useState<GenerateAdvancedWorkspacePlanOutput | null>(null);

  const { createWorkspace } = useWorkspace();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const aiAssistant = useAiTextAssistant({
    getFieldValue: () => topic,
    setFieldValue: (_fieldId, value) => setTopic(value),
    onError: (message) => {
      toast({ title: 'AI Error', description: message, variant: 'destructive' });
    },
  });
  
  const progressValue = {
    topic: 0,
    interests: 33,
    platforms: 66,
    generating: 100,
    review: 100
  }[step];

  const resetState = () => {
    setStep('topic');
    setTopic('');
    setSelectedInterests([]);
    setSelectedPlatforms([]);
    setGeneratedPlan(null);
    setIsSubmitting(false);
  };

  useEffect(() => {
    if (isOpen) {
      resetState();
    }
  }, [isOpen]);

  const toggleSelection = (item: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    setList(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const handleGeneratePlan = async () => {
    if (!topic.trim()) {
      toast({ title: "Topic is required", variant: "destructive" });
      return;
    }
    setStep('generating');
    setIsSubmitting(true); // Disable buttons while generating
    try {
      const plan = await generateAdvancedWorkspacePlan({ 
        topic,
        interests: selectedInterests,
        platforms: selectedPlatforms
      });
      setGeneratedPlan(plan);
      setStep('review');
    } catch (error: any) {
      console.error("AI Generation Error:", error);
      toast({ title: "AI Generation Failed", description: error.message || "Could not generate a plan.", variant: "destructive" });
      setStep('platforms'); // Go back to the last step on failure
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateWorkspace = async () => {
    if (!generatedPlan) {
        toast({ title: "No plan to create", variant: "destructive" });
        return;
    }
    setIsSubmitting(true);
    try {
      const { workspaceName, workspaceDescription, contentPlan } = generatedPlan;
      
      const newWorkspaceId = await createWorkspace(workspaceName, workspaceDescription, contentPlan);
      
      if (!newWorkspaceId) {
        throw new Error("Creation process failed to return a new workspace ID.");
      }

      toast({ title: "Workspace Created!", description: `Successfully created "${workspaceName}" with ${contentPlan.length} content ideas.` });
      if (onWorkspaceCreated) onWorkspaceCreated(newWorkspaceId);
      onClose();
    } catch (error: any) {
      console.error("Workspace Creation Error:", error);
      toast({ title: "Creation Failed", description: error.message || "Could not create the workspace and its content.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(openStatus) => !openStatus && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-card flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-headline text-card-foreground flex items-center gap-2"><Edit className="text-primary"/> AI Workspace Generator</DialogTitle>
          <DialogDescription>Let's craft the perfect content plan for your new project in just a few steps.</DialogDescription>
        </DialogHeader>
        
        <Progress value={progressValue} className="w-full h-2 my-2" />

        <div className="flex-grow overflow-y-auto -mr-4 pr-4 py-4">
          {step === 'topic' && (
            <div className="space-y-4 animate-in fade-in-50">
              <Label htmlFor="ai-topic" className="text-lg font-semibold">What is the main topic or goal?</Label>
              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <Textarea
                  id="ai-topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., '30-Day Fitness Challenge', 'Learn Photography Basics', 'Launch a new SaaS product'"
                  className="bg-input text-base"
                  rows={4}
                />
                <AiFieldActions
                  onAction={(operation) => {
                    void aiAssistant.runOperation({
                      fieldId: 'workspace-topic',
                      context: 'workspace_topic',
                      operation,
                      text: topic,
                      seed: topic || 'Generate a clear content workspace topic for a social media strategy project.',
                    });
                  }}
                  isLoading={{
                    generate: aiAssistant.isLoading('workspace-topic', 'generate'),
                    improve: aiAssistant.isLoading('workspace-topic', 'improve'),
                    shorten: aiAssistant.isLoading('workspace-topic', 'shorten'),
                  }}
                  disabled={{
                    generate: false,
                    improve: !topic.trim(),
                    shorten: !topic.trim(),
                  }}
                />
              </div>
              <AiAssistantPreviewPanel
                preview={aiAssistant.preview}
                tone={aiAssistant.tone}
                onToneChange={aiAssistant.setTone}
                onApplyReplace={() => aiAssistant.applyPreview('replace')}
                onApplyAppend={() => aiAssistant.applyPreview('append')}
                onDismiss={aiAssistant.clearPreview}
                onUndo={aiAssistant.undoLastApply}
                canUndo={aiAssistant.hasUndo}
              />
            </div>
          )}

          {step === 'interests' && (
            <div className="space-y-4 animate-in fade-in-50">
                <Label className="text-lg font-semibold">Who is your audience? (Optional)</Label>
                <p className="text-sm text-muted-foreground -mt-2">Select interests your target audience has. This helps tailor content tone and style.</p>
                <div className="flex flex-wrap gap-3 p-1">
                    {PREDEFINED_INTERESTS.map(interest => {
                        const isSelected = selectedInterests.includes(interest);
                        return (
                            <button key={interest} onClick={() => toggleSelection(interest, selectedInterests, setSelectedInterests)}
                                className={`py-2 px-4 text-sm rounded-full transition-all duration-200 border flex items-center gap-1.5 ${isSelected ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/50 hover:bg-muted border-transparent'}`}>
                                {interest} {isSelected && <Check className="h-4 w-4"/>}
                            </button>
                        )
                    })}
                </div>
            </div>
          )}

          {step === 'platforms' && (
             <div className="space-y-4 animate-in fade-in-50">
                <Label className="text-lg font-semibold">Where will you post? (Optional)</Label>
                <p className="text-sm text-muted-foreground -mt-2">Select the platforms you're targeting. This helps with formatting and idea types.</p>
                <div className="flex flex-wrap gap-3 p-1">
                    {SOCIAL_PLATFORMS.map(platform => {
                        const isSelected = selectedPlatforms.includes(platform);
                        return (
                            <button key={platform} onClick={() => toggleSelection(platform, selectedPlatforms, setSelectedPlatforms)}
                                className={`py-2 px-4 text-sm rounded-full transition-all duration-200 border flex items-center gap-1.5 ${isSelected ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/50 hover:bg-muted border-transparent'}`}>
                                {platform} {isSelected && <Check className="h-4 w-4"/>}
                            </button>
                        )
                    })}
                </div>
            </div>
          )}

          {step === 'generating' && (
             <div className="flex flex-col items-center justify-center text-center space-y-4 h-64 animate-in fade-in-50">
                <Loader2 className="h-16 w-16 animate-spin text-primary"/>
                <h3 className="text-xl font-semibold">Generating Your Plan...</h3>
                <p className="text-muted-foreground">Our AI strategist is crafting your workspace. This may take a moment.</p>
            </div>
          )}

          {step === 'review' && generatedPlan && (
             <div className="space-y-4 animate-in fade-in-50">
                <h3 className="text-lg font-semibold">Review Your Generated Plan</h3>
                <Card>
                    <CardHeader>
                        <CardTitle>{generatedPlan.workspaceName}</CardTitle>
                        <CardDescription>{generatedPlan.workspaceDescription}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <h4 className="font-semibold mb-2">Suggested Content Items:</h4>
                        <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                            {generatedPlan.contentPlan.map((item, index) => (
                                <li key={index}><span className="font-medium text-card-foreground">{item.title}:</span> {item.idea}</li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
             </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 pt-4 border-t">
          <div className="flex justify-between w-full">
            <div>
                 {step !== 'topic' && step !== 'generating' && (
                    <Button variant="ghost" onClick={() => setStep(step === 'interests' ? 'topic' : step === 'platforms' ? 'interests' : 'platforms')} disabled={isSubmitting}>
                        <ArrowLeft className="mr-2 h-4 w-4"/> Back
                    </Button>
                )}
            </div>
            <div className="flex gap-2">
              <DialogClose asChild><Button variant="outline" onClick={onClose}>Cancel</Button></DialogClose>
              
              {step === 'topic' && <Button onClick={() => setStep('interests')} disabled={!topic.trim()}>Next <ArrowRight className="ml-2 h-4 w-4"/></Button>}
              {step === 'interests' && <Button onClick={() => setStep('platforms')}>Next <ArrowRight className="ml-2 h-4 w-4"/></Button>}
              {step === 'platforms' && <Button onClick={handleGeneratePlan} disabled={isSubmitting || !topic.trim()}>Generate Plan <Edit className="ml-2 h-4 w-4"/></Button>}
              {step === 'review' && <Button onClick={handleCreateWorkspace} disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground">Create Workspace <Check className="ml-2 h-4 w-4"/></Button>}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
