import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_MAX_RPS, isOk, PortalsMarketClient, schemas } from "../src";
import { RateLimiter } from "../src/rate-limiter";
import { json, recordingFetch } from "./helpers";

describe("RateLimiter", () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("пропускает запросы в пределах лимита без задержки", async () => {
    for (let i = 0; i < 5; i++) {
      await limiter.wait("test", 5);
    }
  });

  it("ждёт при превышении лимита и пропускает после окна", async () => {
    for (let i = 0; i < 3; i++) {
      await limiter.wait("test", 3);
    }

    let resolved = false;
    const p = limiter.wait("test", 3).then(() => {
      resolved = true;
    });

    await vi.advanceTimersByTimeAsync(0);
    expect(resolved).toBe(false);

    await vi.advanceTimersByTimeAsync(1000);
    await p;
    expect(resolved).toBe(true);
  });

  it("разные ключи не влияют друг на друга", async () => {
    for (let i = 0; i < 2; i++) {
      await limiter.wait("a", 2);
    }

    let aResolved = false;
    void limiter.wait("a", 2).then(() => {
      aResolved = true;
    });

    await limiter.wait("b", 2);
    expect(aResolved).toBe(false);
  });

  it("reset очищает все бакеты", async () => {
    for (let i = 0; i < 2; i++) {
      await limiter.wait("a", 2);
    }
    limiter.reset();
    await limiter.wait("a", 2);
  });

  it("ожидание прерывается сигналом", async () => {
    await limiter.wait("a", 1);
    const controller = new AbortController();
    const p = limiter.wait("a", 1, controller.signal);
    controller.abort(new Error("stop"));
    await expect(p).rejects.toThrow("stop");
  });
});

describe("PortalsMarketClient rate limiting", () => {
  const marketConfig = {
    commission: "5",
    cooldown: 0,
    deposit_wallet: "x",
    rub_course: "90",
    usd_course: "3",
    user_cashback: "0",
  };

  function createClient(
    config: { rateLimiting?: boolean; maxRps?: number } = {},
    headers: Record<string, string> = {},
  ) {
    const rec = recordingFetch(() => json(marketConfig, 200, headers));
    const client = new PortalsMarketClient({
      token: "test",
      rateLimiting: true,
      fetch: rec.fetch,
      ...config,
    });
    return { client, calls: rec.calls };
  }

  /** Делает `n` запросов подряд и проверяет, что следующий ждёт окна лимитера. */
  async function expectWaitsAfter(client: PortalsMarketClient, calls: unknown[], n: number) {
    const before = calls.length;
    for (let i = 0; i < n; i++) {
      await client.getMarketConfig();
    }
    expect(calls).toHaveLength(before + n);

    let resolved = false;
    const p = client.getMarketConfig().then((r) => {
      resolved = true;
      return r;
    });
    await vi.advanceTimersByTimeAsync(0);
    expect(resolved).toBe(false);
    expect(calls).toHaveLength(before + n);

    await vi.advanceTimersByTimeAsync(1000);
    expect(isOk(await p)).toBe(true);
    expect(calls).toHaveLength(before + n + 1);
  }

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("спека без фиксированных лимитов: лимит задаёт тариф ключа", () => {
    const limited = Object.entries(schemas.operations).filter(
      ([, op]) => op.rateLimit !== undefined,
    );
    expect(limited).toEqual([]);
    expect(schemas.GLOBAL_RATE_LIMIT).toBeNull();
  });

  it(`до заголовка общий лимит ключа — DEFAULT_MAX_RPS (${DEFAULT_MAX_RPS} req/s)`, async () => {
    const { client, calls } = createClient();
    await expectWaitsAfter(client, calls, DEFAULT_MAX_RPS);
  });

  it("лимит ключа берётся из X-RateLimit-Limit и действует на все методы", async () => {
    const { client, calls } = createClient({}, { "X-RateLimit-Limit": "5" });
    await client.getMarketConfig();
    await vi.advanceTimersByTimeAsync(1000);
    for (let i = 0; i < 4; i++) await client.getNftStats();
    await expectWaitsAfter(client, calls, 1);
  });

  it("лимит из заголовка одного эндпоинта не режет другие", async () => {
    const rec = recordingFetch((call) =>
      call.url.includes("/backdrops/floors")
        ? json({ floorPrices: {} }, 200, { "X-RateLimit-Limit": "2" })
        : json(marketConfig),
    );
    const client = new PortalsMarketClient({ token: "test", rateLimiting: true, fetch: rec.fetch });
    await client.getBackdropFloors();
    for (let i = 0; i < 10; i++) await client.getMarketConfig();
    expect(rec.calls).toHaveLength(11);

    // Лимит известен после первого ответа: дальше 2 запроса в окне, третий ждёт.
    await client.getBackdropFloors();
    await client.getBackdropFloors();
    let third = false;
    void client.getBackdropFloors().then(() => {
      third = true;
    });
    await vi.advanceTimersByTimeAsync(0);
    expect(third).toBe(false);
    await vi.advanceTimersByTimeAsync(1000);
    expect(third).toBe(true);
  });

  it("некорректный X-RateLimit-Limit игнорируется", async () => {
    const { client, calls } = createClient({}, { "X-RateLimit-Limit": "abc" });
    await expectWaitsAfter(client, calls, DEFAULT_MAX_RPS);
  });

  it("maxRps из конфига важнее заголовка", async () => {
    const { client, calls } = createClient({ maxRps: 2 }, { "X-RateLimit-Limit": "5" });
    await expectWaitsAfter(client, calls, 2);
  });

  it("некорректный maxRps отклоняется при создании клиента", () => {
    for (const maxRps of [0, -1, 0.5, 2.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => createClient({ maxRps })).toThrow(TypeError);
    }
  });

  it("лимит общий для всех эндпоинтов", async () => {
    const { client, calls } = createClient({ maxRps: 2 });
    await client.getMarketConfig();
    await client.getNftStats();
    let resolved = false;
    void client.getWalletInfo().then(() => {
      resolved = true;
    });
    await vi.advanceTimersByTimeAsync(0);
    expect(resolved).toBe(false);
    expect(calls).toHaveLength(2);
  });

  it("rateLimiting: false — не ждёт", async () => {
    const { client, calls } = createClient({ rateLimiting: false, maxRps: 1 });
    for (let i = 0; i < 5; i++) {
      const r = await client.getMarketConfig();
      expect(isOk(r)).toBe(true);
    }
    expect(calls).toHaveLength(5);
  });

  it("ожидание лимитера прерывается signal → aborted", async () => {
    const { client, calls } = createClient({ maxRps: 2 });
    await client.getMarketConfig();
    await client.getMarketConfig();
    const controller = new AbortController();
    const p = client.getMarketConfig({ signal: controller.signal });
    await vi.advanceTimersByTimeAsync(10);
    controller.abort();
    const res = await p;
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.kind).toBe("aborted");
    expect(calls).toHaveLength(2);
  });
});
