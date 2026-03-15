import { describe, it, expect, beforeEach, vi } from "vitest";
import { RateLimiter } from "../src/rate-limiter";
import { PortalsMarketClient } from "../src/client";
import { PortalsRateLimitError } from "../src/errors";
import { isErr, isOk } from "@pavelpotemkin/utils";

describe("RateLimiter", () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter();
  });

  it("пропускает запросы в пределах лимита", () => {
    for (let i = 0; i < 5; i++) {
      expect(limiter.check("test", 5).allowed).toBe(true);
    }
  });

  it("блокирует при превышении лимита", () => {
    for (let i = 0; i < 3; i++) {
      limiter.check("test", 3);
    }
    const result = limiter.check("test", 3);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(0);
    expect(result.retryAfterMs).toBeLessThanOrEqual(1000);
  });

  it("разные ключи не влияют друг на друга", () => {
    for (let i = 0; i < 2; i++) {
      limiter.check("a", 2);
    }
    expect(limiter.check("a", 2).allowed).toBe(false);
    expect(limiter.check("b", 2).allowed).toBe(true);
  });

  it("сбрасывает окно через 1 секунду", () => {
    vi.useFakeTimers();

    for (let i = 0; i < 3; i++) {
      limiter.check("test", 3);
    }
    expect(limiter.check("test", 3).allowed).toBe(false);

    vi.advanceTimersByTime(1000);

    expect(limiter.check("test", 3).allowed).toBe(true);

    vi.useRealTimers();
  });

  it("reset очищает все бакеты", () => {
    for (let i = 0; i < 2; i++) {
      limiter.check("a", 2);
      limiter.check("b", 2);
    }
    expect(limiter.check("a", 2).allowed).toBe(false);

    limiter.reset();

    expect(limiter.check("a", 2).allowed).toBe(true);
    expect(limiter.check("b", 2).allowed).toBe(true);
  });

  it("лимит 1 — блокирует второй запрос", () => {
    expect(limiter.check("x", 1).allowed).toBe(true);
    const r = limiter.check("x", 1);
    expect(r.allowed).toBe(false);
    expect(r.retryAfterMs).toBeGreaterThan(0);
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
  });

  it("эндпоинт-лимит: getBackdropFloors (2 req/s) блокирует 3-й запрос", async () => {
    const client = createClient(true);

    const r1 = await client.getBackdropFloors();
    const r2 = await client.getBackdropFloors();
    expect(isOk(r1)).toBe(true);
    expect(isOk(r2)).toBe(true);

    const r3 = await client.getBackdropFloors();
    expect(isErr(r3)).toBe(true);
    if (isErr(r3)) {
      expect(r3.error).toBeInstanceOf(PortalsRateLimitError);
      expect((r3.error as PortalsRateLimitError).limit).toBe(2);
      expect((r3.error as PortalsRateLimitError).retryAfterMs).toBeGreaterThan(0);
    }

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("глобальный лимит: 25 req/s блокирует 26-й запрос", async () => {
    const client = createClient(true);
    mockFetch.mockImplementation(async () =>
      new Response(JSON.stringify({ commission: "5", cooldown: "0", deposit_wallet: "x", rub_course: "90", usd_course: "3", user_cashback: "0" }), { status: 200 }),
    );

    for (let i = 0; i < 25; i++) {
      const r = await client.getMarketConfig();
      expect(isOk(r)).toBe(true);
    }

    const r26 = await client.getMarketConfig();
    expect(isErr(r26)).toBe(true);
    if (isErr(r26)) {
      expect(r26.error).toBeInstanceOf(PortalsRateLimitError);
      expect((r26.error as PortalsRateLimitError).limit).toBe(25);
    }

    expect(mockFetch).toHaveBeenCalledTimes(25);
  });

  it("rateLimiting: false — не блокирует", async () => {
    const client = createClient(false);

    for (let i = 0; i < 5; i++) {
      const r = await client.getBackdropFloors();
      expect(isOk(r)).toBe(true);
    }

    expect(mockFetch).toHaveBeenCalledTimes(5);
  });

  it("лимит сбрасывается через 1 секунду", async () => {
    vi.useFakeTimers();
    const client = createClient(true);

    await client.getBackdropFloors();
    await client.getBackdropFloors();

    const blocked = await client.getBackdropFloors();
    expect(isErr(blocked)).toBe(true);

    vi.advanceTimersByTime(1000);

    const unblocked = await client.getBackdropFloors();
    expect(isOk(unblocked)).toBe(true);

    vi.useRealTimers();
  });

  it("разные эндпоинты имеют отдельные лимиты", async () => {
    const client = createClient(true);
    mockFetch.mockImplementation(async (url: string) => {
      if (url.includes("attribute-floors")) {
        return new Response(JSON.stringify({ updated_at: "2025-01-01", models: [] }), { status: 200 });
      }
      return new Response(JSON.stringify({ floorPrices: {} }), { status: 200 });
    });

    await client.getBackdropFloors();
    await client.getBackdropFloors();
    const blockedBackdrops = await client.getBackdropFloors();
    expect(isErr(blockedBackdrops)).toBe(true);

    const attrOk = await client.getAttributeFloors();
    expect(isOk(attrOk)).toBe(true);
  });
});
