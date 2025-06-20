
import {NextResponse} from 'next/server';
import {defineFlow, runFlow} from 'genkit';
import * as z from 'zod';

import {generateContentIdeas} from '@/ai/flows/generate-content-ideas';

export async function POST(req: Request, {params}: {params: {slug: string[]}}) {
  const flowName = params.slug.join('/');

  if (flowName === 'generateContentIdeas') {
    const input = await req.json();
    const result = await runFlow(generateContentIdeas, input);
    return NextResponse.json(result);
  }

  return NextResponse.json({error: 'Flow not found'}, {status: 404});
}
