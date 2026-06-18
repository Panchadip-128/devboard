import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/webhooks/github/route';

describe('GitHub Webhook Integration', () => {
  it('should reject requests with invalid HMAC signatures', async () => {
    const mockPayload = { action: 'opened', repository: { id: 123 } };
    
    const req = new NextRequest('http://localhost:3000/api/webhooks/github', {
      method: 'POST',
      body: JSON.stringify(mockPayload),
      headers: {
        'content-type': 'application/json',
        'x-hub-signature-256': 'sha256=invalid_signature_here',
        'x-github-event': 'pull_request',
      }
    });

    const response = await POST(req);
    
    // Should return 401 Unauthorized due to invalid signature
    expect(response.status).toBe(401);
  });
  
  it('should require x-hub-signature-256 header', async () => {
    const req = new NextRequest('http://localhost:3000/api/webhooks/github', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: {
        'content-type': 'application/json',
        'x-github-event': 'pull_request',
      }
    });

    const response = await POST(req);
    expect(response.status).toBe(401);
  });
});
