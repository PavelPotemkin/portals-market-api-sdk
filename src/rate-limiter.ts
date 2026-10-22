/**
 * Пауза на `ms`, прерываемая сигналом. При отмене reject с `signal.reason`.
 */
export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }
    const onAbort = () => {
      clearTimeout(timer);
      reject(signal?.reason);
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

/**
 * Скользящее окно 1 с на ключ. Состояние живёт в памяти одного экземпляра:
 * несколько клиентов или процессов на один токен лимит не делят.
 */
export class RateLimiter {
  private buckets = new Map<string, number[]>();

  /** Ждёт свободный слот для `key` при лимите `limit` запросов в секунду. */
  async wait(key: string, limit: number, signal?: AbortSignal): Promise<void> {
    for (;;) {
      if (signal?.aborted) throw signal.reason;
      const now = Date.now();
      let timestamps = this.buckets.get(key);
      if (!timestamps) {
        timestamps = [];
        this.buckets.set(key, timestamps);
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
      await sleep(Math.max(1, retryAfterMs), signal);
    }
  }

  reset(): void {
    this.buckets.clear();
  }
}
