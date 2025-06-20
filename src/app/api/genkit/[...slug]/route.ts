// src/app/api/genkit/[...slug]/route.ts
// This file is being kept for potential future use if Genkit AI features
// are integrated (e.g., for an AI-powered contact form analysis, etc.).
// For the current basic corporate site, it is not actively used by the frontend.

import {NextResponse} from 'next/server';
import {runFlow} from 'genkit'; // defineFlow removed as flows are defined elsewhere

// Import specific flows - these will be unused if no client-side calls are made.
// The flows themselves will still be defined in their respective files.
import {generateContentIdeas} from '@/ai/flows/generate-content-ideas';
import {generateScriptOutline} from '@/ai/flows/generate-script-outline';
import {draftCaption} from '@/ai/flows/draft-caption';
import {suggestHashtags} from '@/ai/flows/suggest-hashtags';

// Define a map for flows to avoid large if-else chains
const flows: Record<string, any> = {
  generateContentIdeas,
  generateScriptOutline,
  draftCaption,
  suggestHashtags,
  // Add other flows here if they are intended to be called via this API route
};

export async function POST(req: Request, {params}: {params: {slug: string[]}}) {
  const flowName = params.slug.join('/');

  if (flows[flowName]) {
    try {
      const input = await req.json();
      // Note: Direct use of runFlow like this is generally for client-side invocation.
      const result = await runFlow(flows[flowName], input);
      return NextResponse.json(result);
    } catch (error: any) {
      console.error(`Error running flow ${flowName}:`, error);
      return NextResponse.json({error: `Failed to run flow: ${error.message || 'Unknown error'}`}, {status: 500});
    }
  }

  return NextResponse.json({error: 'Flow not found'}, {status: 404});
}
