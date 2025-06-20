
import {NextResponse} from 'next/server';
import {defineFlow, runFlow} from 'genkit';
import * as z from 'zod';

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
};

export async function POST(req: Request, {params}: {params: {slug: string[]}}) {
  const flowName = params.slug.join('/');

  if (flows[flowName]) {
    try {
      const input = await req.json();
      // Note: Direct use of runFlow like this is generally for client-side invocation or specific scenarios.
      // For server-to-server or more complex patterns, you might invoke flows differently.
      const result = await runFlow(flows[flowName], input);
      return NextResponse.json(result);
    } catch (error: any) {
      console.error(`Error running flow ${flowName}:`, error);
      return NextResponse.json({error: `Failed to run flow: ${error.message || 'Unknown error'}`}, {status: 500});
    }
  }

  return NextResponse.json({error: 'Flow not found'}, {status: 404});
}
