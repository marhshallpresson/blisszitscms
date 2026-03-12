import { ai, gemini15Flash } from '@/ai/genkit';
import { executePromptWithModelFallback } from '@/lib/ai/execute-prompt-with-model-fallback';
import { z } from 'genkit';

interface ReplyContext {
  platform: string;
  message: string;
  senderName?: string;
  postContext?: string;
  brandVoice?: string; // from user settings
  previousMessages?: string[]; // conversation history
  uid: string; // User ID to fetch brandVoice from settings
}

const ReplyOutputSchema = z.object({
  reply: z.string(),
  confidence: z.number().min(0).max(1),
  requiresHumanReview: z.boolean(),
  reason: z.string().optional(),
});

/**
 * Generates an AI-powered reply suggestion based on platform context and brand voice.
 * Uses the project's standard model fallback chain for robustness.
 */
export async function generateAiReply(context: ReplyContext): Promise<z.infer<typeof ReplyOutputSchema>> {
  // In a real application, you'd fetch the user's brand voice settings here
  // const userSettings = await adminDb.doc(`users/${context.uid}/settings/brandVoice`).get();
  // const brandVoice = userSettings.data()?.tone || 'professional and friendly';
  const brandVoice = 'professional and friendly'; // Placeholder for now

  const autoReplyPrompt = ai.definePrompt({
    name: `autoReply_${Date.now()}`,
    model: gemini15Flash, // Default to flash from the chain
    input: { schema: z.object({ context: z.any() }) },
    output: { schema: ReplyOutputSchema },
    prompt: `You are a professional social media manager responding on behalf of a brand.

Platform: {{{context.platform}}}
Brand Voice: ${brandVoice}

{{#if context.postContext}}
Original Post Context: {{{context.postContext}}}
{{/if}}

{{#if context.previousMessages}}
Conversation History:
{{#each context.previousMessages}}- {{{this}}}{{/each}}
{{/if}}

New message from {{{context.senderName}}}: "{{{context.message}}}"

Generate a professional, on-brand reply. Rules:
1. Be warm, helpful, and authentic
2. Keep it concise (under 280 chars for Twitter-like platforms, up to 500 for others)
3. Never promise things the brand can't deliver
4. If the message contains a complaint, acknowledge and offer to help
5. If it's hate speech or spam, set requiresHumanReview to true
6. If you're < 80% confident, set requiresHumanReview to true

Return JSON with "reply", "confidence" (0-1), "requiresHumanReview" (boolean), and optional "reason".
`,
  });

  const result = await executePromptWithModelFallback(autoReplyPrompt, { context });
  return result.output!;
}
