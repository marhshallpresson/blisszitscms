// src/ai/flows/generate-content-ideas.ts
'use server';

import { ai, geminiModelChain } from '@/ai/genkit';
import { z } from 'genkit';
import { executePromptWithModelFallback } from '@/lib/ai/execute-prompt-with-model-fallback';
import { formatAiError } from '@/lib/ai/format-ai-error';

const GenerateContentIdeasInputSchema = z.object({
  topic: z.string().describe('The topic to generate content ideas for.'),
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

/**
 * Define the Prompt
 * NOTE: We use the first model in the chain as the baseline.
 */
const contentPrompt = ai.definePrompt({
  name: 'generateContentIdeasPrompt',
  // Use the first string from our verified chain
  model: geminiModelChain[0], 
  input: { schema: GenerateContentIdeasInputSchema },
  output: { schema: GenerateContentIdeasOutputSchema },
  prompt: `You are a content creation expert, skilled at generating engaging content ideas.

  Generate {{numIdeas}} diverse and trending content ideas for the topic: {{{topic}}}. For each idea, provide a catchy title and a brief, one-sentence description.
  
  {{#if interests}}
  The user has expressed interest in the following areas, so please tailor the ideas to be relevant to them: {{#each interests}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.
  {{/if}}

  Format the output as a JSON array of objects, each with "title" and "description" keys.
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

/**
 * Define the Flow
 */
const generateContentIdeasFlow = ai.defineFlow(
  {
    name: 'generateContentIdeasFlow',
    inputSchema: GenerateContentIdeasInputSchema,
    outputSchema: GenerateContentIdeasOutputSchema,
  },
  async (input) => {
    // This helper now iterates through geminiModelChain defined in genkit.ts
    const result = await executePromptWithModelFallback(contentPrompt, input);
    return result.output!;
  }
);

/**
 * Primary Exported Function (Server Action)
 */
export async function generateContentIdeas(input: GenerateContentIdeasInput): Promise<GenerateContentIdeasOutput> {
  try {
    // We call the flow directly
    return await generateContentIdeasFlow(input);
  } catch (error) {
    // formatAiError will now show the specific model failure message
    throw new Error(formatAiError(error));
  }
}
