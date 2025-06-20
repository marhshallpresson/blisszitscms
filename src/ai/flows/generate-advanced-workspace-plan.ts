// src/ai/flows/generate-advanced-workspace-plan.ts
'use server';
/**
 * @fileOverview An AI agent that generates a full, detailed content plan for a new workspace based on topic, interests, and platforms.
 *
 * - generateAdvancedWorkspacePlan - A function that generates a workspace plan.
 * - GenerateAdvancedWorkspacePlanInput - The input type for the generateAdvancedWorkspacePlan function.
 * - GenerateAdvancedWorkspacePlanOutput - The return type for the generateAdvancedWorkspacePlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const GenerateAdvancedWorkspacePlanInputSchema = z.object({
  topic: z
    .string()
    .describe('The central topic or goal for the workspace content plan (e.g., "30-Day Fitness Challenge").'),
  interests: z.array(z.string()).optional().describe('A list of audience interests for personalization (e.g., "Healthy Cooking", "Yoga").'),
  platforms: z.array(z.string()).optional().describe('A list of target social media platforms (e.g., "Instagram", "TikTok").'),
});
export type GenerateAdvancedWorkspacePlanInput = z.infer<typeof GenerateAdvancedWorkspacePlanInputSchema>;

const PlannedContentItemSchema = z.object({
    title: z.string().describe("A catchy, engaging title for the piece of content."),
    idea: z.string().describe("The core idea or brief for this content piece, outlining what it's about."),
});

export const GenerateAdvancedWorkspacePlanOutputSchema = z.object({
  workspaceName: z.string().describe("A suitable name for the workspace based on the topic."),
  workspaceDescription: z.string().describe("A brief, one-sentence description of the workspace's purpose."),
  contentPlan: z.array(PlannedContentItemSchema).describe("An array of 5-7 planned content items to seed the workspace."),
});
export type GenerateAdvancedWorkspacePlanOutput = z.infer<typeof GenerateAdvancedWorkspacePlanOutputSchema>;


export async function generateAdvancedWorkspacePlan(input: GenerateAdvancedWorkspacePlanInput): Promise<GenerateAdvancedWorkspacePlanOutput> {
  return generateAdvancedWorkspacePlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAdvancedWorkspacePlanPrompt',
  input: {schema: GenerateAdvancedWorkspacePlanInputSchema},
  output: {schema: GenerateAdvancedWorkspacePlanOutputSchema},
  prompt: `You are a master content strategist and social media expert. A user wants to create a new content workspace and needs a comprehensive starter plan.

The user's central topic is: "{{{topic}}}"

{{#if platforms}}
The content should be optimized for the following platforms: {{#each platforms}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.
{{/if}}

{{#if interests}}
The target audience has these interests, so tailor the content accordingly: {{#each interests}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.
{{/if}}

Based on all this information, please provide:
1.  A short, catchy, and inspiring name for the workspace.
2.  A one-sentence description for the workspace's mission.
3.  A content plan consisting of 5 to 7 distinct content items. For each item, provide a compelling title and a core idea/brief that aligns with the topic, platforms, and interests.

The plan should be logical, creative, and provide a strong starting point for the user.
Format the output as a single JSON object with keys "workspaceName", "workspaceDescription", and "contentPlan".
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

const generateAdvancedWorkspacePlanFlow = ai.defineFlow(
  {
    name: 'generateAdvancedWorkspacePlanFlow',
    inputSchema: GenerateAdvancedWorkspacePlanInputSchema,
    outputSchema: GenerateAdvancedWorkspacePlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
