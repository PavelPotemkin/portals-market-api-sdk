/**
 * Пробы из валидации 1.2.0 (PORTALS-127, probe.mjs и probe2.mjs) на mock fetch.
 * В 1.2.0 они давали исключения, ложные ошибки валидации и потерю данных; здесь — ожидаемое в 2.0.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PortalsMarketClient, type Result } from "../src";
import { type Handler, json, recordingFetch } from "./helpers";

const nft = {
  id: "n1",
  name: "X",
  photo_url: "p",
  collection_id: "c",
  external_collection_number: 1,
  status: "listed",
  attributes: [],
};

function mk(handler: Handler, extra: Record<string, unknown> = {}) {
  const rec = recordingFetch(handler);
  const client = new PortalsMarketClient({
    token: "t",
    rateLimiting: false,
    retry: { baseDelayMs: 10 },
    fetch: rec.fetch,
    ...extra,
  });
  return { client, calls: rec.calls };
}

const kind = (r: Result<unknown, { kind: string }>) => (r.ok ? "OK" : r.error.kind);

describe("probe.mjs", () => {
  it("1 buy с NFT_NOT_AVAILABLE → OK (в 1.2.0 ResponseValidationError)", async () => {
    const { client } = mk(() =>
      json({
        total_requested: 2,
        total_purchased: 1,
        total_spent: "1.5",
        purchase_results: [{ id: "n1", status: "success" }],
        invalid_nfts: [{ id: "n2", reason: "NFT_NOT_AVAILABLE" }],
      }),
    );
    const r = await client.buyNfts({
      nft_details: [
        { id: "n1", price: "1.5" },
        { id: "n2", price: "2" },
      ],
    });
    expect(kind(r)).toBe("OK");
  });

  it("1b buy с неизвестным nft.status → OK", async () => {
    const { client } = mk(() =>
      json({
        purchase_results: [{ id: "n1", status: "success", nft: { ...nft, status: "sold_new" } }],
      }),
    );
    expect(kind(await client.buyNfts({ nft_details: [{ id: "n1", price: "1" }] }))).toBe("OK");
  });

  it("2 market actions lucky_buy_win → OK", async () => {
    const { client } = mk(() =>
      json({ actions: [{ type: "lucky_buy_win", created_at: "2026-10-01T00:00:00Z" }] }),
    );
    expect(kind(await client.getMarketActions({ limit: 1 }))).toBe("OK");
  });

  it("2b user actions loot_pack_gram → OK", async () => {
    const { client } = mk(() =>
      json({ actions: [{ type: "loot_pack_gram", collection_id: "c" }], total_actions: 1 }),
    );
    expect(kind(await client.getUserActions({ limit: 1 }))).toBe("OK");
  });

  it("3 top offer null → OK(null)", async () => {
    const { client } = mk(
      () => new Response("null", { status: 200, headers: { "content-type": "application/json" } }),
    );
    const r = await client.getTopCollectionOffer("c");
    expect(r).toEqual({ ok: true, value: null });
  });

  it("4 transfer nft_ids=[] → request, fetch не вызван", async () => {
    const { client, calls } = mk(() => json({}));
    const r = await client.transferGifts({ recipient: "1", nft_ids: [] });
    expect(kind(r)).toBe("request");
    expect(calls).toHaveLength(0);
  });

  it("5 502 html → http, тело сохранено", async () => {
    const { client } = mk(
      () =>
        new Response("<html>502 Bad Gateway</html>", { status: 502, statusText: "Bad Gateway" }),
    );
    const r = await client.getWalletInfo();
    expect(kind(r)).toBe("http");
    if (!r.ok) {
      expect(r.error.status).toBe(502);
      expect(r.error.body).toBe("<html>502 Bad Gateway</html>");
    }
  });

  it("6 baseUrl с префиксом сохраняется, авторизация partners <token>", async () => {
    const { client, calls } = mk(
      () => json({ balance: "1", frozen_funds: "0", premarket_funds: "0" }),
      { baseUrl: "https://proxy.example/portals/api/" },
    );
    await client.getWalletInfo();
    expect(calls[0].url).toBe("https://proxy.example/portals/api/partners/users/wallets/");
    expect(calls[0].headers.Authorization).toBe("partners t");
  });

  it("7 scope оффера и lucky_buy_eligible сохраняются", async () => {
    const offers = mk(() =>
      json({ offers: [{ id: "o1", amount: "3", scope: { models: ["M"] } }], total_count: 1 }),
    );
    const r = await offers.client.getAllCollectionOffers("c", { limit: 10 });
    expect(r.ok && r.value.offers?.[0].scope).toEqual({ models: ["M"] });

    const search = mk(() =>
      json({
        results: [{ ...nft, is_owned: false, lucky_buy_eligible: true, fiat_price_rub: "100" }],
        total_count: 1,
      }),
    );
    const s = await search.client.searchNfts({ collection_id: "c" });
    expect(s.ok && s.value.results?.[0].lucky_buy_eligible).toBe(true);
    expect(s.ok && s.value.results?.[0].fiat_price_rub).toBe("100");
  });

  it("9 сериализация search", async () => {
    const { client, calls } = mk(() => json({ results: [], total_count: 0 }));
    await client.searchNfts({
      collection_ids: ["a", "b"],
      min_price: "1.5",
      max_price: "10",
      filter_by_models: [],
      exclude_bundled: true,
      status: "listed",
      sort_by: "price asc",
      limit: 20,
      offset: 0,
    });
    expect(calls[0].url).toBe(
      "https://portal-market.com/partners/nfts/search?collection_ids=a%2Cb&exclude_bundled=true&limit=20&max_price=10&min_price=1.5&offset=0&sort_by=price+asc&status=listed",
    );
  });

  it("10 signal передаётся в fetch", async () => {
    const { client, calls } = mk(() => json({ results: [], total_count: 0 }));
    await client.searchNfts();
    expect(calls[0].signal).toBeInstanceOf(AbortSignal);
  });

  it("11 fetch бросает → network", async () => {
    const { client } = mk(() => {
      throw new TypeError("fetch failed");
    });
    expect(kind(await client.getWalletInfo())).toBe("network");
  });

  it("12 GET wallet, 200 пустое тело → parse, без исключения", async () => {
    const { client } = mk(() => new Response("", { status: 200 }));
    expect(kind(await client.getWalletInfo())).toBe("parse");
  });
});

describe("probe.mjs: 429", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("8 429 бесконечно → 4 попытки, http isRateLimited", async () => {
    const { client, calls } = mk(() => json({ message: "rl" }, 429, { "retry-after": "0" }));
    const p = client.getWalletInfo();
    await vi.advanceTimersByTimeAsync(5000);
    const r = await p;
    expect(calls).toHaveLength(4);
    expect(kind(r)).toBe("http");
    expect(!r.ok && r.error.isRateLimited).toBe(true);
  });

  it("8b Retry-After HTTP-date (+5 c) соблюдается", async () => {
    const { client, calls } = mk((_, i) =>
      i === 0
        ? json({}, 429, { "retry-after": new Date(Date.now() + 5000).toUTCString() })
        : json({ balance: "1", frozen_funds: "0", premarket_funds: "0" }),
    );
    const t0 = Date.now();
    const p = client.getWalletInfo();
    await vi.advanceTimersByTimeAsync(10_000);
    expect(kind(await p)).toBe("OK");
    expect(calls).toHaveLength(2);
    // Вторая попытка — не раньше 4 с (HTTP-date с точностью до секунды).
    expect(Date.now() - t0).toBeGreaterThanOrEqual(4000);
  });

  it("8c POST buy на 429 → 1 попытка", async () => {
    const { client, calls } = mk(() => json({ purchase_results: [] }, 429));
    const r = await client.buyNfts({ nft_details: [{ id: "n1", price: "1" }] });
    expect(calls).toHaveLength(1);
    expect(!r.ok && r.error.retryable).toBe(false);
  });
});

describe("probe2.mjs: методы не бросают", () => {
  const c = (h: () => Response) =>
    new PortalsMarketClient({ token: "t", rateLimiting: false, fetch: async () => h() });

  it("GET wallet, 200 пустое тело → Result", async () => {
    await expect(c(() => new Response("", { status: 200 })).getWalletInfo()).resolves.toMatchObject(
      {
        ok: false,
        error: { kind: "parse" },
      },
    );
  });

  it("POST buy, 200 html → Result", async () => {
    await expect(
      c(() => new Response("<html>ok</html>", { status: 200 })).buyNfts({
        nft_details: [{ id: "a", price: "1" }],
      }),
    ).resolves.toMatchObject({ ok: false, error: { kind: "parse" } });
  });
});
