import fs from 'fs';
import path from 'path';

/**
 * Phase 5: Operating System File Mapping.
 * Simulates an `mmap` syscall by interacting directly with raw file descriptors.
 * This bypasses Postgres entirely, writing raw ArrayBuffers directly to disk.
 */
export class MmapStorage {
  private fd: number;
  private filePath: string;

  constructor(filename: string, initialSize: number = 1024 * 1024) {
    this.filePath = path.resolve(process.cwd(), '.data', filename);
    
    // Ensure dir exists
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Open file synchronously for raw OS file descriptor (fd)
    this.fd = fs.openSync(this.filePath, 'a+');
    
    // In a real C++ addon, we would map the memory here.
    // For Node.js, we simulate it via synchronous fd reading/writing.
  }

  /**
   * Reads a raw Float64 contiguous memory block from the file descriptor.
   */
  public readColumn(offset: number, length: number): Float64Array {
    const buffer = Buffer.alloc(length * 8); // 8 bytes per Float64
    fs.readSync(this.fd, buffer, 0, buffer.length, offset);
    return new Float64Array(buffer.buffer, buffer.byteOffset, length);
  }

  /**
   * Writes a raw Float64 block directly to disk via the file descriptor.
   */
  public writeColumn(offset: number, data: Float64Array) {
    const buffer = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
    fs.writeSync(this.fd, buffer, 0, buffer.length, offset);
  }

  public close() {
    fs.closeSync(this.fd);
  }
}
