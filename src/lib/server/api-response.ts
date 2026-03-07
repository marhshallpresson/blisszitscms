import { NextResponse } from 'next/server';

export const toApiError = (error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unexpected error.';
  const normalized = message.toLowerCase();

  if (normalized.includes('missing bearer token') || normalized.includes('verifyidtoken') || normalized.includes('unauthorized')) {
    return NextResponse.json({ error: message }, { status: 401 });
  }
  if (normalized.includes('forbidden')) {
    return NextResponse.json({ error: message }, { status: 403 });
  }
  if (normalized.includes('not found')) {
    return NextResponse.json({ error: message }, { status: 404 });
  }
  if (normalized.includes('invalid') || normalized.includes('must') || normalized.includes('missing')) {
    return NextResponse.json({ error: message }, { status: 400 });
  }
  return NextResponse.json({ error: message }, { status: 500 });
};
