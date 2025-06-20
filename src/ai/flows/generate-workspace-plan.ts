// src/ai/flows/generate-workspace-plan.ts
'use server';
/**
 * @fileOverview An AI agent that generates a full content plan for a new workspace.
 *
 * - generateWorkspacePlan - A function that generates a workspace plan.
 * - GenerateWorkspacePlanInput - The input type for the generateWorkspacePlan function.
 * - GenerateWorkspacePlanOutput - The return type for the generateWorkspacePlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWorkspacePlanInputSchema = z.object({
  topic: z
    .string()
    .describe('The central topic or goal for the workspace content plan (e.g., "30-Day Fitness Challenge" or "Learn Photography Basics").'),
});
export type GenerateWorkspacePlanInput = z.infer<typeof GenerateWorkspacePlanInputSchema>;

const PlannedContentItemSchema = z.object({
    title: z.string().describe("A catchy, engaging title for the piece of content."),
    idea: z.string().describe("The core idea or brief for this content piece, outlining what it's about."),
    // Note: We are not asking for a full script or caption at this stage, just the initial plan.
});

const GenerateWorkspacePlanOutputSchema = z.object({
  workspaceName: z.string().describe("A suitable name for the workspace based on the topic."),
  workspaceDescription: z.string().describe("A brief, one-sentence description of the workspace's purpose."),
  contentPlan: z.array(PlannedContentItemSchema).describe("An array of 5-7 planned content items to seed the workspace."),
});
export type GenerateWorkspacePlanOutput = z.infer<typeof GenerateWorkspacePlanOutputSchema>;


export async function generateWorkspacePlan(input: GenerateWorkspacePlanInput): Promise<GenerateWorkspacePlanOutput> {
  return generateWorkspacePlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWorkspacePlanPrompt',
  input: {schema: GenerateWorkspacePlanInputSchema},
  output: {schema: GenerateWorkspacePlanOutputSchema},
  prompt: `You are a master content strategist. A user wants to create a new content workspace centered around a specific topic.
Your task is to generate a comprehensive starter plan for them.

The user's topic is: "{{{topic}}}"

Based on this topic, please provide:
1.  A short, catchy name for the workspace.
2.  A one-sentence description for the workspace.
3.  A content plan consisting of 5 to 7 distinct content items. For each item, provide a compelling title and a core idea/brief.

The plan should be logical and provide a good starting point for the user.
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

const generateWorkspacePlanFlow = ai.defineFlow(
  {
    name: 'generateWorkspacePlanFlow',
    inputSchema: GenerateWorkspacePlanInputSchema,
    outputSchema: GenerateWorkspacePlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
