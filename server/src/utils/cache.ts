/**
 * Simple in-memory cache with TTL support.
 *
 * Purpose: Reduce Turso DB row reads by serving repeated GET requests
 * from memory instead of hitting the database on every call.
 *
 * Cache is busted explicitly on mutations (create / update / delete / charge / refund).
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number; // Unix timestamp (ms)
}

class InMemoryCache {
  private store = new Map<string, CacheEntry<any>>();

  /**
   * Get a cached value. Returns undefined if missing or expired.
   */
  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.data as T;
  }

  /**
   * Store a value in the cache with a TTL in seconds.
   */
  set<T>(key: string, data: T, ttlSeconds: number): void {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Invalidate one or more cache keys (exact match or prefix).
   * Pass a key ending with '*' to bust all keys with that prefix.
   */
  bust(keyOrPrefix: string): void {
    if (keyOrPrefix.endsWith("*")) {
      const prefix = keyOrPrefix.slice(0, -1);
      for (const k of this.store.keys()) {
        if (k.startsWith(prefix)) this.store.delete(k);
      }
    } else {
      this.store.delete(keyOrPrefix);
    }
  }

  /**
   * Bust all cached entries.
   */
  bustAll(): void {
    this.store.clear();
  }

  /** Current number of entries in cache (for debugging). */
  get size(): number {
    return this.store.size;
  }
}

// Singleton — shared across all routes in the same server process
export const cache = new InMemoryCache();

// ─── TTL constants (in seconds) ───────────────────────────────────────────────
export const TTL = {
  INVOICES: 5 * 60,       // 5 minutes — changes on create / pay / refund
  TRANSACTIONS: 5 * 60,   // 5 minutes — changes on charge / refund
  RECONCILIATION: 10 * 60,// 10 minutes — expensive + rarely changes mid-day
} as const;

// ─── Cache key constants ───────────────────────────────────────────────────────
export const CACHE_KEYS = {
  ALL_INVOICES: "invoices:all",
  ALL_TRANSACTIONS: "transactions:all",
  RECONCILIATION: (start: string, end: string) => `reconciliation:${start}:${end}`,
} as const;
