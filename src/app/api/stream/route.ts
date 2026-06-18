import redis from '@/lib/redis';

export const dynamic = 'force-dynamic';

/**
 * Real-Time Server-Sent Events (SSE) Pipeline.
 * 
 * This endpoint establishes a unidirectional, persistent HTTP connection with the browser.
 * It uses a duplicated Redis client to subscribe to the `realtime-updates` Pub/Sub channel.
 * 
 * Architecture Trade-off: We chose SSE over WebSockets because the DevBoard dashboard is 
 * purely a *consumer* of real-time metrics. SSE has significantly less handshake overhead, 
 * natively handles connection drops/reconnects, and effortlessly bypasses restrictive corporate firewalls.
 */
export async function GET(request: Request) {
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode('data: {"status": "connected"}\\n\\n'));

      // Create a dedicated Redis subscriber to avoid blocking the main client
      const subscriber = redis.duplicate();
      await subscriber.subscribe('realtime-updates');

      subscriber.on('message', (channel, message) => {
        if (channel === 'realtime-updates') {
          controller.enqueue(encoder.encode(`data: ${message}\\n\\n`));
        }
      });

      // Keep-alive heartbeat
      const interval = setInterval(() => {
        const payload = JSON.stringify({ type: "ping", time: new Date().toISOString() });
        controller.enqueue(encoder.encode(`data: ${payload}\\n\\n`));
      }, 15000);

      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        subscriber.unsubscribe();
        subscriber.quit();
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
