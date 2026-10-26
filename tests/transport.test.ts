import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_RETRY,
  IRREVERSIBLE_OPERATIONS,
  PortalsError,
  PortalsMarketClient,
  type Result,
} from "../src";
import { retryDelayMs, serializeQuery } from "../src/transport";
import { json, makeClient, noContent, parseUrl } from "./helpers";

const wallet = { balance: "1", frozen_funds: "0", premarket_funds: "0" };

function expectErr<T>(res: Result<T, PortalsError>): PortalsError {
  expect(res.ok).toBe(false);
  if (res.ok) throw new Error("expected Err");
  expect(res.error).toBeInstanceOf(PortalsError);
  expect(res.error).toBeInstanceOf(Error);
  return res.error;
}

describe("ошибки: kind и поля", () => {
  it("http: JSON-тело с code и message", async () => {
    const { client } = makeClient(() =>
      json({ code: "INSUFFICIENT_FUNDS", message: "not enough balance" }, 422),
    );
    const e = expectErr(await client.getWalletInfo());
    expect(e.kind).toBe("http");
    expect(e.status).toBe(422);
    expect(e.code).toBe("INSUFFICIENT_FUNDS");
    expect(e.data).toEqual({ code: "INSUFFICIENT_FUNDS", message: "not enough balance" });
    expect(e.body).toBe('{"code":"INSUFFICIENT_FUNDS","message":"not enough balance"}');
    expect(e.method).toBe("GET");
    expect(e.endpoint).toBe("/partners/users/wallets/");
    expect(e.message).toBe("GET /partners/users/wallets/: HTTP 422: not enough balance");
    expect(e.retryable).toBe(false);
    expect(e.attempts).toBe(1);
    expect(e.name).toBe("PortalsError");
  });

  it("http: не-JSON тело ошибки сохраняется в body", async () => {
    const { client } = makeClient(
      () =>
        new Response("<html>502 Bad Gateway</html>", { status: 502, statusText: "Bad Gateway" }),
    );
    const e = expectErr(await client.getWalletInfo());
    expect(e.kind).toBe("http");
    expect(e.status).toBe(502);
    expect(e.body).toBe("<html>502 Bad Gateway</html>");
    expect(e.data).toBeUndefined();
    expect(e.message).toContain("HTTP 502: Bad Gateway");
    expect(e.retryable).toBe(true);
  });

  it("геттеры isNotFound, isUnauthorized, isRateLimited", async () => {
    for (const [status, getter] of [
      [404, "isNotFound"],
      [401, "isUnauthorized"],
      [429, "isRateLimited"],
    ] as const) {
      const { client } = makeClient(() => json({ message: "x" }, status), {
        retry: { maxRetries: 0 },
      });
      const e = expectErr(await client.getNftStats());
      expect(e[getter]).toBe(true);
    }
  });

  it("network: fetch бросает", async () => {
    const { client } = makeClient(() => {
      throw new TypeError("fetch failed");
    });
    const e = expectErr(await client.getWalletInfo());
    expect(e.kind).toBe("network");
    expect(e.retryable).toBe(true);
    expect(e.cause).toBeInstanceOf(TypeError);
  });

  it("network: fetch вернул не Response", async () => {
    const { client } = makeClient(() => ({}) as Response);
    const e = expectErr(await client.getWalletInfo());
    expect(e.kind).toBe("network");
  });

  it("parse: 200 с пустым телом", async () => {
    const { client } = makeClient(() => new Response("", { status: 200 }));
    const e = expectErr(await client.getWalletInfo());
    expect(e.kind).toBe("parse");
    expect(e.status).toBe(200);
    expect(e.body).toBe("");
  });

  it("parse: 200 html на buyNfts — Err, не исключение", async () => {
    const { client } = makeClient(() => new Response("<html>ok</html>", { status: 200 }));
    const e = expectErr(await client.buyNfts({ nft_details: [{ id: "a", price: "1" }] }));
    expect(e.kind).toBe("parse");
    expect(e.body).toBe("<html>ok</html>");
    expect(e.retryable).toBe(false);
  });

  it("validation: ответ без обязательного поля, данные сохранены", async () => {
    const { client } = makeClient(() => json({ frozen_funds: "0", premarket_funds: "0" }));
    const e = expectErr(await client.getWalletInfo());
    expect(e.kind).toBe("validation");
    expect(e.data).toEqual({ frozen_funds: "0", premarket_funds: "0" });
    expect(e.issues?.[0].path).toEqual(["balance"]);
  });

  it("validation на buyNfts: data содержит ответ с частичной покупкой", async () => {
    const body = { total_purchased: "one", purchase_results: [{ id: "n1", status: "success" }] };
    const { client } = makeClient(() => json(body));
    const e = expectErr(await client.buyNfts({ nft_details: [{ id: "n1", price: "1" }] }));
    expect(e.kind).toBe("validation");
    expect(e.data).toEqual(body);
    expect(e.retryable).toBe(false);
  });

  it("request: невалидное тело, fetch не вызывается", async () => {
    const { client, calls } = makeClient(() => json({}));
    const e = expectErr(await client.transferGifts({ recipient: "1", nft_ids: [] }));
    expect(e.kind).toBe("request");
    expect(e.attempts).toBe(0);
    expect(e.issues?.[0].path).toEqual(["nft_ids"]);
    expect(calls).toHaveLength(0);
  });

  it("request: transfer требует ровно одно из recipient и recipient_token", async () => {
    const { client, calls } = makeClient(() => json({}));
    const both = { recipient: "1", recipient_token: "t", nft_ids: ["n1"] } as never;
    expect(expectErr(await client.transferGifts(both)).kind).toBe("request");
    const none = { nft_ids: ["n1"] } as never;
    expect(expectErr(await client.transferGifts(none)).kind).toBe("request");
    expect(calls).toHaveLength(0);
  });

  it("request: строгий enum в query", async () => {
    const { client, calls } = makeClient(() => json({}));
    const e = expectErr(await client.searchNfts({ sort_by: "price up" as never }));
    expect(e.kind).toBe("request");
    expect(calls).toHaveLength(0);
  });

  it("request: пустой path-параметр и пустой список ids", async () => {
    const { client, calls } = makeClient(() => json({}));
    expect(expectErr(await client.getTopCollectionOffer("")).kind).toBe("request");
    expect(expectErr(await client.getWithdrawalStatuses([])).kind).toBe("request");
    expect(expectErr(await client.getModelBackgroundFloors([])).kind).toBe("request");
    expect(calls).toHaveLength(0);
  });

  it("request: ограничения спеки и поправок проверяются до сети", async () => {
    const { client, calls } = makeClient(() => json({}));
    const r1 = await client.createCollectionOffer({
      collection_id: "c",
      amount: "1",
      max_nfts: 51,
    });
    expect(expectErr(r1).kind).toBe("request");
    const r2 = await client.bulkUpdateCollectionOffers({ offers: [] });
    expect(expectErr(r2).kind).toBe("request");
    const r3 = await client.bulkUpdateCollectionOffers({
      offers: [{ id: "o", amount: "1", expiration_days: 3 as never }],
    });
    expect(expectErr(r3).kind).toBe("request");
    expect(calls).toHaveLength(0);
  });
});

describe("URL и сериализация", () => {
  it("baseUrl с path-префиксом сохраняется", async () => {
    const { client, calls } = makeClient(() => json(wallet), {
      baseUrl: "https://proxy.example/portals/api/",
    });
    await client.getWalletInfo();
    expect(calls[0].url).toBe("https://proxy.example/portals/api/partners/users/wallets/");
  });

  it("query: массивы через запятую, пропуск undefined/null/пустых", async () => {
    const { client, calls } = makeClient(() => json({ results: [], total_count: 0 }));
    await client.searchNfts({
      collection_ids: ["a", "b"],
      min_price: "1.5",
      max_price: "10",
      filter_by_models: [],
      filter_by_backdrops: null,
      search: undefined,
      exclude_bundled: true,
      status: "listed",
      sort_by: "price asc",
      limit: 20,
      offset: 0,
    });
    const url = parseUrl(calls[0].url);
    expect(url.query).toEqual({
      collection_ids: "a,b",
      min_price: "1.5",
      max_price: "10",
      exclude_bundled: "true",
      status: "listed",
      sort_by: "price asc",
      limit: "20",
      offset: "0",
    });
  });

  it("serializeQuery", () => {
    expect(serializeQuery(undefined)).toBe("");
    expect(serializeQuery({ a: [], b: null, c: "" })).toBe("");
    expect(serializeQuery({ ids: [1, 2], q: "a b" })).toBe("?ids=1%2C2&q=a+b");
  });

  it("конструктор проверяет конфиг", () => {
    expect(() => new PortalsMarketClient({ token: "" })).toThrow(TypeError);
    expect(() => new PortalsMarketClient({ token: "t", baseUrl: "portal-market.com" })).toThrow(
      TypeError,
    );
  });
});

describe("таймауты и отмена", () => {
  it("timeout: fetch не отвечает и игнорирует signal", async () => {
    const { client } = makeClient(() => new Promise<Response>(() => {}), { timeoutMs: 20 });
    const e = expectErr(await client.getWalletInfo());
    expect(e.kind).toBe("timeout");
    expect(e.retryable).toBe(true);
  });

  it("timeout на вызов перекрывает конфиг", async () => {
    const { client } = makeClient(() => new Promise<Response>(() => {}), { timeoutMs: 60_000 });
    const e = expectErr(await client.getWalletInfo({ timeoutMs: 10 }));
    expect(e.kind).toBe("timeout");
  });

  it("timeout во время чтения тела", async () => {
    const stalled = new Response(new ReadableStream({ start() {} }), { status: 200 });
    const { client } = makeClient(() => stalled, { timeoutMs: 20 });
    const e = expectErr(await client.getWalletInfo());
    expect(e.kind).toBe("timeout");
    expect(e.status).toBe(200);
  });

  it("signal передаётся в fetch и срабатывает по таймауту", async () => {
    let seen: AbortSignal | undefined;
    const { client } = makeClient(
      (call) =>
        new Promise<Response>((_, reject) => {
          seen = call.signal;
          call.signal?.addEventListener("abort", () => reject(call.signal?.reason));
        }),
      { timeoutMs: 20 },
    );
    const e = expectErr(await client.getWalletInfo());
    expect(e.kind).toBe("timeout");
    expect(seen?.aborted).toBe(true);
  });

  it("aborted: signal уже отменён — fetch не вызывается", async () => {
    const { client, calls } = makeClient(() => json(wallet));
    const e = expectErr(await client.getWalletInfo({ signal: AbortSignal.abort() }));
    expect(e.kind).toBe("aborted");
    expect(e.retryable).toBe(false);
    expect(calls).toHaveLength(0);
  });

  it("aborted: отмена во время запроса", async () => {
    const controller = new AbortController();
    const { client } = makeClient(() => {
      setTimeout(() => controller.abort(), 5);
      return new Promise<Response>(() => {});
    });
    const e = expectErr(await client.getWalletInfo({ signal: controller.signal }));
    expect(e.kind).toBe("aborted");
  });
});

describe("429: повторы", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("Retry-After в секундах", async () => {
    const { client, calls } = makeClient((_, i) =>
      i === 0 ? json({ message: "rl" }, 429, { "retry-after": "2" }) : json(wallet),
    );
    const p = client.getWalletInfo();
    await vi.advanceTimersByTimeAsync(1900);
    expect(calls).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(300);
    const res = await p;
    expect(res.ok).toBe(true);
    expect(calls).toHaveLength(2);
  });

  it("Retry-After в формате HTTP-date", async () => {
    const { client, calls } = makeClient((_, i) =>
      i === 0
        ? json({}, 429, { "retry-after": new Date(Date.now() + 5000).toUTCString() })
        : json(wallet),
    );
    const p = client.getWalletInfo();
    await vi.advanceTimersByTimeAsync(3900);
    expect(calls).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(1300);
    expect((await p).ok).toBe(true);
    expect(calls).toHaveLength(2);
  });

  it("без Retry-After: экспонента, maxRetries, итог — http 429", async () => {
    const { client, calls } = makeClient(() => json({ message: "rl" }, 429), {
      retry: { maxRetries: 2, baseDelayMs: 100, maxDelayMs: 1000 },
    });
    const p = client.getWalletInfo();
    await vi.advanceTimersByTimeAsync(10_000);
    const e = expectErr(await p);
    expect(calls).toHaveLength(3);
    expect(e.kind).toBe("http");
    expect(e.isRateLimited).toBe(true);
    expect(e.retryable).toBe(true);
    expect(e.attempts).toBe(3);
  });

  it("повторы проходят через лимитер", async () => {
    const times: number[] = [];
    const { client } = makeClient(
      (_, i) => {
        times.push(Date.now());
        return i < 2 ? json({}, 429, { "retry-after": "0" }) : json({ floorPrices: {} });
      },
      { rateLimiting: true, maxRps: 2, retry: { baseDelayMs: 1 } },
    );
    // Лимит ключа 2 req/s; два 429 подряд, третья попытка ждёт окна лимитера.
    const p = client.getBackdropFloors();
    await vi.advanceTimersByTimeAsync(5000);
    expect((await p).ok).toBe(true);
    expect(times).toHaveLength(3);
    expect(times[2] - times[0]).toBeGreaterThanOrEqual(1000);
  });

  it("необратимые операции на 429 не повторяются", async () => {
    const cases: [string, (c: PortalsMarketClient) => Promise<Result<unknown, PortalsError>>][] = [
      ["buyNfts", (c) => c.buyNfts({ nft_details: [{ id: "n", price: "1" }] })],
      ["withdrawGifts", (c) => c.withdrawGifts({ gift_ids: ["n"] })],
      ["withdrawTon", (c) => c.withdrawTon({ amount: "1", external_address: "EQ" })],
      ["transferGifts", (c) => c.transferGifts({ recipient: "1", nft_ids: ["n"] })],
      [
        "acceptCollectionOffer",
        (c) => c.acceptCollectionOffer("o", { amount: "1", nft_ids: ["n"] }),
      ],
      [
        "createCollectionOffer",
        (c) => c.createCollectionOffer({ collection_id: "c", amount: "1", max_nfts: 1 }),
      ],
      ["placeArenaBet", (c) => c.placeArenaBet({ room_id: 1, bet_type: "ton", amount: "1" })],
    ];
    expect(IRREVERSIBLE_OPERATIONS.size).toBe(cases.length);
    for (const [name, call] of cases) {
      const { client, calls } = makeClient(() => json({}, 429, { "retry-after": "0" }));
      const e = expectErr(await call(client));
      expect(calls, name).toHaveLength(1);
      expect(e.isRateLimited).toBe(true);
      expect(e.retryable, name).toBe(false);
    }
  });

  it("необратимые операции: network и 5xx не retryable", async () => {
    const { client } = makeClient(() => {
      throw new TypeError("socket hang up");
    });
    const e = expectErr(await client.buyNfts({ nft_details: [{ id: "n", price: "1" }] }));
    expect(e.kind).toBe("network");
    expect(e.retryable).toBe(false);
  });

  it("обратимые POST на 429 повторяются", async () => {
    const { client, calls } = makeClient((_, i) =>
      i === 0 ? json({}, 429, { "retry-after": "1" }) : noContent(),
    );
    const p = client.unlistNft("n1");
    await vi.advanceTimersByTimeAsync(1500);
    expect((await p).ok).toBe(true);
    expect(calls).toHaveLength(2);
  });

  it("отмена во время паузы перед повтором", async () => {
    const controller = new AbortController();
    const { client, calls } = makeClient(() => json({}, 429, { "retry-after": "10" }));
    const p = client.getWalletInfo({ signal: controller.signal });
    await vi.advanceTimersByTimeAsync(100);
    controller.abort();
    const e = expectErr(await p);
    expect(e.kind).toBe("aborted");
    expect(calls).toHaveLength(1);
  });
});

describe("retryDelayMs", () => {
  const retry = { ...DEFAULT_RETRY };
  const now = Date.parse("2026-10-22T00:00:00Z");
  const noJitter = () => 0;

  it("секунды, HTTP-date, мусор", () => {
    expect(retryDelayMs("3", 1, retry, now, noJitter)).toBe(3000);
    expect(retryDelayMs("Thu, 22 Oct 2026 00:00:05 GMT", 1, retry, now, noJitter)).toBe(5000);
    expect(retryDelayMs("Thu, 21 Oct 2026 00:00:05 GMT", 1, retry, now, noJitter)).toBe(0);
    expect(retryDelayMs("soon", 1, retry, now, noJitter)).toBe(500);
  });

  it("экспонента с джиттером и потолком", () => {
    expect(retryDelayMs(null, 1, retry, now, noJitter)).toBe(500);
    expect(retryDelayMs(null, 3, retry, now, () => 1)).toBe(4000);
    expect(retryDelayMs(null, 10, retry, now, () => 1)).toBe(30_000);
    expect(retryDelayMs("3600", 1, retry, now, noJitter)).toBe(30_000);
  });
});

describe("placeArenaBet", () => {
  it("BET_OUTCOME_UNKNOWN: код сохраняется, ошибка не retryable", async () => {
    const { client, calls } = makeClient(() =>
      json({ code: "BET_OUTCOME_UNKNOWN", message: "bet outcome unknown" }, 504),
    );
    const e = expectErr(await client.placeArenaBet({ room_id: 1, bet_type: "ton", amount: "1" }));
    expect(calls).toHaveLength(1);
    expect(e.kind).toBe("http");
    expect(e.status).toBe(504);
    expect(e.code).toBe("BET_OUTCOME_UNKNOWN");
    expect(e.retryable).toBe(false);
  });

  it("код ошибки Arena как в мини-аппе", async () => {
    const { client } = makeClient(() =>
      json({ code: "COUNTDOWN_TOO_CLOSE", message: "COUNTDOWN_TOO_CLOSE" }, 422),
    );
    const e = expectErr(await client.placeArenaBet({ room_id: 1, bet_type: "ton", amount: "1" }));
    expect(e.code).toBe("COUNTDOWN_TOO_CLOSE");
  });

  it("тело проверяется до сети: ровно одно из amount и gift_ids, гифтов 1–50", async () => {
    const { client, calls } = makeClient(() => json({}));
    const bad = [
      { room_id: 1, bet_type: "ton", amount: "1", gift_ids: ["g"] },
      { room_id: 1, bet_type: "ton" },
      { room_id: 1, bet_type: "gift", gift_ids: [] },
      { room_id: 1, bet_type: "gift", gift_ids: Array.from({ length: 51 }, (_, i) => `g${i}`) },
      { room_id: 1, bet_type: "dice", amount: "1" },
      { room_id: 1, bet_type: "ton", gift_ids: ["g"] },
      { room_id: 1, bet_type: "gift", amount: "1" },
    ];
    for (const body of bad) {
      const e = expectErr(await client.placeArenaBet(body as never));
      expect(e.kind, JSON.stringify(body)).toBe("request");
    }
    expect(calls).toHaveLength(0);
  });
});
