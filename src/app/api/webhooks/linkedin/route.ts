import { NextRequest, NextResponse } from 'next/server';
import { CloudTasksClient } from '@google-cloud/tasks';
// LinkedIn does not provide a webhook signature for POST requests to verify.
// Verification is done via GET request for challenge.
// For POST, we rely on the X-Internal-Secret for internal processing endpoint.

const tasksClient = new CloudTasksClient();

// GET: LinkedIn webhook verification handshake
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const challenge = searchParams.get('linkedin-challenge');
  if (challenge) {
    return new Response(challenge, { status: 200, headers: { 'Content-Type': 'text/plain' } });
  }
  return new Response('Forbidden', { status: 403 });
}

// POST: Receive event → enqueue → 200 OK immediately
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const payload = JSON.parse(rawBody);

  // Construct the fully qualified queue name.
  const parent = tasksClient.queuePath(
    process.env.FIREBASE_PROJECT_ID!,
    process.env.GOOGLE_CLOUD_REGION!,
    'linkedin-webhook-processor' // Name of your Cloud Task queue for LinkedIn webhooks
  );

  const task = {
    httpRequest: {
      httpMethod: 'POST',
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/linkedin/process`,
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Secret': process.env.INTERNAL_WEBHOOK_SECRET!,
      },
      body: Buffer.from(JSON.stringify(payload)).toString('base64'),
      oidcToken: {
        serviceAccountEmail: process.env.SERVICE_ACCOUNT_EMAIL!,
      },
    },
    retryConfig: { maxAttempts: 5 },
  };

  try {
    await tasksClient.createTask({ parent, task });
  } catch (error) {
    console.error('Error enqueuing LinkedIn webhook task:', error);
  }

  // CRITICAL: Return 200 immediately
  return NextResponse.json({ status: 'queued' }, { status: 200 });
}
