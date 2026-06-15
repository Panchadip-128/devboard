import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getQueue } from '@/lib/queue';

const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || 'secret';

function verifySignature(req: NextRequest, body: string) {
  const signature = req.headers.get('x-hub-signature-256');
  if (!signature) return false;

  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const expectedSignature = `sha256=${hmac.update(body).digest('hex')}`;
  
  if (signature.length !== expectedSignature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

export async function POST(req: NextRequest) {
  const bodyText = await req.text();
  
  // Disable signature verification in local dev if secret is not set properly, or enforce it
  if (process.env.NODE_ENV === 'production' && !verifySignature(req, bodyText)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const eventType = req.headers.get('x-github-event') || 'unknown';
  const payload = JSON.parse(bodyText);

  // Enqueue job to pg-boss
  const queue = await getQueue();
  await queue.send('github-webhook', { eventType, payload });

  return NextResponse.json({ status: 'queued' });
}
