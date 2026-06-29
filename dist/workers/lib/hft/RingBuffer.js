"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LockFreeRingBuffer = void 0;
/**
 * A Zero-Allocation, Lock-Free Ring Buffer using SharedArrayBuffer.
 * Designed for High-Frequency Telemetry Ingestion (SPSC pattern).
 * Bypasses V8 Garbage Collection entirely for hot-path ingestion.
 */
var LockFreeRingBuffer = /** @class */ (function () {
    function LockFreeRingBuffer(capacity, sharedBuffer) {
        this.HEAD_INDEX = 0;
        this.TAIL_INDEX = 1;
        this.capacity = capacity;
        // Header needs 2 int32s = 8 bytes.
        // Data needs capacity * 8 bytes (Float64).
        var byteLength = 8 + (capacity * 8);
        this.buffer = sharedBuffer || new SharedArrayBuffer(byteLength);
        // Byte offset 0 for headers
        this.header = new Int32Array(this.buffer, 0, 2);
        // Byte offset 8 for data
        this.data = new Float64Array(this.buffer, 8, capacity);
    }
    LockFreeRingBuffer.prototype.getSharedBuffer = function () {
        return this.buffer;
    };
    /**
     * Called by the Next.js API Route (Producer)
     * Writes data without allocating any JS objects on the heap.
     */
    LockFreeRingBuffer.prototype.push = function (value) {
        var head = Atomics.load(this.header, this.HEAD_INDEX);
        var tail = Atomics.load(this.header, this.TAIL_INDEX);
        var nextHead = (head + 1) % this.capacity;
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
    };
    /**
     * Called by the Worker Thread (Consumer)
     */
    LockFreeRingBuffer.prototype.pop = function () {
        var head = Atomics.load(this.header, this.HEAD_INDEX);
        var tail = Atomics.load(this.header, this.TAIL_INDEX);
        if (head === tail) {
            return null; // Empty
        }
        var value = this.data[tail];
        var nextTail = (tail + 1) % this.capacity;
        // Atomic publish of new TAIL
        Atomics.store(this.header, this.TAIL_INDEX, nextTail);
        return value;
    };
    /**
     * Pauses the V8 thread at the OS level until new data arrives.
     * Zero CPU spin-wait overhead.
     */
    LockFreeRingBuffer.prototype.waitForData = function (timeoutMs) {
        var head = Atomics.load(this.header, this.HEAD_INDEX);
        var tail = Atomics.load(this.header, this.TAIL_INDEX);
        if (head !== tail)
            return 'not-equal'; // Data already available
        // Put thread to sleep until HEAD changes
        return Atomics.wait(this.header, this.HEAD_INDEX, head, timeoutMs);
    };
    return LockFreeRingBuffer;
}());
exports.LockFreeRingBuffer = LockFreeRingBuffer;
