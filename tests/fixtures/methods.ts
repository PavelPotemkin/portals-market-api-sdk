import type { PortalsMarketClient, Result, schemas } from "../../src";
import { json, nft, noContent, offerItem } from "../helpers";

export interface MethodCase {
  /** Имя публичного метода клиента. */
  name: keyof PortalsMarketClient;
  /** Операция спеки, которую метод должен вызвать. */
  operation: schemas.OperationId;
  invoke: (client: PortalsMarketClient) => Promise<Result<unknown, unknown>>;
  method: "GET" | "POST";
  /** Фактический путь запроса. */
  path: string;
  /** Ожидаемый query (строки, как в URL). */
  query?: Record<string, string>;
  /** Ожидаемое JSON-тело; `undefined` — тела нет. */
  body?: unknown;
  response: () => Response;
  /** Проверка разобранного значения. */
  value?: (value: unknown) => void;
}

const config = {
  commission: "5",
  cooldown: 0,
  deposit_wallet: "EQ...",
  rub_course: "90",
  usd_course: "3",
  user_cashback: "0",
};

export const methodCases: MethodCase[] = [
  {
    name: "createCollectionOffer",
    operation: "postCollectionOffers",
    invoke: (c) =>
      c.createCollectionOffer({
        collection_id: "c1",
        amount: "1.5",
        max_nfts: 2,
        expiration_days: 7,
        attributes: [{ type: "model", value: "Cool" }],
      }),
    method: "POST",
    path: "/partners/collection-offers/",
    body: {
      collection_id: "c1",
      amount: "1.5",
      max_nfts: 2,
      expiration_days: 7,
      attributes: [{ type: "model", value: "Cool" }],
    },
    response: () => json({ ...offerItem, sender_id: 1 }, 201),
  },
  {
    name: "bulkUpdateCollectionOffers",
    operation: "postCollectionOffersBulkUpdate",
    invoke: (c) =>
      c.bulkUpdateCollectionOffers({
        offers: [{ id: "o1", amount: "2", max_nfts: 3, expiration_days: 0 }],
      }),
    method: "POST",
    path: "/partners/collection-offers/bulk/update",
    body: { offers: [{ id: "o1", amount: "2", max_nfts: 3, expiration_days: 0 }] },
    response: () =>
      json({ updated: ["o1"], failed: [{ id: "o2", reason: "insufficient balance" }] }),
  },
  {
    name: "cancelCollectionOffer",
    operation: "postCollectionOffersCancel",
    invoke: (c) => c.cancelCollectionOffer({ id: "o1" }),
    method: "POST",
    path: "/partners/collection-offers/cancel",
    body: { id: "o1" },
    response: noContent,
    value: (v) => {
      if (v !== undefined) throw new Error("expected void");
    },
  },
  {
    name: "acceptCollectionOffer",
    operation: "postCollectionOffersAccept",
    invoke: (c) => c.acceptCollectionOffer("o 1/x", { amount: "3.5", nft_ids: ["n1"] }),
    method: "POST",
    path: "/partners/collection-offers/o%201%2Fx/accept",
    body: { amount: "3.5", nft_ids: ["n1"] },
    response: noContent,
  },
  {
    name: "getOfferCollections",
    operation: "getCollectionOffersCollections",
    invoke: (c) => c.getOfferCollections(),
    method: "GET",
    path: "/partners/collection-offers/collections",
    response: () => json({ collections: [{ name: "Plush Pepe", photo_url: "p" }], total_count: 1 }),
  },
  {
    name: "getTopCollectionOffer",
    operation: "getCollectionOffersTop",
    invoke: (c) => c.getTopCollectionOffer("c1", { scope: "broad" }),
    method: "GET",
    path: "/partners/collection-offers/c1/top",
    query: { scope: "broad" },
    response: () => json(offerItem),
  },
  {
    name: "getAllCollectionOffers",
    operation: "getCollectionOffersAll",
    invoke: (c) => c.getAllCollectionOffers("c1", { limit: 5, scope: "trait" }),
    method: "GET",
    path: "/partners/collection-offers/c1/all",
    query: { limit: "5", scope: "trait" },
    response: () => json({ offers: [offerItem], total_count: 1 }),
  },
  {
    name: "getAttributeFloors",
    operation: "getCollectionsAttributeFloors",
    invoke: (c) => c.getAttributeFloors(),
    method: "GET",
    path: "/partners/collections/attribute-floors",
    response: () =>
      json({
        models: [{ collection_name: "X", floor_price: "1", name: "Cool" }],
        updated_at: "2026-10-22T00:00:00Z",
        attribute_floors: { X: { models: { Cool: "1" }, backdrops: {}, symbols: {} } },
      }),
  },
  {
    name: "getBackdropFloors",
    operation: "getCollectionsBackdropsFloors",
    invoke: (c) => c.getBackdropFloors(),
    method: "GET",
    path: "/partners/collections/backdrops/floors",
    response: () => json({ floorPrices: { Black: "10" } }),
  },
  {
    name: "getCollectionFloors",
    operation: "getCollectionsFloors",
    invoke: (c) => c.getCollectionFloors(),
    method: "GET",
    path: "/partners/collections/floors",
    response: () => json({ floorPrices: { "Plush Pepe": "5000" } }),
  },
  {
    name: "getModelBackgroundFloors",
    operation: "getCollectionsModelsBackgroundsFloors",
    invoke: (c) => c.getModelBackgroundFloors(["Cool", "Hot"]),
    method: "GET",
    path: "/partners/collections/models/backgrounds/floors",
    query: { models: "Cool,Hot" },
    response: () => json({ model_backgrounds: { Cool: { Black: "1" } } }),
  },
  {
    name: "getCollectionsPreview",
    operation: "getCollectionsPreview",
    invoke: (c) => c.getCollectionsPreview({ sort_by: "floor_price", sort_order: "desc" }),
    method: "GET",
    path: "/partners/collections/preview",
    query: { sort_by: "floor_price", sort_order: "desc" },
    response: () => json({ collections: [{ id: "c1", name: "Plush Pepe", is_new: true }] }),
  },
  {
    name: "getCollectionMetrics",
    operation: "getCollectionsMetrics",
    invoke: (c) => c.getCollectionMetrics("c1", { group_by: "day", from: "2026-10-01" }),
    method: "GET",
    path: "/partners/collections/c1/metrics",
    query: { group_by: "day", from: "2026-10-01" },
    response: () =>
      json({ history: [{ avg_price: "1", collection_id: "c1", total_volume: "10" }] }),
  },
  {
    name: "generateDepositId",
    operation: "postDeposits",
    invoke: (c) => c.generateDepositId(),
    method: "POST",
    path: "/partners/deposits",
    response: () => json({ id: "dep-1" }),
  },
  {
    name: "getMarketActions",
    operation: "getMarketActions",
    invoke: (c) =>
      c.getMarketActions({ action_types: ["buy", "lucky_buy"], limit: 10, period: "seven_days" }),
    method: "GET",
    path: "/partners/market/actions/",
    query: { action_types: "buy,lucky_buy", limit: "10", period: "seven_days" },
    response: () =>
      json({ actions: [{ type: "purchase", created_at: "2026-10-01T00:00:00Z", old_price: "1" }] }),
  },
  {
    name: "getMarketConfig",
    operation: "getMarketConfig",
    invoke: (c) => c.getMarketConfig(),
    method: "GET",
    path: "/partners/market/config",
    response: () => json(config),
  },
  {
    name: "buyNfts",
    operation: "postNfts",
    invoke: (c) => c.buyNfts({ nft_details: [{ id: "n1", price: "1.5" }] }),
    method: "POST",
    path: "/partners/nfts",
    body: { nft_details: [{ id: "n1", price: "1.5" }] },
    response: () =>
      json({
        total_requested: 1,
        total_purchased: 1,
        total_failed: 0,
        total_spent: "1.5",
        purchase_results: [{ id: "n1", status: "success", price: "1.5" }],
        invalid_nfts: [],
        updated_nfts: [],
      }),
  },
  {
    name: "bulkListNfts",
    operation: "postNftsBulkList",
    invoke: (c) => c.bulkListNfts({ nft_prices: [{ nft_id: "n1", price: "2" }] }),
    method: "POST",
    path: "/partners/nfts/bulk-list",
    body: { nft_prices: [{ nft_id: "n1", price: "2" }] },
    response: () => json({ successful_nfts: ["n1"], failed_nfts: [] }),
  },
  {
    name: "bulkUnlistNfts",
    operation: "postNftsBulkUnlist",
    invoke: (c) => c.bulkUnlistNfts({ nft_ids: ["n1"] }),
    method: "POST",
    path: "/partners/nfts/bulk-unlist",
    body: { nft_ids: ["n1"] },
    response: () => json({ successful_nfts: [], failed_nfts: [{ nft_id: "n1", reason: "x" }] }),
  },
  {
    name: "getOwnedNfts",
    operation: "getNftsOwned",
    invoke: (c) =>
      c.getOwnedNfts({
        status: "unlisted",
        statuses: ["listed", "unlisted"],
        collection_ids: ["a", "b"],
        limit: 50,
        offset: 0,
        with_attributes: true,
      }),
    method: "GET",
    path: "/partners/nfts/owned",
    query: {
      status: "unlisted",
      statuses: "listed,unlisted",
      collection_ids: "a,b",
      limit: "50",
      offset: "0",
      with_attributes: "true",
    },
    response: () => json({ nfts: [nft], total_count: 1 }),
  },
  {
    name: "searchNfts",
    operation: "getNftsSearch",
    invoke: (c) =>
      c.searchNfts({
        collection_id: "c1",
        min_price: "1.5",
        max_price: "10",
        sort_by: "price asc",
        status: "listed",
      }),
    method: "GET",
    path: "/partners/nfts/search",
    query: {
      collection_id: "c1",
      min_price: "1.5",
      max_price: "10",
      sort_by: "price asc",
      status: "listed",
    },
    response: () => json({ results: [{ ...nft, is_owned: false }], total_count: 1 }),
  },
  {
    name: "getNftStats",
    operation: "getNftsStats",
    invoke: (c) => c.getNftStats(),
    method: "GET",
    path: "/partners/nfts/stats",
    response: () => json({ listed_count: 1, unlisted_count: 2 }),
  },
  {
    name: "transferGifts",
    operation: "postNftsTransfer",
    invoke: (c) => c.transferGifts({ recipient_token: "tok", nft_ids: ["n1"] }),
    method: "POST",
    path: "/partners/nfts/transfer",
    body: { recipient_token: "tok", nft_ids: ["n1"] },
    response: () =>
      json({ transferred_count: 1, failed_items: [], recipient: { user_id: 7, username: "u" } }),
  },
  {
    name: "withdrawGifts",
    operation: "postNftsWithdraw",
    invoke: (c) => c.withdrawGifts({ gift_ids: ["n1"], unsafe_transfer: false }),
    method: "POST",
    path: "/partners/nfts/withdraw",
    body: { gift_ids: ["n1"], unsafe_transfer: false },
    response: () => json({ withdrawals_ids: [11] }),
  },
  {
    name: "getWithdrawalStatuses",
    operation: "getNftsWithdrawalsStatuses",
    invoke: (c) => c.getWithdrawalStatuses([11, 12]),
    method: "GET",
    path: "/partners/nfts/withdrawals/statuses",
    query: { ids: "11,12" },
    response: () =>
      json({
        statuses: [{ id: 11, status: "completed", details: "gift transferred successfully" }],
      }),
  },
  {
    name: "listNft",
    operation: "postNftsList",
    invoke: (c) => c.listNft("n1", { price: "3" }),
    method: "POST",
    path: "/partners/nfts/n1/list",
    body: { price: "3" },
    response: noContent,
  },
  {
    name: "unlistNft",
    operation: "postNftsUnlist",
    invoke: (c) => c.unlistNft("n1"),
    method: "POST",
    path: "/partners/nfts/n1/unlist",
    response: noContent,
  },
  {
    name: "checkUserExists",
    operation: "getUsers",
    invoke: (c) => c.checkUserExists(123456),
    method: "GET",
    path: "/partners/users/123456",
    response: () => json({ exists: true }),
  },
  {
    name: "getUserActions",
    operation: "getUsersActions",
    invoke: (c) => c.getUserActions({ limit: 5, sort_by: "created_at desc" }),
    method: "GET",
    path: "/partners/users/actions",
    query: { limit: "5", sort_by: "created_at desc" },
    response: () =>
      json({
        actions: [{ type: "purchase", collection_id: "c1", related_entity_id: "x" }],
        total_actions: 1,
      }),
  },
  {
    name: "getWalletInfo",
    operation: "getUsersWallets",
    invoke: (c) => c.getWalletInfo(),
    method: "GET",
    path: "/partners/users/wallets/",
    response: () => json({ balance: "10.5", frozen_funds: "1", premarket_funds: "0" }),
  },
  {
    name: "withdrawTon",
    operation: "postUsersWalletsWithdraw",
    invoke: (c) => c.withdrawTon({ amount: "1", external_address: "EQabc" }),
    method: "POST",
    path: "/partners/users/wallets/withdraw",
    body: { amount: "1", external_address: "EQabc" },
    response: () => json({ id: "w1" }),
  },
  {
    name: "getWalletWithdrawalStatuses",
    operation: "getUsersWalletsWithdrawalsStatuses",
    invoke: (c) => c.getWalletWithdrawalStatuses(["w1", "w2"]),
    method: "GET",
    path: "/partners/users/wallets/withdrawals/statuses",
    query: { ids: "w1,w2" },
    response: () => json({ status: [{ id: "w1", status: "pending" }] }),
  },
];
