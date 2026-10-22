import { describe, expect, it } from "vitest";
import { PortalsMarketClient, schemas } from "../src";
import { methodCases } from "./fixtures/methods";
import { makeClient, parseUrl } from "./helpers";

describe("каждый публичный метод", () => {
  for (const c of methodCases) {
    it(`${c.name} → ${c.method} ${c.path}`, async () => {
      const { client, calls } = makeClient(() => c.response());
      const res = await c.invoke(client);

      expect(res.ok, res.ok ? "" : String((res as { error: unknown }).error)).toBe(true);
      expect(calls).toHaveLength(1);
      const call = calls[0];
      const url = parseUrl(call.url);
      expect(call.method).toBe(c.method);
      expect(url.origin).toBe("https://portal-market.com");
      expect(url.path).toBe(c.path);
      expect(url.query).toEqual(c.query ?? {});
      expect(call.headers.Authorization).toBe("partners test-token");
      expect(call.headers.Accept).toBe("application/json");
      if (c.body === undefined) {
        expect(call.body).toBeUndefined();
        expect(call.headers["Content-Type"]).toBeUndefined();
      } else {
        expect(JSON.parse(call.body ?? "null")).toEqual(c.body);
        expect(call.headers["Content-Type"]).toBe("application/json");
      }
      expect(call.signal).toBeInstanceOf(AbortSignal);

      // Метод вызывает ровно ту операцию спеки, что заявлена.
      const op = schemas.operations[c.operation];
      expect(op.method).toBe(c.method);
      const template = new RegExp(`^${op.path.replace(/\{[^}]+\}/g, "[^/]+")}$`);
      expect(url.path).toMatch(template);

      if (res.ok) c.value?.(res.value);
    });
  }

  it("таблица покрывает все операции спеки и все методы клиента", () => {
    const covered = new Set(methodCases.map((c) => c.operation));
    expect([...covered].sort()).toEqual(Object.keys(schemas.operations).sort());

    const helpers = new Set(["iterateOwnedNfts", "iterateSearchNfts", "getAllOwnedNfts"]);
    const methods = Object.getOwnPropertyNames(PortalsMarketClient.prototype).filter(
      (m) => m !== "constructor" && !helpers.has(m),
    );
    expect(methods.sort()).toEqual(methodCases.map((c) => c.name as string).sort());
  });
});

describe("разбор ответов", () => {
  it("неизвестное значение enum в ответе принимается", async () => {
    const { client } = makeClient(() =>
      Response.json({ actions: [{ type: "brand_new_action", created_at: "t" }] }),
    );
    const res = await client.getMarketActions();
    expect(res.ok && res.value.actions[0].type).toBe("brand_new_action");
  });

  it("неизвестные поля сохраняются, в том числе во вложенных объектах", async () => {
    const { client } = makeClient(() =>
      Response.json({
        offers: [{ id: "o1", amount: "1", scope: { models: ["M"] }, future_field: 1 }],
        total_count: 1,
        extra: "x",
      }),
    );
    const res = await client.getAllCollectionOffers("c1");
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.value.extra).toBe("x");
    expect(res.value.offers?.[0].scope?.models).toEqual(["M"]);
    expect(res.value.offers?.[0].future_field).toBe(1);
  });

  it("null в необязательных полях принимается", async () => {
    const { client } = makeClient(() =>
      Response.json({ nfts: [{ ...nftWithNulls }], total_count: 1, attribute_floors: null }),
    );
    const res = await client.getOwnedNfts();
    expect(res.ok).toBe(true);
  });

  it("getTopCollectionOffer: тело null → ok(null)", async () => {
    const { client } = makeClient(() => new Response("null", { status: 200 }));
    const res = await client.getTopCollectionOffer("c1");
    expect(res).toEqual({ ok: true, value: null });
  });

  it("buyNfts: частичная покупка с NFT_NOT_AVAILABLE и новым статусом разбирается", async () => {
    const { client } = makeClient(() =>
      Response.json({
        total_requested: 2,
        total_purchased: 1,
        total_spent: "1.5",
        purchase_results: [
          {
            id: "n1",
            status: "success",
            nft: {
              id: "n1",
              name: "X",
              photo_url: "p",
              collection_id: "c",
              external_collection_number: 1,
              status: "sold_new",
              attributes: [],
            },
          },
        ],
        invalid_nfts: [{ id: "n2", reason: "NFT_NOT_AVAILABLE" }],
      }),
    );
    const res = await client.buyNfts({
      nft_details: [
        { id: "n1", price: "1.5" },
        { id: "n2", price: "2" },
      ],
    });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.value.total_purchased).toBe(1);
    expect(res.value.invalid_nfts?.[0].reason).toBe("NFT_NOT_AVAILABLE");
    expect(res.value.purchase_results?.[0].nft?.status).toBe("sold_new");
  });
});

const nftWithNulls = {
  id: "n1",
  name: "X",
  photo_url: "p",
  collection_id: "c",
  external_collection_number: 1,
  status: "unlisted",
  attributes: [],
  is_owned: true,
  price: null,
  listed_at: null,
  premarket_data: null,
  fiat_eligible: null,
};
