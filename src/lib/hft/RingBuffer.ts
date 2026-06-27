/**
 * A Zero-Allocation, Lock-Free Ring Buffer using SharedArrayBuffer.
 * Designed for High-Frequency Telemetry Ingestion (SPSC pattern).
 * Bypasses V8 Garbage Collection entirely for hot-path ingestion.
 */
export class LockFreeRingBuffer {
  private buffer: SharedArrayBuffer;
  private header: Int32Array; // [HEAD, TAIL]
  private data: Float64Array; 
  private capacity: number;
  private readonly HEAD_INDEX = 0;
  private readonly TAIL_INDEX = 1;

  constructor(capacity: number, sharedBuffer?: SharedArrayBuffer) {
    this.capacity = capacity;
    
    // Header needs 2 int32s = 8 bytes.
    // Data needs capacity * 8 bytes (Float64).
    const byteLength = 8 + (capacity * 8);
    this.buffer = sharedBuffer || new SharedArrayBuffer(byteLength);
    
    // Byte offset 0 for headers
    this.header = new Int32Array(this.buffer, 0, 2);
    // Byte offset 8 for data
    this.data = new Float64Array(this.buffer, 8, capacity);
  }

  public getSharedBuffer(): SharedArrayBuffer {
    return this.buffer;
  }

  /**
   * Called by the Next.js API Route (Producer)
   * Writes data without allocating any JS objects on the heap.
   */
  public push(value: number): boolean {
    const head = Atomics.load(this.header, this.HEAD_INDEX);
    const tail = Atomics.load(this.header, this.TAIL_INDEX);
    
    const nextHead = (head + 1) % this.capacity;
    
    if (nextHead === tail) {
      // Buffer full - backpressure applied instantly
      return false; 
    }
    
    // Write data. Safe in SPSC since consumer only reads up to HEAD.
    this.data[head] = value;
    
    // Memory fence and atomic publish of new HEAD
    Atomics.store(this.header, this.HEAD_INDEX, nextHead);
    
    // Wake up the worker thread waiting on HEAD
    Atomics.notify(this.header, this.HEAD_INDEX, 1);
    
    return true;
  }

  /**
   * Called by the Worker Thread (Consumer)
   */
  public pop(): number | null {
    const head = Atomics.load(this.header, this.HEAD_INDEX);
    const tail = Atomics.load(this.header, this.TAIL_INDEX);
    
    if (head === tail) {
      return null; // Empty
    }
    
    const value = this.data[tail];
    const nextTail = (tail + 1) % this.capacity;
    
    // Atomic publish of new TAIL
    Atomics.store(this.header, this.TAIL_INDEX, nextTail);
    
    return value;
  }

  /**
   * Pauses the V8 thread at the OS level until new data arrives.
   * Zero CPU spin-wait overhead.
   */
  public waitForData(timeoutMs: number): 'ok' | 'not-equal' | 'timed-out' {
    const head = Atomics.load(this.header, this.HEAD_INDEX);
    const tail = Atomics.load(this.header, this.TAIL_INDEX);
    
    if (head !== tail) return 'not-equal'; // Data already available

    // Put thread to sleep until HEAD changes
    return Atomics.wait(this.header, this.HEAD_INDEX, head, timeoutMs);
  }
}
