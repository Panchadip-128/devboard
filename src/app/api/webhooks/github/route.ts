import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getQueue } from '@/lib/queue';

const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || 'secret';

/**
 * Cryptographically verifies the incoming GitHub webhook payload.
 * Prevents spoofing attacks by hashing the raw body with our shared secret
 * and comparing it against the `x-hub-signature-256` header in constant time.
 * 
 * @param req - The Next.js request object containing the headers
 * @param body - The raw unparsed string body of the request
 * @returns boolean - True if the signature matches, false otherwise
 */
function verifySignature(req: NextRequest, body: string) {
  const signature = req.headers.get('x-hub-signature-256');
  if (!signature) return false;

  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const expectedSignature = `sha256=${hmac.update(body).digest('hex')}`;
  
  if (signature.length !== expectedSignature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

/**
 * GitHub Webhook Ingestion Endpoint.
 * 
 * This endpoint strictly acts as a lightweight receiver. It validates the payload
 * and immediately offloads the processing to a PostgreSQL-backed queue (`pg-boss`).
 * This prevents dropped webhooks during traffic spikes and ensures exactly-once delivery.
 */
export async function POST(req: NextRequest) {
  const bodyText = await req.text();
  
  // Disable signature verification in local dev if secret is not set properly, or enforce it
  if (process.env.NODE_ENV === 'production' && !verifySignature(req, bodyText)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const eventType = req.headers.get('x-github-event') || 'unknown';
  const payload = JSON.parse(bodyText);

  // Enqueue job to pg-boss with robust Distributed System parameters
  const queue = await getQueue();
  await queue.send('github-webhook', { eventType, payload }, {
    retryLimit: 5,
    retryBackoff: true, // Exponential backoff
    retryDelay: 30, // 30s base delay
    expireInSeconds: 300, // Timeout job after 5 minutes
    deadLetter: 'dlq-github-webhook' // Send to DLQ on final failure
  });

  return NextResponse.json({ status: 'queued' });
}
