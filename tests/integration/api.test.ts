import { describe, it, expect, beforeAll } from "vitest";
import { PortalsMarketClient } from "../../src/client";
import { NftStatus, ListingStatus } from "../../src/schemas";
import { unwrap } from "../../src/result";

const TOKEN = process.env.PORTALS_TOKEN;

describe.skipIf(!TOKEN)("Partners API — GET endpoints", () => {
  let client: PortalsMarketClient;

  beforeAll(() => {
    client = new PortalsMarketClient({
      token: TOKEN!,
      rateLimiting: false,
    });
  });

  // ── Market ──

  it("getMarketConfig — returns commission, deposit_wallet, courses", async () => {
    const res = await client.getMarketConfig();
    expect(res.ok).toBe(true);
    const data = unwrap(res);
    expect(data.commission).toBeDefined();
    expect(data.deposit_wallet).toBeDefined();
    expect(data.usd_course).toBeDefined();
    expect(data.rub_course).toBeDefined();
  });

  it("getMarketActions — returns actions array", async () => {
    const res = await client.getMarketActions({ limit: 5 });
    expect(res.ok).toBe(true);
    const data = unwrap(res);
    expect(data.actions).toBeInstanceOf(Array);
    if (data.actions.length > 0) {
      const action = data.actions[0];
      expect(action.type).toBeDefined();
      expect(action.created_at).toBeDefined();
    }
  });

  // ── Collections ──

  it("getCollectionsPreview — returns collections list", async () => {
    const res = await client.getCollectionsPreview();
    expect(res.ok).toBe(true);
    const data = unwrap(res);
    expect(data.collections).toBeInstanceOf(Array);
    if (data.collections && data.collections.length > 0) {
      const col = data.collections[0];
      expect(col.name).toBeDefined();
      expect(typeof col.name).toBe("string");
    }
  });

  it("getCollectionFloors — returns floorPrices map", async () => {
    const res = await client.getCollectionFloors();
    expect(res.ok).toBe(true);
    const data = unwrap(res);
    expect(data.floorPrices).toBeDefined();
    expect(typeof data.floorPrices).toBe("object");
  });

  it("getBackdropFloors — returns floorPrices map", async () => {
    const res = await client.getBackdropFloors();
    expect(res.ok).toBe(true);
    const data = unwrap(res);
    expect(data.floorPrices).toBeDefined();
    expect(typeof data.floorPrices).toBe("object");
  });

  it("getAttributeFloors — returns updated_at", async () => {
    const res = await client.getAttributeFloors();
    expect(res.ok).toBe(true);
    const data = unwrap(res);
    expect(data.updated_at).toBeDefined();
  });

  // ── Collection Offers ──

  it("getOfferCollections — returns collections for offers", async () => {
    const res = await client.getOfferCollections();
    expect(res.ok).toBe(true);
    const data = unwrap(res);
    expect(data.collections).toBeInstanceOf(Array);
  });

  // ── NFTs ──

  it("searchNfts — listed NFTs with limit", async () => {
    const res = await client.searchNfts({
      status: ListingStatus.Listed,
      limit: 5,
    });
    expect(res.ok).toBe(true);
    const data = unwrap(res);
    expect(data.results).toBeInstanceOf(Array);
    expect(data.total_count).toBeDefined();

    if (data.results && data.results.length > 0) {
      const nft = data.results[0];
      expect(nft.id).toBeDefined();
      expect(nft.name).toBeDefined();
      expect(nft.photo_url).toBeDefined();
      expect(nft.collection_id).toBeDefined();
      expect(nft.status).toBe(NftStatus.Listed);
      expect(nft.attributes).toBeInstanceOf(Array);
      expect(typeof nft.is_owned).toBe("boolean");
    }
  });

  it("getOwnedNfts — returns user NFTs", async () => {
    const res = await client.getOwnedNfts({ limit: 5 });
    expect(res.ok).toBe(true);
    const data = unwrap(res);
    expect(data.nfts).toBeInstanceOf(Array);

    if (data.nfts.length > 0) {
      const nft = data.nfts[0];
      expect(nft.id).toBeDefined();
      expect(nft.name).toBeDefined();
      expect(nft.status).toBeDefined();
      expect(Object.values(NftStatus)).toContain(nft.status);
    }
  });

  it("getNftStats — returns listed/unlisted counts", async () => {
    const res = await client.getNftStats();
    expect(res.ok).toBe(true);
    const data = unwrap(res);
    expect(typeof data.listed_count).toBe("number");
    expect(typeof data.unlisted_count).toBe("number");
  });

  // ── Users ──

  it("getUserActions — returns user actions", async () => {
    const res = await client.getUserActions({ limit: 5 });
    expect(res.ok).toBe(true);
    const data = unwrap(res);
    expect(data.actions).toBeInstanceOf(Array);
    if (data.actions.length > 0) {
      expect(data.actions[0].type).toBeDefined();
      expect(data.actions[0].collection_id).toBeDefined();
    }
  });

  // ── Wallets ──

  it("getWalletInfo — returns balance and frozen_funds", async () => {
    const res = await client.getWalletInfo();
    expect(res.ok).toBe(true);
    const data = unwrap(res);
    expect(data.balance).toBeDefined();
    expect(data.frozen_funds).toBeDefined();
    expect(data.premarket_funds).toBeDefined();
  });

  // ── Dynamic data tests (depend on collections existing) ──

  it("getCollectionMetrics — returns history for first collection", async () => {
    const preview = unwrap(await client.getCollectionsPreview());
    const col = preview.collections?.[0];
    if (!col?.id) return;

    const res = await client.getCollectionMetrics(col.id, {
      group_by: "day",
    });
    expect(res.ok).toBe(true);
    expect(unwrap(res).history).toBeInstanceOf(Array);
  });

  it("getTopCollectionOffer — works for first offer-collection", async () => {
    const cols = unwrap(await client.getOfferCollections());
    const col = cols.collections?.[0];
    if (!col?.id) return;

    const res = await client.getTopCollectionOffer(col.id);
    expect(res.ok).toBe(true);
  });

  it("getAllCollectionOffers — works for first offer-collection", async () => {
    const cols = unwrap(await client.getOfferCollections());
    const col = cols.collections?.[0];
    if (!col?.id) return;

    const res = await client.getAllCollectionOffers(col.id, { limit: 3 });
    expect(res.ok).toBe(true);
  });

  it("getModelBackgroundFloors — works with a model name from search", async () => {
    const nfts = unwrap(
      await client.searchNfts({
        status: ListingStatus.Listed,
        limit: 1,
        with_attributes: true,
      }),
    );
    const modelAttr = nfts.results?.[0]?.attributes?.find(
      (a) => a.type === "model",
    );
    if (!modelAttr) return;

    const res = await client.getModelBackgroundFloors([modelAttr.value]);
    expect(res.ok).toBe(true);
    expect(unwrap(res).model_backgrounds).toBeDefined();
  });
});
