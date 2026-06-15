/**
 * Least Recently Used (LRU) Cache with Time-To-Live (TTL).
 * This demonstrates System Design fundamentals for optimizing heavy analytical queries
 * without falling over during high traffic spikes.
 */

export class LRUCache<T> {
  private capacity: number;
  private cache: Map<string, { value: T; expiresAt: number }>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map(); // Maps in JS maintain insertion order
  }

  get(key: string): T | null {
    if (!this.cache.has(key)) return null;

    const item = this.cache.get(key)!;
    
    // Check TTL expiration
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Move to end (making it the most recently used)
    this.cache.delete(key);
    this.cache.set(key, item);
    return item.value;
  }

  set(key: string, value: T, ttlSeconds: number = 60): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Evict least recently used (first item in the Map)
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000
    });
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }
}

// Global instance specifically for caching heavy DORA metrics
export const doraMetricsCache = new LRUCache<any>(100);
