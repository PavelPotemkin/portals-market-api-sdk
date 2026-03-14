export interface RateLimitResult {
  allowed: boolean;
  retryAfterMs: number;
}

export class RateLimiter {
  private buckets = new Map<string, number[]>();

  check(key: string, limit: number): RateLimitResult {
    const now = Date.now();
    const timestamps = this.buckets.get(key);

    if (!timestamps) {
      this.buckets.set(key, [now]);
      return { allowed: true, retryAfterMs: 0 };
    }

    const cutoff = now - 1000;
    const firstValid = timestamps.findIndex((t) => t > cutoff);
    if (firstValid === -1) {
      timestamps.length = 0;
    } else if (firstValid > 0) {
      timestamps.splice(0, firstValid);
    }

    if (timestamps.length >= limit) {
      const retryAfterMs = 1000 - (now - timestamps[0]);
      return { allowed: false, retryAfterMs: Math.max(1, retryAfterMs) };
    }

    timestamps.push(now);
    return { allowed: true, retryAfterMs: 0 };
  }

  reset(): void {
    this.buckets.clear();
  }
}
