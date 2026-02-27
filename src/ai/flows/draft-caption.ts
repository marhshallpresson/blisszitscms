// src/ai/flows/draft-caption.ts
'use server';
/**
 * @fileOverview An AI agent that drafts a social media caption.
 *
 * - draftCaption - A function that drafts a caption.
 * - DraftCaptionInput - The input type for the draftCaption function.
 * - DraftCaptionOutput - The return type for the draftCaption function.
 */

import {ai, gemini15Flash} from '@/ai/genkit';
import {z} from 'genkit';

const DraftCaptionInputSchema = z.object({
  coreIdea: z.string().describe('The core idea of the content.'),
  theme: z.string().optional().describe('The optional theme or title of the content.'),
});
export type DraftCaptionInput = z.infer<typeof DraftCaptionInputSchema>;

const DraftCaptionOutputSchema = z.object({
  caption: z.string().describe('The drafted social media caption.'),
});
export type DraftCaptionOutput = z.infer<typeof DraftCaptionOutputSchema>;

export async function draftCaption(input: DraftCaptionInput): Promise<DraftCaptionOutput> {
  return draftCaptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'draftCaptionPrompt',
  model: gemini15Flash,
  input: {schema: DraftCaptionInputSchema},
  output: {schema: DraftCaptionOutputSchema},
  prompt: `You are a social media expert, skilled at writing engaging captions.
Draft a compelling and friendly social media caption.

Core Idea: {{{coreIdea}}}
{{#if theme}}Theme/Title: {{{theme}}}{{/if}}

The caption should be relatively short, engaging, and encourage interaction. Include a relevant call to action if appropriate.
Format the output as a JSON object with a single key "caption".
`,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
    ],
  },
});

const draftCaptionFlow = ai.defineFlow(
  {
    name: 'draftCaptionFlow',
    inputSchema: DraftCaptionInputSchema,
    outputSchema: DraftCaptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
