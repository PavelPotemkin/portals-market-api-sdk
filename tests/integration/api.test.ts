/**
 * Интеграционный тест против живого Partner API. Только чтение: вызываются лишь GET-методы.
 * Запускается, если задан PORTALS_PARTNER_TOKEN (и опционально PORTALS_PARTNER_BASE_URL);
 * иначе весь набор пропускается. `npm run test:integration`.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { ListingStatus, PortalsMarketClient, unwrap } from "../../src";

const TOKEN = process.env.PORTALS_PARTNER_TOKEN;
const BASE_URL = process.env.PORTALS_PARTNER_BASE_URL;

describe.skipIf(!TOKEN)("Partners API — read-only", () => {
  let client: PortalsMarketClient;
  let collectionId: string | undefined;

  beforeAll(async () => {
    client = new PortalsMarketClient({ token: TOKEN as string, baseUrl: BASE_URL });
    const preview = unwrap(await client.getCollectionsPreview());
    collectionId = preview.collections?.find((c) => c.id)?.id ?? undefined;
  });

  it("getMarketConfig", async () => {
    const data = unwrap(await client.getMarketConfig());
    expect(typeof data.commission).toBe("string");
    expect(typeof data.deposit_wallet).toBe("string");
  });

  it("getMarketActions", async () => {
    const data = unwrap(await client.getMarketActions({ limit: 5 }));
    expect(Array.isArray(data.actions)).toBe(true);
  });

  it("getCollectionFloors / getBackdropFloors / getAttributeFloors", async () => {
    expect(typeof unwrap(await client.getCollectionFloors()).floorPrices).toBe("object");
    expect(typeof unwrap(await client.getBackdropFloors()).floorPrices).toBe("object");
    expect(typeof unwrap(await client.getAttributeFloors()).updated_at).toBe("string");
  });

  it("getOfferCollections / getTopCollectionOffer / getAllCollectionOffers", async () => {
    unwrap(await client.getOfferCollections());
    if (!collectionId) return;
    const top = unwrap(await client.getTopCollectionOffer(collectionId, { scope: "broad" }));
    expect(top === null || typeof top.id === "string").toBe(true);
    const all = unwrap(await client.getAllCollectionOffers(collectionId, { limit: 3 }));
    expect(Array.isArray(all.offers ?? [])).toBe(true);
  });

  it("searchNfts", async () => {
    const data = unwrap(
      await client.searchNfts({ status: ListingStatus.Listed, sort_by: "price asc", limit: 5 }),
    );
    expect(Array.isArray(data.results ?? [])).toBe(true);
  });

  it("getWalletInfo / getNftStats / getUserActions / getOwnedNfts", async () => {
    expect(typeof unwrap(await client.getWalletInfo()).balance).toBe("string");
    expect(typeof unwrap(await client.getNftStats()).listed_count).toBe("number");
    expect(Array.isArray(unwrap(await client.getUserActions({ limit: 5 })).actions)).toBe(true);
    expect(Array.isArray(unwrap(await client.getOwnedNfts({ limit: 5 })).nfts)).toBe(true);
  });

  it("getAllOwnedNfts: портфель unlisted", async () => {
    const data = unwrap(await client.getAllOwnedNfts({ status: "unlisted" }));
    expect(data.items.length).toBeLessThanOrEqual(data.totalCount + 50);
    if (data.complete) expect(data.items).toHaveLength(data.totalCount);
  });
});
