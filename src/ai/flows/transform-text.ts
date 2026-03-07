'use server';

import { z } from 'genkit';
import { ai, gemini15Flash } from '@/ai/genkit';
import { AI_TEXT_CONTEXTS, AI_TEXT_OPERATIONS, AI_TONE_PRESETS } from '@/types/ai-assistant';
import { executePromptWithModelFallback } from '@/lib/ai/execute-prompt-with-model-fallback';
import { formatAiError } from '@/lib/ai/format-ai-error';

const TransformTextInputSchema = z.object({
  operation: z.enum(AI_TEXT_OPERATIONS),
  context: z.enum(AI_TEXT_CONTEXTS),
  tone: z.enum(AI_TONE_PRESETS),
  text: z.string().optional(),
  seed: z.string().optional(),
  network: z.string().optional(),
});

const TransformTextOutputSchema = z.object({
  text: z.string(),
});

export type TransformTextInput = z.infer<typeof TransformTextInputSchema>;
export type TransformTextOutput = z.infer<typeof TransformTextOutputSchema>;

export async function transformText(input: TransformTextInput): Promise<TransformTextOutput> {
  try {
    return await transformTextFlow(input);
  } catch (error) {
    throw new Error(formatAiError(error));
  }
}

const prompt = ai.definePrompt({
  name: 'transformTextPrompt',
  model: gemini15Flash,
  input: { schema: TransformTextInputSchema },
  output: { schema: TransformTextOutputSchema },
  prompt: `You are a social content writing assistant.

Operation: {{{operation}}}
Context: {{{context}}}
Tone: {{{tone}}}
{{#if network}}Network: {{{network}}}{{/if}}
{{#if seed}}Supporting context: {{{seed}}}{{/if}}
{{#if text}}Current draft: {{{text}}}{{/if}}

Rules:
1) If operation is "generate", create a fresh draft based on supporting context and context type.
2) If operation is "improve", keep the same intent while improving clarity, structure, and impact.
3) If operation is "shorten", preserve meaning but make the text concise and skimmable.
4) Return only the transformed text in the "text" output field.
5) Do not include markdown fences or labels.`,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
    ],
  },
});

const transformTextFlow = ai.defineFlow(
  {
    name: 'transformTextFlow',
    inputSchema: TransformTextInputSchema,
    outputSchema: TransformTextOutputSchema,
  },
  async (input) => {
    const hasText = Boolean(input.text?.trim());
    const hasSeed = Boolean(input.seed?.trim());

    if (input.operation === 'generate' && !hasText && !hasSeed) {
      throw new Error('Generate requires text or seed context.');
    }
    if (input.operation !== 'generate' && !hasText) {
      throw new Error(`${input.operation} requires existing text.`);
    }

    const { output } = await executePromptWithModelFallback(prompt, input);
    if (!output?.text?.trim()) {
      throw new Error('AI returned an empty response.');
    }
    return output;
  }
);
