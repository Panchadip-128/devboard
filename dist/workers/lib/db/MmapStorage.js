"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MmapStorage = void 0;
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
/**
 * Phase 5: Operating System File Mapping.
 * Simulates an `mmap` syscall by interacting directly with raw file descriptors.
 * This bypasses Postgres entirely, writing raw ArrayBuffers directly to disk.
 */
var MmapStorage = /** @class */ (function () {
    function MmapStorage(filename, initialSize) {
        if (initialSize === void 0) { initialSize = 1024 * 1024; }
        this.filePath = path_1.default.resolve(process.cwd(), '.data', filename);
        // Ensure dir exists
        var dir = path_1.default.dirname(this.filePath);
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        // Open file synchronously for raw OS file descriptor (fd)
        this.fd = fs_1.default.openSync(this.filePath, 'a+');
        // In a real C++ addon, we would map the memory here.
        // For Node.js, we simulate it via synchronous fd reading/writing.
    }
    /**
     * Reads a raw Float64 contiguous memory block from the file descriptor.
     */
    MmapStorage.prototype.readColumn = function (offset, length) {
        var buffer = Buffer.alloc(length * 8); // 8 bytes per Float64
        fs_1.default.readSync(this.fd, buffer, 0, buffer.length, offset);
        return new Float64Array(buffer.buffer, buffer.byteOffset, length);
    };
    /**
     * Writes a raw Float64 block directly to disk via the file descriptor.
     */
    MmapStorage.prototype.writeColumn = function (offset, data) {
        var buffer = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
        fs_1.default.writeSync(this.fd, buffer, 0, buffer.length, offset);
    };
    MmapStorage.prototype.close = function () {
        fs_1.default.closeSync(this.fd);
    };
    return MmapStorage;
}());
exports.MmapStorage = MmapStorage;
