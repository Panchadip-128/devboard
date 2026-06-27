import { MmapStorage } from './MmapStorage';

/**
 * Phase 5: Columnar Database Manager.
 * Instead of storing data as Rows (JSON/Postgres), it stores data as contiguous
 * contiguous columns (Float64Arrays). This optimizes CPU cache locality and allows
 * for SIMD-style aggregations millions of times faster than traditional DBs.
 */
export class ColumnManager {
  private storage: MmapStorage;
  private rowCount: number = 0;

  // Track the byte offset of each column block in the memory-mapped file
  private columns = {
    riskScore: 0,
    impact: 10000 * 8,      // Allocating space for 10k rows prototype
    developerId: 20000 * 8,
  };

  constructor() {
    this.storage = new MmapStorage('telemetry.db', 1024 * 1024);
  }

  /**
   * Translates a JSON Row into a Columnar slice and writes to raw memory.
   */
  public insertRow(riskScore: number, impact: number, devId: number) {
    if (this.rowCount >= 10000) return; 

    this.storage.writeColumn(
      this.columns.riskScore + (this.rowCount * 8), 
      new Float64Array([riskScore])
    );

    this.storage.writeColumn(
      this.columns.impact + (this.rowCount * 8), 
      new Float64Array([impact])
    );

    this.storage.writeColumn(
      this.columns.developerId + (this.rowCount * 8), 
      new Float64Array([devId])
    );

    this.rowCount++;
  }

  /**
   * Fast Columnar Aggregation
   * Reads an entire column in a single syscall and aggregates it at the speed of RAM.
   */
  public getAverageRiskScore(): number {
    if (this.rowCount === 0) return 0;
    
    // Read the entire contiguous memory block 
    const riskScores = this.storage.readColumn(this.columns.riskScore, this.rowCount);
    
    let total = 0;
    for (let i = 0; i < riskScores.length; i++) {
      total += riskScores[i];
    }
    
    return total / riskScores.length;
  }
}

// Global Singleton for the architecture prototype
const globalSymbol = Symbol.for('global_column_db');
if (!(global as any)[globalSymbol]) {
  (global as any)[globalSymbol] = new ColumnManager();
}

export const columnDb: ColumnManager = (global as any)[globalSymbol];
