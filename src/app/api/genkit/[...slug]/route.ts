// src/app/api/genkit/[...slug]/route.ts
// Legacy endpoint kept for backward compatibility.
// Current app calls Genkit flows through server actions instead of this route.

import { NextResponse } from 'next/server';

export async function POST(
  _req: Request,
  context: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await context.params;
  return NextResponse.json(
    {
      error: `Legacy Genkit route '${slug.join('/')}' is not active. Use server actions.`,
    },
    { status: 410 }
  );
}
