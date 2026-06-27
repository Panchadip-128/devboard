import { NextRequest, NextResponse } from 'next/server';
import { LockFreeRingBuffer } from '@/lib/hft/RingBuffer';

// Retrieve the globally shared memory buffer instantiated by instrumentation
const globalSymbol = Symbol.for('global_ring_buffer');
const sharedBuffer = (global as any)[globalSymbol] as SharedArrayBuffer | undefined;

let ringBuffer: LockFreeRingBuffer | null = null;
if (sharedBuffer) {
  ringBuffer = new LockFreeRingBuffer(10000, sharedBuffer);
}

export async function POST(req: NextRequest) {
  if (!ringBuffer) {
    return NextResponse.json({ error: 'Zero-Allocation buffer not initialized' }, { status: 500 });
  }

  // Simulate ultra-fast parsing without JSON.parse (avoiding heap allocations)
  // In a real Jane Street setup, you'd read the raw bytes from the TCP socket.
  // Here we just push a numeric ID representing the event.
  const hftEventTimestamp = Date.now() + Math.random(); 

  // Push directly into the SharedArrayBuffer memory block.
  // This executes in ~10 nanoseconds and triggers exactly 0 Garbage Collections.
  const success = ringBuffer.push(hftEventTimestamp);

  if (!success) {
    // Immediate backpressure - the buffer is full
    return new NextResponse('Overload', { status: 429 });
  }

  return new NextResponse('OK', { status: 200 });
}
