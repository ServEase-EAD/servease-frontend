/**
 * Request Cache Utility
 * Prevents duplicate API calls and provides caching mechanism
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  promise?: Promise<T>;
}

class RequestCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private pendingRequests: Map<string, Promise<unknown>> = new Map();

  /**
   * Get data from cache if not expired
   */
  get<T>(key: string, maxAge: number): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age > maxAge) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set data in cache with timestamp
   */
  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Execute request with deduplication
   * If the same request is pending, return the existing promise
   */
  async dedupe<T>(
    key: string,
    requestFn: () => Promise<T>,
    maxAge: number = 5 * 60 * 1000
  ): Promise<T> {
    // Check cache first
    const cached = this.get<T>(key, maxAge);
    if (cached !== null) {
      return cached;
    }

    // Check if request is already pending
    const pending = this.pendingRequests.get(key);
    if (pending) {
      return pending as Promise<T>;
    }

    // Execute new request
    const promise = requestFn()
      .then((data) => {
        this.set(key, data);
        this.pendingRequests.delete(key);
        return data;
      })
      .catch((error) => {
        this.pendingRequests.delete(key);
        throw error;
      });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  /**
   * Clear cache entry
   */
  clear(key: string): void {
    this.cache.delete(key);
    this.pendingRequests.delete(key);
  }

  /**
   * Clear all cache
   */
  clearAll(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  /**
   * Clear expired entries
   */
  clearExpired(maxAge: number): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > maxAge) {
        this.cache.delete(key);
      }
    }
  }
}

export const requestCache = new RequestCache();

// Clear expired cache entries every 5 minutes
setInterval(() => {
  requestCache.clearExpired(30 * 60 * 1000); // Clear entries older than 30 minutes
}, 5 * 60 * 1000);
