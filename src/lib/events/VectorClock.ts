/**
 * Mathematical Vector Clock implementation for absolute causal ordering.
 * Resolves distributed race conditions (e.g. if events arrive out of order
 * due to network jitter or split-brain partitions).
 */
export class VectorClock {
  private clock: Map<string, number>;

  constructor(initialState?: Record<string, number>) {
    this.clock = new Map(Object.entries(initialState || {}));
  }

  public increment(nodeId: string): void {
    const current = this.clock.get(nodeId) || 0;
    this.clock.set(nodeId, current + 1);
  }

  public get(nodeId: string): number {
    return this.clock.get(nodeId) || 0;
  }

  public merge(other: VectorClock): void {
    for (const [nodeId, time] of other.clock.entries()) {
      const current = this.clock.get(nodeId) || 0;
      this.clock.set(nodeId, Math.max(current, time));
    }
  }

  public toJSON(): Record<string, number> {
    const obj: Record<string, number> = {};
    for (const [k, v] of this.clock.entries()) {
      obj[k] = v;
    }
    return obj;
  }

  /**
   * Determines causal ordering. Returns true if 'a' strictly happened before 'b'.
   */
  public static happensBefore(a: VectorClock, b: VectorClock): boolean {
    let strictSmaller = false;
    const allKeys = new Set([...a.clock.keys(), ...b.clock.keys()]);
    
    for (const key of allKeys) {
      const valA = a.get(key);
      const valB = b.get(key);
      if (valA > valB) return false;
      if (valA < valB) strictSmaller = true;
    }
    return strictSmaller;
  }

  /**
   * Returns true if 'a' and 'b' occurred concurrently with no causal relationship.
   */
  public static isConcurrent(a: VectorClock, b: VectorClock): boolean {
    return !this.happensBefore(a, b) && !this.happensBefore(b, a);
  }
}
