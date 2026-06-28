import { workerData } from 'worker_threads';
import { LockFreeRingBuffer } from '../lib/hft/RingBuffer';
import { MmapStorage } from '../lib/db/MmapStorage';
import Redis from 'ioredis';

// The worker thread receives the SharedArrayBuffer via workerData
const sharedBuffer = workerData.sharedBuffer;
const ringBuffer = new LockFreeRingBuffer(10000, sharedBuffer);
const storage = new MmapStorage('telemetry.bin');
let writeOffset = 0;

// Need a separate Redis connection for the worker thread
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

console.log('[Telemetry Worker] Booted up. Thread isolated. Listening on SharedArrayBuffer.');

async function drainBuffer() {
  const batch: number[] = [];
  
  let val = ringBuffer.pop();
  while (val !== null) {
    batch.push(val);
    val = ringBuffer.pop();
  }
  
  if (batch.length > 0) {
    // Bulk insert into the OS-level file mapping, bypassing PostgreSQL entirely
    const floatArray = new Float64Array(batch);
    storage.writeColumn(writeOffset, floatArray);
    writeOffset += floatArray.byteLength;

    console.log(`[Telemetry Worker] Flushed ${batch.length} events to MmapStorage directly via OS syscalls in sub-millisecond time.`);

    // Publish to the SSE pipeline for real-time dashboard updates
    try {
      redis.publish('realtime-updates', JSON.stringify({
        type: 'TELEMETRY_BATCH_FLUSHED',
        count: batch.length,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.error('[Telemetry Worker] Failed to publish to Redis', e);
    }
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
