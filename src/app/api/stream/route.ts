export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode('data: {"status": "connected"}\n\n'));

      const interval = setInterval(() => {
        const payload = JSON.stringify({ type: "ping", metric: "heartbeat", time: new Date().toISOString() });
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
      }, 3000);

      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
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
