"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var worker_threads_1 = require("worker_threads");
var RingBuffer_1 = require("../lib/hft/RingBuffer");
var MmapStorage_1 = require("../lib/db/MmapStorage");
var ioredis_1 = __importDefault(require("ioredis"));
// The worker thread receives the SharedArrayBuffer via workerData
var sharedBuffer = worker_threads_1.workerData.sharedBuffer;
var ringBuffer = new RingBuffer_1.LockFreeRingBuffer(10000, sharedBuffer);
var storage = new MmapStorage_1.MmapStorage('telemetry.bin');
var writeOffset = 0;
// Need a separate Redis connection for the worker thread
var redis = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379');
console.log('[Telemetry Worker] Booted up. Thread isolated. Listening on SharedArrayBuffer.');
function drainBuffer() {
    return __awaiter(this, void 0, void 0, function () {
        var batch, val, floatArray;
        return __generator(this, function (_a) {
            batch = [];
            val = ringBuffer.pop();
            while (val !== null) {
                batch.push(val);
                val = ringBuffer.pop();
            }
            if (batch.length > 0) {
                floatArray = new Float64Array(batch);
                storage.writeColumn(writeOffset, floatArray);
                writeOffset += floatArray.byteLength;
                console.log("[Telemetry Worker] Flushed ".concat(batch.length, " events to MmapStorage directly via OS syscalls in sub-millisecond time."));
                // Publish to the SSE pipeline for real-time dashboard updates
                try {
                    redis.publish('realtime-updates', JSON.stringify({
                        type: 'TELEMETRY_BATCH_FLUSHED',
                        count: batch.length,
                        timestamp: Date.now()
                    }));
                }
                catch (e) {
                    console.error('[Telemetry Worker] Failed to publish to Redis', e);
                }
            }
            return [2 /*return*/];
        });
    });
}
// The core lock-free event loop
function runLoop() {
    return __awaiter(this, void 0, void 0, function () {
        var status_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!true) return [3 /*break*/, 3];
                    status_1 = ringBuffer.waitForData(5000);
                    if (!(status_1 === 'ok' || status_1 === 'not-equal')) return [3 /*break*/, 2];
                    // Data arrived! Drain the ring buffer.
                    return [4 /*yield*/, drainBuffer()];
                case 1:
                    // Data arrived! Drain the ring buffer.
                    _a.sent();
                    _a.label = 2;
                case 2: return [3 /*break*/, 0];
                case 3: return [2 /*return*/];
            }
        });
    });
}
runLoop().catch(console.error);
