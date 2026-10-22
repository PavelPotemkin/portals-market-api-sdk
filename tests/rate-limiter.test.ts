import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isOk, PortalsMarketClient, schemas } from "../src";
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
  const floors = () => json({ floorPrices: {} });

  function createClient(rateLimiting: boolean, handler = floors) {
    const rec = recordingFetch(handler);
    const client = new PortalsMarketClient({ token: "test", rateLimiting, fetch: rec.fetch });
    return { client, calls: rec.calls };
  }

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("лимиты эндпоинтов взяты из описаний спеки", () => {
    const limits = Object.fromEntries(
      Object.entries(schemas.operations)
        .filter(([, op]) => op.rateLimit !== undefined)
        .map(([id, op]) => [id, op.rateLimit]),
    );
    expect(limits).toEqual({
      postCollectionOffersBulkUpdate: 2,
      getCollectionOffersAll: 10,
      getCollectionOffersTop: 10,
      getCollectionsAttributeFloors: 5,
      getCollectionsBackdropsFloors: 2,
      getCollectionsFloors: 9,
      getCollectionsModelsBackgroundsFloors: 3,
      getCollectionsMetrics: 8,
      getNftsOwned: 6,
      getNftsSearch: 15,
    });
    expect(schemas.GLOBAL_RATE_LIMIT).toBe(25);
  });

  it("эндпоинт-лимит: getBackdropFloors (2 req/s) ждёт на 3-м запросе", async () => {
    const { client, calls } = createClient(true);

    await client.getBackdropFloors();
    await client.getBackdropFloors();
    expect(calls).toHaveLength(2);

    let thirdResolved = false;
    const p = client.getBackdropFloors().then((r) => {
      thirdResolved = true;
      return r;
    });

    await vi.advanceTimersByTimeAsync(0);
    expect(thirdResolved).toBe(false);
    expect(calls).toHaveLength(2);

    await vi.advanceTimersByTimeAsync(1000);
    const r3 = await p;
    expect(thirdResolved).toBe(true);
    expect(isOk(r3)).toBe(true);
    expect(calls).toHaveLength(3);
  });

  it("bulkUpdateCollectionOffers ограничен 2 req/s", async () => {
    const { client, calls } = createClient(true, () => json({ updated: [], failed: [] }));
    const body = { offers: [{ id: "o1", amount: "1" }] };
    await client.bulkUpdateCollectionOffers(body);
    await client.bulkUpdateCollectionOffers(body);
    const p = client.bulkUpdateCollectionOffers(body);
    await vi.advanceTimersByTimeAsync(0);
    expect(calls).toHaveLength(2);
    await vi.advanceTimersByTimeAsync(1000);
    await p;
    expect(calls).toHaveLength(3);
  });

  it("глобальный лимит: 25 req/s ждёт на 26-м запросе", async () => {
    const { client, calls } = createClient(true, () =>
      json({
        commission: "5",
        cooldown: 0,
        deposit_wallet: "x",
        rub_course: "90",
        usd_course: "3",
        user_cashback: "0",
      }),
    );

    for (let i = 0; i < 25; i++) {
      await client.getMarketConfig();
    }
    expect(calls).toHaveLength(25);

    let resolved26 = false;
    const p = client.getMarketConfig().then((r) => {
      resolved26 = true;
      return r;
    });

    await vi.advanceTimersByTimeAsync(0);
    expect(resolved26).toBe(false);

    await vi.advanceTimersByTimeAsync(1000);
    await p;
    expect(resolved26).toBe(true);
    expect(calls).toHaveLength(26);
  });

  it("rateLimiting: false — не ждёт", async () => {
    const { client, calls } = createClient(false);
    for (let i = 0; i < 5; i++) {
      const r = await client.getBackdropFloors();
      expect(isOk(r)).toBe(true);
    }
    expect(calls).toHaveLength(5);
  });

  it("разные эндпоинты имеют отдельные лимиты", async () => {
    const { client } = createClient(true, () =>
      json({ updated_at: "2025-01-01", models: [], floorPrices: {} }),
    );

    await client.getBackdropFloors();
    await client.getBackdropFloors();

    let blockedResolved = false;
    void client.getBackdropFloors().then(() => {
      blockedResolved = true;
    });

    const attrOk = await client.getAttributeFloors();
    expect(isOk(attrOk)).toBe(true);
    expect(blockedResolved).toBe(false);
  });

  it("ожидание лимитера прерывается signal → aborted", async () => {
    const { client, calls } = createClient(true);
    await client.getBackdropFloors();
    await client.getBackdropFloors();
    const controller = new AbortController();
    const p = client.getBackdropFloors({ signal: controller.signal });
    await vi.advanceTimersByTimeAsync(10);
    controller.abort();
    const res = await p;
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.kind).toBe("aborted");
    expect(calls).toHaveLength(2);
  });
});
