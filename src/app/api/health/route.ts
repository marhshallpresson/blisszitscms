import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: 'blisszits-web',
      timestamp: new Date().toISOString(),
      runtime: 'nextjs-app-router',
    },
    { status: 200 }
  );
}
