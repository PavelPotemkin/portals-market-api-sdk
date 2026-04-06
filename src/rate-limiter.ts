const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export class RateLimiter {
  private buckets = new Map<string, number[]>();

  async wait(key: string, limit: number): Promise<void> {
    for (;;) {
      const now = Date.now();
      const timestamps = this.buckets.get(key);

      if (!timestamps) {
        this.buckets.set(key, [now]);
        return;
      }

      const cutoff = now - 1000;
      const firstValid = timestamps.findIndex((t) => t > cutoff);
      if (firstValid === -1) {
        timestamps.length = 0;
      } else if (firstValid > 0) {
        timestamps.splice(0, firstValid);
      }

      if (timestamps.length < limit) {
        timestamps.push(now);
        return;
      }

      const retryAfterMs = 1000 - (now - timestamps[0]);
      await sleep(Math.max(1, retryAfterMs));
    }
  }

  reset(): void {
    this.buckets.clear();
  }
}
