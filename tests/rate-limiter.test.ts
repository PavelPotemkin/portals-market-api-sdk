import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RateLimiter } from "../src/rate-limiter";
import { PortalsMarketClient } from "../src/client";
import { isOk } from "@pavelpotemkin/utils";

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

    expect(resolved).toBe(false);

    vi.advanceTimersByTime(1000);
    await p;

    expect(resolved).toBe(true);
  });

  it("разные ключи не влияют друг на друга", async () => {
    for (let i = 0; i < 2; i++) {
      await limiter.wait("a", 2);
    }

    let aResolved = false;
    limiter.wait("a", 2).then(() => {
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
});

describe("PortalsMarketClient rate limiting", () => {
  const mockFetch = vi.fn(async () =>
    new Response(JSON.stringify({ floorPrices: {} }), { status: 200 }),
  );

  function createClient(rateLimiting: boolean) {
    return new PortalsMarketClient({
      token: "test",
      rateLimiting,
      fetch: mockFetch as unknown as typeof fetch,
    });
  }

  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockImplementation(async () =>
      new Response(JSON.stringify({ floorPrices: {} }), { status: 200 }),
    );
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("эндпоинт-лимит: getBackdropFloors (2 req/s) ждёт на 3-м запросе", async () => {
    const client = createClient(true);

    await client.getBackdropFloors();
    await client.getBackdropFloors();
    expect(mockFetch).toHaveBeenCalledTimes(2);

    let thirdResolved = false;
    const p = client.getBackdropFloors().then((r) => {
      thirdResolved = true;
      return r;
    });

    expect(thirdResolved).toBe(false);
    expect(mockFetch).toHaveBeenCalledTimes(2);

    vi.advanceTimersByTime(1000);
    const r3 = await p;

    expect(thirdResolved).toBe(true);
    expect(isOk(r3)).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it("глобальный лимит: 25 req/s ждёт на 26-м запросе", async () => {
    const client = createClient(true);
    mockFetch.mockImplementation(async () =>
      new Response(
        JSON.stringify({
          commission: "5",
          cooldown: "0",
          deposit_wallet: "x",
          rub_course: "90",
          usd_course: "3",
          user_cashback: "0",
        }),
        { status: 200 },
      ),
    );

    for (let i = 0; i < 25; i++) {
      await client.getMarketConfig();
    }
    expect(mockFetch).toHaveBeenCalledTimes(25);

    let resolved26 = false;
    const p = client.getMarketConfig().then((r) => {
      resolved26 = true;
      return r;
    });

    expect(resolved26).toBe(false);

    vi.advanceTimersByTime(1000);
    await p;

    expect(resolved26).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(26);
  });

  it("rateLimiting: false — не ждёт", async () => {
    const client = createClient(false);

    for (let i = 0; i < 5; i++) {
      const r = await client.getBackdropFloors();
      expect(isOk(r)).toBe(true);
    }

    expect(mockFetch).toHaveBeenCalledTimes(5);
  });

  it("разные эндпоинты имеют отдельные лимиты", async () => {
    const client = createClient(true);
    mockFetch.mockImplementation(async (url: string) => {
      if (url.includes("attribute-floors")) {
        return new Response(
          JSON.stringify({ updated_at: "2025-01-01", models: [] }),
          { status: 200 },
        );
      }
      return new Response(JSON.stringify({ floorPrices: {} }), {
        status: 200,
      });
    });

    await client.getBackdropFloors();
    await client.getBackdropFloors();

    let blockedResolved = false;
    client.getBackdropFloors().then(() => {
      blockedResolved = true;
    });

    const attrOk = await client.getAttributeFloors();
    expect(isOk(attrOk)).toBe(true);
    expect(blockedResolved).toBe(false);
  });
});
