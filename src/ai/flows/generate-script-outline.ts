// src/ai/flows/generate-script-outline.ts
'use server';
/**
 * @fileOverview An AI agent that generates a script outline based on a core idea.
 *
 * - generateScriptOutline - A function that generates a script outline.
 * - GenerateScriptOutlineInput - The input type for the generateScriptOutline function.
 * - GenerateScriptOutlineOutput - The return type for the generateScriptOutline function.
 */

import {ai, gemini15Flash} from '@/ai/genkit';
import {z} from 'genkit';
import { executePromptWithModelFallback } from '@/lib/ai/execute-prompt-with-model-fallback';
import { formatAiError } from '@/lib/ai/format-ai-error';

const GenerateScriptOutlineInputSchema = z.object({
  coreIdea: z
    .string()
    .describe('The core idea or topic for the script outline.'),
});
export type GenerateScriptOutlineInput = z.infer<typeof GenerateScriptOutlineInputSchema>;

const GenerateScriptOutlineOutputSchema = z.object({
  scriptOutline: z.string().describe('The generated script outline (Hook, Story/Problem, Solution/Demo, CTA).'),
});
export type GenerateScriptOutlineOutput = z.infer<typeof GenerateScriptOutlineOutputSchema>;

export async function generateScriptOutline(input: GenerateScriptOutlineInput): Promise<GenerateScriptOutlineOutput> {
  try {
    return await generateScriptOutlineFlow(input);
  } catch (error) {
    throw new Error(formatAiError(error));
  }
}

const prompt = ai.definePrompt({
  name: 'generateScriptOutlinePrompt',
  model: gemini15Flash,
  input: {schema: GenerateScriptOutlineInputSchema},
  output: {schema: GenerateScriptOutlineOutputSchema},
  prompt: `You are a creative scriptwriter. Generate a concise and engaging script outline for a short social media video.
The script should include these sections: Hook, Story/Problem, Solution/Demo, and Call to Action (CTA).

Core Idea for the video: {{{coreIdea}}}

Format the output as a JSON object with a single key "scriptOutline" containing the full script as a string.
Example Script Outline:
1. HOOK: [Catchy opening line or question]
2. STORY/PROBLEM: [Briefly explain the context or the problem being addressed]
3. SOLUTION/DEMO: [Showcase the solution or demonstrate the concept]
4. CTA: [What do you want the viewer to do next?]
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

const generateScriptOutlineFlow = ai.defineFlow(
  {
    name: 'generateScriptOutlineFlow',
    inputSchema: GenerateScriptOutlineInputSchema,
    outputSchema: GenerateScriptOutlineOutputSchema,
  },
  async input => {
    const {output} = await executePromptWithModelFallback(prompt, input);
    return output!;
  }
);
