// src/ai/flows/generate-content-ideas.ts
'use server';

/**
 * @fileOverview An AI agent that generates content ideas based on a given topic and user interests.
 *
 * - generateContentIdeas - A function that generates content ideas.
 * - GenerateContentIdeasInput - The input type for the generateContentIdeas function.
 * - GenerateContentIdeasOutput - The output type for the generateContentIdeas function.
 */

import {ai, gemini15Flash} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateContentIdeasInputSchema = z.object({
  topic: z
    .string()
    .describe('The topic to generate content ideas for.'),
  numIdeas: z.number().describe('The number of content ideas to generate.'),
  interests: z.array(z.string()).optional().describe('A list of user interests for personalization.'),
});
export type GenerateContentIdeasInput = z.infer<typeof GenerateContentIdeasInputSchema>;

const ContentIdeaSchema = z.object({
  title: z.string().describe('The title of the content idea.'),
  description: z.string().describe('A brief description of the content idea.'),
});

const GenerateContentIdeasOutputSchema = z.array(ContentIdeaSchema).describe('An array of content ideas.');
export type GenerateContentIdeasOutput = z.infer<typeof GenerateContentIdeasOutputSchema>;

export async function generateContentIdeas(input: GenerateContentIdeasInput): Promise<GenerateContentIdeasOutput> {
  return generateContentIdeasFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateContentIdeasPrompt',
  model: gemini15Flash,
  input: {schema: GenerateContentIdeasInputSchema},
  output: {schema: GenerateContentIdeasOutputSchema},
  prompt: `You are a content creation expert, skilled at generating engaging content ideas.

  Generate {{numIdeas}} diverse and trending content ideas for the topic: {{{topic}}}. For each idea, provide a catchy title and a brief, one-sentence description.
  
  {{#if interests}}
  The user has expressed interest in the following areas, so please tailor the ideas to be relevant to them: {{#each interests}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.
  {{/if}}

  Format the output as a JSON array of objects, each with "title" and "description" keys.
  `,config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const generateContentIdeasFlow = ai.defineFlow(
  {
    name: 'generateContentIdeasFlow',
    inputSchema: GenerateContentIdeasInputSchema,
    outputSchema: GenerateContentIdeasOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
