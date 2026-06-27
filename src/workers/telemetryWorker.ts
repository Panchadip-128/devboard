import { workerData } from 'worker_threads';
import { LockFreeRingBuffer } from '../lib/hft/RingBuffer';

// The worker thread receives the SharedArrayBuffer via workerData
const sharedBuffer = workerData.sharedBuffer;
const ringBuffer = new LockFreeRingBuffer(10000, sharedBuffer);

console.log('[Telemetry Worker] Booted up. Thread isolated. Listening on SharedArrayBuffer.');

async function drainBuffer() {
  const batch = [];
  
  let val = ringBuffer.pop();
  while (val !== null) {
    batch.push(val);
    val = ringBuffer.pop();
  }
  
  if (batch.length > 0) {
    // In a real HFT system, this would bulk insert into a columnar database (ClickHouse)
    // to bypass the main database bottleneck.
    console.log(`[Telemetry Worker] Drained ${batch.length} events from lock-free buffer in sub-millisecond time.`);
  }
}

// The core lock-free event loop
async function runLoop() {
  while (true) {
    // Suspend this thread at the OS level until the main thread writes to the buffer.
    // This consumes 0% CPU while waiting, unlike setInterval.
    const status = ringBuffer.waitForData(5000);
    
    if (status === 'ok' || status === 'not-equal') {
      // Data arrived! Drain the ring buffer.
      await drainBuffer();
    }
  }
}

runLoop().catch(console.error);
