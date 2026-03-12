import { NextRequest, NextResponse } from 'next/server';
import { CloudTasksClient } from '@google-cloud/tasks';
import crypto from 'crypto';

const tasksClient = new CloudTasksClient();

function verifyMetaSignature(rawBody: string, signature: string): boolean {
  const expected = `sha256=${crypto
    .createHmac('sha256', process.env.META_APP_SECRET!)
    .update(rawBody)
    .digest('hex')}`;
  // Constant-time comparison
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch { return false; }
}

// GET: Meta webhook verification handshake
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (
    searchParams.get('hub.mode') === 'subscribe' &&
    searchParams.get('hub.verify_token') === process.env.META_WEBHOOK_VERIFY_TOKEN
  ) {
    return new Response(searchParams.get('hub.challenge'), { status: 200 });
  }
  return new Response('Forbidden', { status: 403 });
}

// POST: Receive event → validate → enqueue → 200 OK immediately
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-hub-signature-256') ?? '';

  if (!verifyMetaSignature(rawBody, signature)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const payload = JSON.parse(rawBody);

  // Construct the fully qualified queue name.
  // The location is usually the region where the queue was created.
  const parent = tasksClient.queuePath(
    process.env.FIREBASE_PROJECT_ID!,
    process.env.GOOGLE_CLOUD_REGION!,
    'webhook-processor' // Name of your Cloud Task queue for Meta webhooks
  );

  const task = {
    httpRequest: {
      httpMethod: 'POST',
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/meta/process`,
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Secret': process.env.INTERNAL_WEBHOOK_SECRET!,
      },
      body: Buffer.from(JSON.stringify(payload)).toString('base64'),
      oidcToken: {
        serviceAccountEmail: process.env.SERVICE_ACCOUNT_EMAIL!,
      },
    },
    // Retry up to 5 times with exponential backoff
    retryConfig: { maxAttempts: 5 },
  };

  try {
    await tasksClient.createTask({ parent, task });
  } catch (error) {
    console.error('Error enqueuing Meta webhook task:', error);
    // Even if enqueuing fails, we still return 200 to Meta to prevent retries from their end
    // The error should be logged and monitored.
  }

  // CRITICAL: Return 200 immediately — never process inline
  return NextResponse.json({ status: 'queued' }, { status: 200 });
}
