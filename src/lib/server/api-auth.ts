import type { NextRequest } from 'next/server';
import { getAdminAuth } from '@/lib/server/firebase-admin';

const readBearerToken = (request: NextRequest): string | null => {
  const header = request.headers.get('authorization');
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
  return token;
};

export const requireUserId = async (request: NextRequest): Promise<string> => {
  const token = readBearerToken(request);
  if (!token) {
    throw new Error('Missing bearer token.');
  }
  const decoded = await getAdminAuth().verifyIdToken(token);
  return decoded.uid;
};

export const requireInternalKey = (request: NextRequest): void => {
  const secret = process.env.INTERNAL_API_SECRET;
  if (!secret) {
    throw new Error('Missing INTERNAL_API_SECRET configuration.');
  }
  const key = request.headers.get('x-internal-api-key');
  if (!key || key !== secret) {
    throw new Error('Unauthorized internal request.');
  }
};
