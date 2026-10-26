// Сгенерировано scripts/generate.ts из spec/partners.swagger.json и spec/overrides.ts.
// Не редактировать вручную: `npm run generate`.

import { z } from "zod";

/** Строка из известного набора значений, но в ответах принимается и любое новое значение. */
function openEnum<T extends string>(): z.ZodType<T | (string & {})> {
  return z.string() as z.ZodType<T | (string & {})>;
}

function exactlyOneOf(fields: string[]) {
  return (value: Record<string, unknown>) =>
    fields.filter((f) => value[f] !== undefined && value[f] !== null).length === 1;
}

/** Версия спеки: `info.version`. */
export const SPEC_VERSION = "1.0.0";

/** Глобальный лимит из описания спеки, req/s на токен; `null` — лимит задаёт тариф ключа. */
export const GLOBAL_RATE_LIMIT: number | null = null;

// ── Enums ──

/** `httptrustedapps.arenaBet.betType` */
export const ArenaBetType = {
  Ton: "ton",
  Gift: "gift",
} as const;
export type ArenaBetType = (typeof ArenaBetType)[keyof typeof ArenaBetType];
export const ArenaBetTypeSchema = z.enum(ArenaBetType);

/** `httptrustedapps.arenaGame.status` */
export const ArenaGameStatus = {
  Idle: "idle",
  Countdown: "countdown",
  Preparing: "preparing",
  Active: "active",
  Settling: "settling",
  Completed: "completed",
} as const;
export type ArenaGameStatus = (typeof ArenaGameStatus)[keyof typeof ArenaGameStatus];
export const ArenaGameStatusSchema = z.enum(ArenaGameStatus);

/** `httptrustedapps.arenaRoom.mode` */
export const ArenaRoomMode = {
  Classic: "classic",
  Team: "team",
} as const;
export type ArenaRoomMode = (typeof ArenaRoomMode)[keyof typeof ArenaRoomMode];
export const ArenaRoomModeSchema = z.enum(ArenaRoomMode);

/** `model.BundleStatus` */
export const BundleStatus = {
  Listed: "listed",
  Unlisted: "unlisted",
  Separated: "separated",
} as const;
export type BundleStatus = (typeof BundleStatus)[keyof typeof BundleStatus];
export const BundleStatusSchema = z.enum(BundleStatus);

/** `GET /partners/collection-offers/{collection_id}/all query:scope` */
export const CollectionOfferScopeType = {
  Broad: "broad",
  Trait: "trait",
} as const;
export type CollectionOfferScopeType = (typeof CollectionOfferScopeType)[keyof typeof CollectionOfferScopeType];
export const CollectionOfferScopeTypeSchema = z.enum(CollectionOfferScopeType);

/** `GET /partners/collections/preview query:sort_by` */
export const CollectionSortBy = {
  Name: "name",
  FloorPrice: "floor_price",
} as const;
export type CollectionSortBy = (typeof CollectionSortBy)[keyof typeof CollectionSortBy];
export const CollectionSortBySchema = z.enum(CollectionSortBy);

/** `GET /partners/nfts/owned query:is_crafted_status` */
export const CraftedStatus = {
  All: "all",
  Crafted: "crafted",
  NotCrafted: "not_crafted",
} as const;
export type CraftedStatus = (typeof CraftedStatus)[keyof typeof CraftedStatus];
export const CraftedStatusSchema = z.enum(CraftedStatus);

/** `model.DepositBonusClaimStatus` */
export const DepositBonusClaimStatus = {
  Pending: "pending",
  Claimable: "claimable",
  Paid: "paid",
  Forfeited: "forfeited",
} as const;
export type DepositBonusClaimStatus = (typeof DepositBonusClaimStatus)[keyof typeof DepositBonusClaimStatus];
export const DepositBonusClaimStatusSchema = z.enum(DepositBonusClaimStatus);

/** `nft.InvalidNftReason` */
export const InvalidNftReason = {
  NftNotFound: "NFT_NOT_FOUND",
  NftNotListed: "NFT_NOT_LISTED",
  OwnerChanged: "OWNER_CHANGED",
  PriceChanged: "PRICE_CHANGED",
  SelfPurchase: "SELF_PURCHASE",
  DuplicateNft: "DUPLICATE_NFT",
  BundledNft: "BUNDLED_NFT",
  NftNotImported: "NFT_NOT_IMPORTED",
  NftNotAvailable: "NFT_NOT_AVAILABLE",
} as const;
export type InvalidNftReason = (typeof InvalidNftReason)[keyof typeof InvalidNftReason];
export const InvalidNftReasonSchema = z.enum(InvalidNftReason);

/** `GET /partners/market/actions/ query:status` */
export const ListingStatus = {
  Listed: "listed",
  Unlisted: "unlisted",
} as const;
export type ListingStatus = (typeof ListingStatus)[keyof typeof ListingStatus];
export const ListingStatusSchema = z.enum(ListingStatus);

/** `GET /partners/market/actions/ query:action_types` */
export const MarketActionType = {
  BundleOffer: "bundle_offer",
  BundlePurchase: "bundle_purchase",
  BundleBundled: "bundle_bundled",
  BundleSeparated: "bundle_separated",
  Sell: "sell",
  Buy: "buy",
  LuckyBuy: "lucky_buy",
  Offer: "offer",
  Listing: "listing",
  PriceUpdate: "price_update",
  Delist: "delist",
  Transfer: "transfer",
  Cancel: "cancel",
  Reject: "reject",
  LootPack: "loot_pack",
  LootPackTakeGift: "loot_pack_take_gift",
  LootPackGram: "loot_pack_gram",
  LootPackPayout: "loot_pack_payout",
  LuckyCraft: "lucky_craft",
  LuckyCraftWin: "lucky_craft_win",
  LuckyCraftLoss: "lucky_craft_loss",
} as const;
export type MarketActionType = (typeof MarketActionType)[keyof typeof MarketActionType];
export const MarketActionTypeSchema = z.enum(MarketActionType);

/** `GET /partners/nfts/owned query:mint_status` */
export const MintStatus = {
  All: "all",
  Minted: "minted",
  NotMinted: "not_minted",
} as const;
export type MintStatus = (typeof MintStatus)[keyof typeof MintStatus];
export const MintStatusSchema = z.enum(MintStatus);

/** `model.NftAttributeType` */
export const NftAttributeType = {
  Model: "model",
  Backdrop: "backdrop",
  Symbol: "symbol",
} as const;
export type NftAttributeType = (typeof NftAttributeType)[keyof typeof NftAttributeType];
export const NftAttributeTypeSchema = z.enum(NftAttributeType);

/** `model.NftImportSource` */
export const NftImportSource = {
  Bot: "bot",
  UserBot: "user_bot",
} as const;
export type NftImportSource = (typeof NftImportSource)[keyof typeof NftImportSource];
export const NftImportSourceSchema = z.enum(NftImportSource);

/** `model.NftStatus` */
export const NftStatus = {
  Listed: "listed",
  Unlisted: "unlisted",
  Withdrawn: "withdrawn",
  Auction: "auction",
  GiveawayLocked: "giveaway_locked",
  Bundle: "bundle",
  Deleted: "deleted",
} as const;
export type NftStatus = (typeof NftStatus)[keyof typeof NftStatus];
export const NftStatusSchema = z.enum(NftStatus);

/** `GET /partners/market/actions/ query:period` */
export const Period = {
  SevenDays: "seven_days",
  FourteenDays: "fourteen_days",
  OneMonth: "one_month",
} as const;
export type Period = (typeof Period)[keyof typeof Period];
export const PeriodSchema = z.enum(Period);

/** `GET /partners/nfts/owned query:premarket_status` */
export const PremarketFilterStatus = {
  All: "all",
  OnlyPremarket: "only_premarket",
  WithoutPremarket: "without_premarket",
  Draft: "draft",
  Listed: "listed",
  Sold: "sold",
} as const;
export type PremarketFilterStatus = (typeof PremarketFilterStatus)[keyof typeof PremarketFilterStatus];
export const PremarketFilterStatusSchema = z.enum(PremarketFilterStatus);

/** `model.PremarketOrderStatus` */
export const PremarketOrderStatus = {
  Draft: "draft",
  Listed: "listed",
  Sold: "sold",
  Transferring: "transferring",
  Completed: "completed",
  Cancelled: "cancelled",
  Expired: "expired",
  Failed: "failed",
  Hidden: "hidden",
  Deleted: "deleted",
} as const;
export type PremarketOrderStatus = (typeof PremarketOrderStatus)[keyof typeof PremarketOrderStatus];
export const PremarketOrderStatusSchema = z.enum(PremarketOrderStatus);

/** `GET /partners/market/actions/ query:sort_by` */
export const SortByActions = {
  ListedAtDesc: "listed_at desc",
  PriceAsc: "price asc",
  PriceDesc: "price desc",
  ExternalCollectionNumberAsc: "external_collection_number asc",
  ExternalCollectionNumberDesc: "external_collection_number desc",
  ModelRarityAsc: "model_rarity asc",
  ModelRarityDesc: "model_rarity desc",
  CreatedAtAsc: "created_at asc",
  CreatedAtDesc: "created_at desc",
  IdDesc: "id desc",
  IdAsc: "id asc",
} as const;
export type SortByActions = (typeof SortByActions)[keyof typeof SortByActions];
export const SortByActionsSchema = z.enum(SortByActions);

/** `GET /partners/nfts/owned query:sort_by` */
export const SortByNfts = {
  ListedAtDesc: "listed_at desc",
  PriceAsc: "price asc",
  PriceDesc: "price desc",
  ExternalCollectionNumberAsc: "external_collection_number asc",
  ExternalCollectionNumberDesc: "external_collection_number desc",
  ModelRarityAsc: "model_rarity asc",
  ModelRarityDesc: "model_rarity desc",
  NameAsc: "name asc",
  NameDesc: "name desc",
} as const;
export type SortByNfts = (typeof SortByNfts)[keyof typeof SortByNfts];
export const SortByNftsSchema = z.enum(SortByNfts);

/** `GET /partners/collections/preview query:sort_order` */
export const SortOrder = {
  Asc: "asc",
  Desc: "desc",
} as const;
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export const SortOrderSchema = z.enum(SortOrder);

/** `model.TonWithdrawalStatus` */
export const TonWithdrawalStatus = {
  Pending: "pending",
  InProgress: "in_progress",
  Resolved: "resolved",
} as const;
export type TonWithdrawalStatus = (typeof TonWithdrawalStatus)[keyof typeof TonWithdrawalStatus];
export const TonWithdrawalStatusSchema = z.enum(TonWithdrawalStatus);

/** `model.UserActionType` */
export const UserActionType = {
  Purchase: "purchase",
  Offer: "offer",
  CollectionOffer: "collection_offer",
  Listing: "listing",
  PriceUpdate: "price_update",
  Delist: "delist",
  Reject: "reject",
  Cancel: "cancel",
  Transfer: "transfer",
  GiveawaySent: "giveaway_sent",
  GiveawayWon: "giveaway_won",
  PremarketCollateral: "premarket_collateral",
  BundleListing: "bundle_listing",
  BundleDelisting: "bundle_delisting",
  BundleSeparated: "bundle_separated",
  BundleBundled: "bundle_bundled",
  BundlePurchase: "bundle_purchase",
  BundleOffer: "bundle_offer",
  BundleTransfer: "bundle_transfer",
  BundlePriceUpdate: "bundle_price_update",
  LuckyBuyWin: "lucky_buy_win",
  LuckyBuyLoss: "lucky_buy_loss",
  LootPackGram: "loot_pack_gram",
  LootPackPayout: "loot_pack_payout",
  LootPackTakeGift: "loot_pack_take_gift",
  LuckyCraftWin: "lucky_craft_win",
  LuckyCraftLoss: "lucky_craft_loss",
  LuckyCraftStake: "lucky_craft_stake",
} as const;
export type UserActionType = (typeof UserActionType)[keyof typeof UserActionType];
export const UserActionTypeSchema = z.enum(UserActionType);

/** `nft.WithdrawalStatus.details` */
export const WithdrawalStatusDetails = {
  Undetermined: "failed to determine withdrawal status",
  Transferred: "gift transferred successfully",
  ReturnedToSender: "gift could not be sent inside app; recipient not registered; gift returned to sender; commission returned to sender",
  GiftIdIsNil: "GiftID is nil",
  ReturnedToRecipient: "gift could not be sent inside app; recipient registered; gift returned to recipient; commission returned to recipient",
  NotOnRelayer: "gift is not on relayer; cannot transfer; write to tech support",
} as const;
export type WithdrawalStatusDetails = (typeof WithdrawalStatusDetails)[keyof typeof WithdrawalStatusDetails];
export const WithdrawalStatusDetailsSchema = z.enum(WithdrawalStatusDetails);

/** `nft.WithdrawalStatus.status` */
export const WithdrawalStatusValue = {
  Pending: "pending",
  Completed: "completed",
  Errored: "errored",
  Recovered: "recovered",
  Unknown: "unknown",
} as const;
export type WithdrawalStatusValue = (typeof WithdrawalStatusValue)[keyof typeof WithdrawalStatusValue];
export const WithdrawalStatusValueSchema = z.enum(WithdrawalStatusValue);

// ── Definitions ──

/** `httptrustedapps.AcceptOfferRequest` (запрос) */
export interface AcceptOfferRequest {
  amount: string;
  nft_ids: string[];
}

/** `httptrustedapps.AcceptOfferRequest` (запрос) */
export const AcceptOfferRequestSchema: z.ZodType<AcceptOfferRequest> = z.object({
  amount: z.string(),
  nft_ids: z.array(z.string()).min(1).max(50),
});

/** `model.AnonymizedUserAction` (ответ) */
export interface AnonymizedUserAction {
  amount?: string | null;
  bundle?: BundleExtended | null;
  created_at: string;
  nft?: UserActionNft | null;
  offer_id?: string | null;
  old_price?: string | null;
  type: UserActionType | (string & {});
  [key: string]: unknown;
}

/** `model.AnonymizedUserAction` (ответ) */
export const AnonymizedUserActionSchema: z.ZodType<AnonymizedUserAction> = z.looseObject({
  amount: z.string().nullish(),
  bundle: z.lazy(() => BundleExtendedSchema).nullish(),
  created_at: z.string(),
  nft: z.lazy(() => UserActionNftSchema).nullish(),
  offer_id: z.string().nullish(),
  old_price: z.string().nullish(),
  type: openEnum<UserActionType>(),
});

/** `httptrustedapps.arenaBet` (ответ) */
export interface ArenaBet {
  amount: string;
  betType: ArenaBetType | (string & {});
  createdAt: number;
  mine: boolean;
  playerId: string;
  playerName: string;
  [key: string]: unknown;
}

/** `httptrustedapps.arenaBet` (ответ) */
export const ArenaBetSchema: z.ZodType<ArenaBet> = z.looseObject({
  amount: z.string(),
  betType: openEnum<ArenaBetType>(),
  createdAt: z.number(),
  mine: z.boolean(),
  playerId: z.string(),
  playerName: z.string(),
});

/** `httptrustedapps.arenaBetRequest` (запрос) */
export interface ArenaBetRequest {
  /** required for ton */
  amount?: string | null;
  bet_type: ArenaBetType;
  /** required for gift, 1-50 ids */
  gift_ids?: string[] | null;
  room_id: number;
  /** team rooms only */
  team_id?: string | null;
}

/** `httptrustedapps.arenaBetRequest` (запрос) */
export const ArenaBetRequestSchema: z.ZodType<ArenaBetRequest> = z.object({
  /** required for ton */
  amount: z.string().nullish(),
  bet_type: ArenaBetTypeSchema,
  /** required for gift, 1-50 ids */
  gift_ids: z.array(z.string()).min(1).max(50).nullish(),
  room_id: z.number().int(),
  /** team rooms only */
  team_id: z.string().nullish(),
}).refine(exactlyOneOf(["amount","gift_ids"]), {
  message: "Exactly one of amount, gift_ids must be set",
  path: ["amount"],
});

/** `httptrustedapps.arenaBetResponse` (ответ) */
export interface ArenaBetResponse {
  acceptedAmount: string | null;
  betId: string;
  gameId: number;
  room: ArenaRoom | null;
  serverTime: number;
  [key: string]: unknown;
}

/** `httptrustedapps.arenaBetResponse` (ответ) */
export const ArenaBetResponseSchema: z.ZodType<ArenaBetResponse> = z.looseObject({
  acceptedAmount: z.string().nullable(),
  betId: z.string(),
  gameId: z.number(),
  room: z.lazy(() => ArenaRoomSchema).nullable(),
  serverTime: z.number(),
});

/** `httptrustedapps.arenaGame` (ответ) */
export interface ArenaGame {
  bets: ArenaBet[];
  countdownEndsAt?: number | null;
  id: number;
  playerCount: number;
  prizePool: string;
  status: ArenaGameStatus | (string & {});
  [key: string]: unknown;
}

/** `httptrustedapps.arenaGame` (ответ) */
export const ArenaGameSchema: z.ZodType<ArenaGame> = z.looseObject({
  bets: z.array(z.lazy(() => ArenaBetSchema)),
  countdownEndsAt: z.number().nullish(),
  id: z.number(),
  playerCount: z.number(),
  prizePool: z.string(),
  status: openEnum<ArenaGameStatus>(),
});

/** `httptrustedapps.arenaInventoryAttr` (ответ) */
export interface ArenaInventoryAttr {
  floor?: string | null;
  rarityPerMille: number;
  type: string;
  value: string;
  [key: string]: unknown;
}

/** `httptrustedapps.arenaInventoryAttr` (ответ) */
export const ArenaInventoryAttrSchema: z.ZodType<ArenaInventoryAttr> = z.looseObject({
  floor: z.string().nullish(),
  rarityPerMille: z.number(),
  type: z.string(),
  value: z.string(),
});

/** `httptrustedapps.arenaInventoryItem` (ответ) */
export interface ArenaInventoryItem {
  animationUrl?: string | null;
  attributes: ArenaInventoryAttr[];
  collection: string;
  collectionId: string;
  externalCollectionNumber: number;
  floorPrice?: string | null;
  hasAnimation: boolean;
  id: string;
  importSource: string;
  isCrafted: boolean;
  name: string;
  photoUrl: string;
  price: string;
  status: string;
  tgId?: string | null;
  [key: string]: unknown;
}

/** `httptrustedapps.arenaInventoryItem` (ответ) */
export const ArenaInventoryItemSchema: z.ZodType<ArenaInventoryItem> = z.looseObject({
  animationUrl: z.string().nullish(),
  attributes: z.array(z.lazy(() => ArenaInventoryAttrSchema)),
  collection: z.string(),
  collectionId: z.string(),
  externalCollectionNumber: z.number(),
  floorPrice: z.string().nullish(),
  hasAnimation: z.boolean(),
  id: z.string(),
  importSource: z.string(),
  isCrafted: z.boolean(),
  name: z.string(),
  photoUrl: z.string(),
  price: z.string(),
  status: z.string(),
  tgId: z.string().nullish(),
});

/** `httptrustedapps.arenaInventoryResponse` (ответ) */
export interface ArenaInventoryResponse {
  items: ArenaInventoryItem[];
  totalCount: number;
  [key: string]: unknown;
}

/** `httptrustedapps.arenaInventoryResponse` (ответ) */
export const ArenaInventoryResponseSchema: z.ZodType<ArenaInventoryResponse> = z.looseObject({
  items: z.array(z.lazy(() => ArenaInventoryItemSchema)),
  totalCount: z.number(),
});

/** `httptrustedapps.arenaRoom` (ответ) */
export interface ArenaRoom {
  allowGiftBets: boolean;
  countdownDurationSeconds: number;
  game: ArenaGame | null;
  maxBetAmount: string;
  maxPlayersCount: number;
  minBetAmount: string;
  mode: ArenaRoomMode | (string & {});
  roomId: number;
  [key: string]: unknown;
}

/** `httptrustedapps.arenaRoom` (ответ) */
export const ArenaRoomSchema: z.ZodType<ArenaRoom> = z.looseObject({
  allowGiftBets: z.boolean(),
  countdownDurationSeconds: z.number(),
  game: z.lazy(() => ArenaGameSchema).nullable(),
  maxBetAmount: z.string(),
  maxPlayersCount: z.number(),
  minBetAmount: z.string(),
  mode: openEnum<ArenaRoomMode>(),
  roomId: z.number(),
});

/** `httptrustedapps.arenaStateResponse` (ответ) */
export interface ArenaStateResponse {
  rooms: ArenaRoom[];
  serverTime: number;
  [key: string]: unknown;
}

/** `httptrustedapps.arenaStateResponse` (ответ) */
export const ArenaStateResponseSchema: z.ZodType<ArenaStateResponse> = z.looseObject({
  rooms: z.array(z.lazy(() => ArenaRoomSchema)),
  serverTime: z.number(),
});

/** `dtocollectionfiltersrepo.AttributeFloorInfo` (ответ) */
export interface AttributeFloorInfo {
  collection_name: string;
  floor_price: string;
  name: string;
  [key: string]: unknown;
}

/** `dtocollectionfiltersrepo.AttributeFloorInfo` (ответ) */
export const AttributeFloorInfoSchema: z.ZodType<AttributeFloorInfo> = z.looseObject({
  collection_name: z.string(),
  floor_price: z.string(),
  name: z.string(),
});

/** `model.AttributeFloorPrices` (ответ) */
export type AttributeFloorPrices = Record<string, string>;

/** `model.AttributeFloorPrices` (ответ) */
export const AttributeFloorPricesSchema: z.ZodType<AttributeFloorPrices> = z.record(z.string(), z.string());

/** `nft.AttributeFloorsMap` (ответ) */
export interface AttributeFloorsMap {
  backdrops: Record<string, string>;
  models: Record<string, string>;
  symbols: Record<string, string>;
  [key: string]: unknown;
}

/** `nft.AttributeFloorsMap` (ответ) */
export const AttributeFloorsMapSchema: z.ZodType<AttributeFloorsMap> = z.looseObject({
  backdrops: z.record(z.string(), z.string()),
  models: z.record(z.string(), z.string()),
  symbols: z.record(z.string(), z.string()),
});

/** `nft.BulkDelistIn` (запрос) */
export interface BulkDelistIn {
  nft_ids: string[];
}

/** `nft.BulkDelistIn` (запрос) */
export const BulkDelistInSchema: z.ZodType<BulkDelistIn> = z.object({
  nft_ids: z.array(z.string()),
});

/** `nft.BulkListForSaleIn` (запрос) */
export interface BulkListForSaleIn {
  nft_prices: NftPriceDetail[];
}

/** `nft.BulkListForSaleIn` (запрос) */
export const BulkListForSaleInSchema: z.ZodType<BulkListForSaleIn> = z.object({
  nft_prices: z.array(z.lazy(() => NftPriceDetailSchema)).min(1),
});

/** `dtonft.BulkListingResult` (ответ) */
export interface BulkListingResult {
  failed_nfts?: FailedNft[] | null;
  successful_nfts?: string[] | null;
  [key: string]: unknown;
}

/** `dtonft.BulkListingResult` (ответ) */
export const BulkListingResultSchema: z.ZodType<BulkListingResult> = z.looseObject({
  failed_nfts: z.array(z.lazy(() => FailedNftSchema)).nullish(),
  successful_nfts: z.array(z.string()).nullish(),
});

/** `httptrustedapps.BulkUpdateOfferItem` (запрос) */
export interface BulkUpdateOfferItem {
  amount: string;
  expiration_days?: 0 | 1 | 7 | null;
  id: string;
  max_nfts?: number | null;
}

/** `httptrustedapps.BulkUpdateOfferItem` (запрос) */
export const BulkUpdateOfferItemSchema: z.ZodType<BulkUpdateOfferItem> = z.object({
  amount: z.string(),
  expiration_days: z.union([z.literal(0), z.literal(1), z.literal(7)]).nullish(),
  id: z.string(),
  max_nfts: z.number().int().min(1).max(50).nullish(),
});

/** `httptrustedapps.BulkUpdateOffersRequest` (запрос) */
export interface BulkUpdateOffersRequest {
  offers: BulkUpdateOfferItem[];
}

/** `httptrustedapps.BulkUpdateOffersRequest` (запрос) */
export const BulkUpdateOffersRequestSchema: z.ZodType<BulkUpdateOffersRequest> = z.object({
  offers: z.array(z.lazy(() => BulkUpdateOfferItemSchema)).min(1).max(50),
});

/** `model.BundleExtended` (ответ) */
export interface BundleExtended {
  created_at: string;
  floor_price: string;
  id: number;
  is_owned?: boolean | null;
  nfts: BundleNft[];
  nfts_count: number;
  price?: string | null;
  status: BundleStatus | (string & {});
  [key: string]: unknown;
}

/** `model.BundleExtended` (ответ) */
export const BundleExtendedSchema: z.ZodType<BundleExtended> = z.looseObject({
  created_at: z.string(),
  floor_price: z.string(),
  id: z.number(),
  is_owned: z.boolean().nullish(),
  nfts: z.array(z.lazy(() => BundleNftSchema)),
  nfts_count: z.number(),
  price: z.string().nullish(),
  status: openEnum<BundleStatus>(),
});

/** `model.BundleNft` (ответ) */
export interface BundleNft {
  added_at: string;
  bundle_id: number;
  nft: BundleNftDetails;
  position: number;
  [key: string]: unknown;
}

/** `model.BundleNft` (ответ) */
export const BundleNftSchema: z.ZodType<BundleNft> = z.looseObject({
  added_at: z.string(),
  bundle_id: z.number(),
  nft: z.lazy(() => BundleNftDetailsSchema),
  position: z.number(),
});

/** `model.BundleNftDetails` (ответ) */
export interface BundleNftDetails {
  collection_floor_price?: string | null;
  external_collection_number: number;
  id: string;
  name: string;
  photo_url: string;
  status: NftStatus | (string & {});
  tg_id?: string | null;
  [key: string]: unknown;
}

/** `model.BundleNftDetails` (ответ) */
export const BundleNftDetailsSchema: z.ZodType<BundleNftDetails> = z.looseObject({
  collection_floor_price: z.string().nullish(),
  external_collection_number: z.number(),
  id: z.string(),
  name: z.string(),
  photo_url: z.string(),
  status: openEnum<NftStatus>(),
  tg_id: z.string().nullish(),
});

/** `nft.BuyDetail` (запрос) */
export interface BuyDetail {
  id: string;
  price: string;
}

/** `nft.BuyDetail` (запрос) */
export const BuyDetailSchema: z.ZodType<BuyDetail> = z.object({
  id: z.string(),
  price: z.string(),
});

/** `nft.BuyPartialIn` (запрос) */
export interface BuyPartialIn {
  nft_details: BuyDetail[];
}

/** `nft.BuyPartialIn` (запрос) */
export const BuyPartialInSchema: z.ZodType<BuyPartialIn> = z.object({
  nft_details: z.array(z.lazy(() => BuyDetailSchema)),
});

/** `nft.BuyPartialOut` (ответ) */
export interface BuyPartialOut {
  invalid_nfts?: InvalidNftDetail[] | null;
  purchase_results?: PurchaseResult[] | null;
  total_failed?: number | null;
  total_purchased?: number | null;
  total_requested?: number | null;
  total_spent?: string | null;
  updated_nfts?: UpdatedNftDetail[] | null;
  [key: string]: unknown;
}

/** `nft.BuyPartialOut` (ответ) */
export const BuyPartialOutSchema: z.ZodType<BuyPartialOut> = z.looseObject({
  invalid_nfts: z.array(z.lazy(() => InvalidNftDetailSchema)).nullish(),
  purchase_results: z.array(z.lazy(() => PurchaseResultSchema)).nullish(),
  total_failed: z.number().nullish(),
  total_purchased: z.number().nullish(),
  total_requested: z.number().nullish(),
  total_spent: z.string().nullish(),
  updated_nfts: z.array(z.lazy(() => UpdatedNftDetailSchema)).nullish(),
});

/** `httptrustedapps.CancelOfferRequest` (запрос) */
export interface CancelOfferRequest {
  id: string;
}

/** `httptrustedapps.CancelOfferRequest` (запрос) */
export const CancelOfferRequestSchema: z.ZodType<CancelOfferRequest> = z.object({
  id: z.string(),
});

/** `user.CheckExistenceOut` (ответ) */
export interface CheckExistenceOut {
  exists?: boolean | null;
  [key: string]: unknown;
}

/** `user.CheckExistenceOut` (ответ) */
export const CheckExistenceOutSchema: z.ZodType<CheckExistenceOut> = z.looseObject({
  exists: z.boolean().nullish(),
});

/** `model.Collection` (ответ) */
export interface Collection {
  cashback_percent?: string | null;
  created_at?: string | null;
  day_volume?: string | null;
  floor_price?: string | null;
  id?: string | null;
  is_crafted?: boolean | null;
  is_new?: boolean | null;
  is_premarket?: boolean | null;
  market_cap?: string | null;
  name: string;
  photo_url: string;
  points_multiplier?: string | null;
  short_name?: string | null;
  supply?: number | null;
  unlocks_in?: string | null;
  zero_commission?: boolean | null;
  [key: string]: unknown;
}

/** `model.Collection` (ответ) */
export const CollectionSchema: z.ZodType<Collection> = z.looseObject({
  cashback_percent: z.string().nullish(),
  created_at: z.string().nullish(),
  day_volume: z.string().nullish(),
  floor_price: z.string().nullish(),
  id: z.string().nullish(),
  is_crafted: z.boolean().nullish(),
  is_new: z.boolean().nullish(),
  is_premarket: z.boolean().nullish(),
  market_cap: z.string().nullish(),
  name: z.string(),
  photo_url: z.string(),
  points_multiplier: z.string().nullish(),
  short_name: z.string().nullish(),
  supply: z.number().nullish(),
  unlocks_in: z.string().nullish(),
  zero_commission: z.boolean().nullish(),
});

/** `model.CollectionAsset` (ответ) */
export interface CollectionAsset {
  /** legendary, epic, rare, uncommon */
  crafted_rarity?: string | null;
  name: string;
  rarity_per_mille?: number | null;
  url: string;
  [key: string]: unknown;
}

/** `model.CollectionAsset` (ответ) */
export const CollectionAssetSchema: z.ZodType<CollectionAsset> = z.looseObject({
  /** legendary, epic, rare, uncommon */
  crafted_rarity: z.string().nullish(),
  name: z.string(),
  rarity_per_mille: z.number().nullish(),
  url: z.string(),
});

/** `dtocollectionoffers.CollectionInfo` (ответ) */
export interface CollectionInfo {
  floor_price?: string | null;
  is_premarket?: boolean | null;
  name?: string | null;
  photo_url?: string | null;
  short_name?: string | null;
  unlocks_in?: string | null;
  [key: string]: unknown;
}

/** `dtocollectionoffers.CollectionInfo` (ответ) */
export const CollectionInfoSchema: z.ZodType<CollectionInfo> = z.looseObject({
  floor_price: z.string().nullish(),
  is_premarket: z.boolean().nullish(),
  name: z.string().nullish(),
  photo_url: z.string().nullish(),
  short_name: z.string().nullish(),
  unlocks_in: z.string().nullish(),
});

/** `model.CollectionMetrics` (ответ) */
export interface CollectionMetrics {
  avg_price: string;
  collection_id: string;
  floor_price?: string | null;
  interval_time?: string | null;
  total_volume: string;
  [key: string]: unknown;
}

/** `model.CollectionMetrics` (ответ) */
export const CollectionMetricsSchema: z.ZodType<CollectionMetrics> = z.looseObject({
  avg_price: z.string(),
  collection_id: z.string(),
  floor_price: z.string().nullish(),
  interval_time: z.string().nullish(),
  total_volume: z.string(),
});

/** `dtocollectionoffers.CollectionOfferItem` (ответ) */
export interface CollectionOfferItem {
  amount?: string | null;
  collection?: CollectionInfo | null;
  collection_id?: string | null;
  created_at?: string | null;
  current_nfts?: number | null;
  expires_at?: string | null;
  id?: string | null;
  max_nfts?: number | null;
  scope?: CollectionOfferScope | null;
  sender_id?: number | null;
  status?: string | null;
  updated_at?: string | null;
  [key: string]: unknown;
}

/** `dtocollectionoffers.CollectionOfferItem` (ответ) */
export const CollectionOfferItemSchema: z.ZodType<CollectionOfferItem> = z.looseObject({
  amount: z.string().nullish(),
  collection: z.lazy(() => CollectionInfoSchema).nullish(),
  collection_id: z.string().nullish(),
  created_at: z.string().nullish(),
  current_nfts: z.number().nullish(),
  expires_at: z.string().nullish(),
  id: z.string().nullish(),
  max_nfts: z.number().nullish(),
  scope: z.lazy(() => CollectionOfferScopeSchema).nullish(),
  sender_id: z.number().nullish(),
  status: z.string().nullish(),
  updated_at: z.string().nullish(),
});

/** `model.CollectionOfferScope` (ответ) */
export interface CollectionOfferScope {
  backdrops?: string[] | null;
  models?: string[] | null;
  symbols?: string[] | null;
  [key: string]: unknown;
}

/** `model.CollectionOfferScope` (ответ) */
export const CollectionOfferScopeSchema: z.ZodType<CollectionOfferScope> = z.looseObject({
  backdrops: z.array(z.string()).nullish(),
  models: z.array(z.string()).nullish(),
  symbols: z.array(z.string()).nullish(),
});

/** `model.CollectionWithPreview` (ответ) */
export interface CollectionWithPreview {
  cashback_percent?: string | null;
  day_volume?: string | null;
  floor_price?: string | null;
  id?: string | null;
  is_new?: boolean | null;
  is_premarket?: boolean | null;
  name: string;
  photo_url?: string | null;
  points_multiplier?: string | null;
  preview?: CollectionAsset | null;
  short_name?: string | null;
  supply?: string | null;
  zero_commission?: boolean | null;
  [key: string]: unknown;
}

/** `model.CollectionWithPreview` (ответ) */
export const CollectionWithPreviewSchema: z.ZodType<CollectionWithPreview> = z.looseObject({
  cashback_percent: z.string().nullish(),
  day_volume: z.string().nullish(),
  floor_price: z.string().nullish(),
  id: z.string().nullish(),
  is_new: z.boolean().nullish(),
  is_premarket: z.boolean().nullish(),
  name: z.string(),
  photo_url: z.string().nullish(),
  points_multiplier: z.string().nullish(),
  preview: z.lazy(() => CollectionAssetSchema).nullish(),
  short_name: z.string().nullish(),
  supply: z.string().nullish(),
  zero_commission: z.boolean().nullish(),
});

/** `httpcollectionoffer.CreateOfferAttribute` (запрос) */
export interface CreateOfferAttribute {
  type?: NftAttributeType | null;
  value?: string | null;
}

/** `httpcollectionoffer.CreateOfferAttribute` (запрос) */
export const CreateOfferAttributeSchema: z.ZodType<CreateOfferAttribute> = z.object({
  type: NftAttributeTypeSchema.nullish(),
  value: z.string().nullish(),
});

/** `httptrustedapps.CreateOfferRequest` (запрос) */
export interface CreateOfferRequest {
  amount: string;
  attributes?: CreateOfferAttribute[] | null;
  collection_id: string;
  expiration_days?: number | null;
  max_nfts: number;
}

/** `httptrustedapps.CreateOfferRequest` (запрос) */
export const CreateOfferRequestSchema: z.ZodType<CreateOfferRequest> = z.object({
  amount: z.string(),
  attributes: z.array(z.lazy(() => CreateOfferAttributeSchema)).nullish(),
  collection_id: z.string(),
  expiration_days: z.number().int().nullish(),
  max_nfts: z.number().int().min(1).max(50),
});

/** `httpcollectionoffer.CreateOfferResponse` (ответ) */
export interface CreateOfferResponse {
  amount?: string | null;
  collection_id?: string | null;
  created_at?: string | null;
  current_nfts?: number | null;
  expires_at?: string | null;
  id?: string | null;
  max_nfts?: number | null;
  scope?: CollectionOfferScope | null;
  sender_id?: number | null;
  status?: string | null;
  updated_at?: string | null;
  [key: string]: unknown;
}

/** `httpcollectionoffer.CreateOfferResponse` (ответ) */
export const CreateOfferResponseSchema: z.ZodType<CreateOfferResponse> = z.looseObject({
  amount: z.string().nullish(),
  collection_id: z.string().nullish(),
  created_at: z.string().nullish(),
  current_nfts: z.number().nullish(),
  expires_at: z.string().nullish(),
  id: z.string().nullish(),
  max_nfts: z.number().nullish(),
  scope: z.lazy(() => CollectionOfferScopeSchema).nullish(),
  sender_id: z.number().nullish(),
  status: z.string().nullish(),
  updated_at: z.string().nullish(),
});

/** `model.DetailedUserAction` (ответ) */
export interface DetailedUserAction {
  amount?: string | null;
  bundle?: BundleExtended | null;
  collection?: UserActionCollectionOffer | null;
  collection_id: string;
  created_at?: string | null;
  initiator_user_id?: number | null;
  max_nfts?: number | null;
  metadata?: Record<string, unknown> | null;
  nft?: UserActionNft | null;
  nft_id?: string | null;
  offer?: UserActionOffer | null;
  offer_id?: string | null;
  old_price?: string | null;
  referrer_revenue?: string | null;
  related_entity_id?: string | null;
  related_entity_type?: string | null;
  target_user_id?: number | null;
  type: UserActionType | (string & {});
  [key: string]: unknown;
}

/** `model.DetailedUserAction` (ответ) */
export const DetailedUserActionSchema: z.ZodType<DetailedUserAction> = z.looseObject({
  amount: z.string().nullish(),
  bundle: z.lazy(() => BundleExtendedSchema).nullish(),
  collection: z.lazy(() => UserActionCollectionOfferSchema).nullish(),
  collection_id: z.string(),
  created_at: z.string().nullish(),
  initiator_user_id: z.number().nullish(),
  max_nfts: z.number().nullish(),
  metadata: z.record(z.string(), z.unknown()).nullish(),
  nft: z.lazy(() => UserActionNftSchema).nullish(),
  nft_id: z.string().nullish(),
  offer: z.lazy(() => UserActionOfferSchema).nullish(),
  offer_id: z.string().nullish(),
  old_price: z.string().nullish(),
  referrer_revenue: z.string().nullish(),
  related_entity_id: z.string().nullish(),
  related_entity_type: z.string().nullish(),
  target_user_id: z.number().nullish(),
  type: openEnum<UserActionType>(),
});

/** `dtonft.FailedNft` (ответ) */
export interface FailedNft {
  nft_id?: string | null;
  reason?: string | null;
  [key: string]: unknown;
}

/** `dtonft.FailedNft` (ответ) */
export const FailedNftSchema: z.ZodType<FailedNft> = z.looseObject({
  nft_id: z.string().nullish(),
  reason: z.string().nullish(),
});

/** `collection.FetchAllCollectionsWithPreviewOut` (ответ) */
export interface FetchAllCollectionsWithPreviewOut {
  collections?: CollectionWithPreview[] | null;
  [key: string]: unknown;
}

/** `collection.FetchAllCollectionsWithPreviewOut` (ответ) */
export const FetchAllCollectionsWithPreviewOutSchema: z.ZodType<FetchAllCollectionsWithPreviewOut> = z.looseObject({
  collections: z.array(z.lazy(() => CollectionWithPreviewSchema)).nullish(),
});

/** `collection.FetchAllUniqueAttributeFloorsOut` (ответ) */
export interface FetchAllUniqueAttributeFloorsOut {
  attribute_floors?: FetchCollectionAttrFloorPricesOut | null;
  /**
   * Deprecated parameter do not use it instead of this use attribute_floors field
   * @deprecated
   */
  models: AttributeFloorInfo[];
  updated_at: string;
  [key: string]: unknown;
}

/** `collection.FetchAllUniqueAttributeFloorsOut` (ответ) */
export const FetchAllUniqueAttributeFloorsOutSchema: z.ZodType<FetchAllUniqueAttributeFloorsOut> = z.looseObject({
  attribute_floors: z.lazy(() => FetchCollectionAttrFloorPricesOutSchema).nullish(),
  /**
   * Deprecated parameter do not use it instead of this use attribute_floors field
   * @deprecated
   */
  models: z.array(z.lazy(() => AttributeFloorInfoSchema)),
  updated_at: z.string(),
});

/** `usersactions.FetchAllUserActionsOut` (ответ) */
export interface FetchAllUserActionsOut {
  actions: AnonymizedUserAction[];
  [key: string]: unknown;
}

/** `usersactions.FetchAllUserActionsOut` (ответ) */
export const FetchAllUserActionsOutSchema: z.ZodType<FetchAllUserActionsOut> = z.looseObject({
  actions: z.array(z.lazy(() => AnonymizedUserActionSchema)),
});

/** `collection.FetchBackgroundFloorPricesOut` (ответ) */
export interface FetchBackgroundFloorPricesOut {
  floorPrices: AttributeFloorPrices;
  [key: string]: unknown;
}

/** `collection.FetchBackgroundFloorPricesOut` (ответ) */
export const FetchBackgroundFloorPricesOutSchema: z.ZodType<FetchBackgroundFloorPricesOut> = z.looseObject({
  floorPrices: z.lazy(() => AttributeFloorPricesSchema),
});

/** `dtocollectionfiltersrepo.FetchCollectionAttrFloorPricesOut` (ответ) */
export type FetchCollectionAttrFloorPricesOut = Record<string, {
  backdrops: AttributeFloorPrices;
  models: AttributeFloorPrices;
  symbols: AttributeFloorPrices;
  [key: string]: unknown;
}>;

/** `dtocollectionfiltersrepo.FetchCollectionAttrFloorPricesOut` (ответ) */
export const FetchCollectionAttrFloorPricesOutSchema: z.ZodType<FetchCollectionAttrFloorPricesOut> = z.record(z.string(), z.looseObject({
  backdrops: z.lazy(() => AttributeFloorPricesSchema),
  models: z.lazy(() => AttributeFloorPricesSchema),
  symbols: z.lazy(() => AttributeFloorPricesSchema),
}));

/** `collection.FetchCollectionMetricsOut` (ответ) */
export interface FetchCollectionMetricsOut {
  history?: CollectionMetrics[] | null;
  [key: string]: unknown;
}

/** `collection.FetchCollectionMetricsOut` (ответ) */
export const FetchCollectionMetricsOutSchema: z.ZodType<FetchCollectionMetricsOut> = z.looseObject({
  history: z.array(z.lazy(() => CollectionMetricsSchema)).nullish(),
});

/** `collectionoffer.FetchCollectionsOut` (ответ) */
export interface FetchCollectionsOut {
  collections?: Collection[] | null;
  total_count?: number | null;
  [key: string]: unknown;
}

/** `collectionoffer.FetchCollectionsOut` (ответ) */
export const FetchCollectionsOutSchema: z.ZodType<FetchCollectionsOut> = z.looseObject({
  collections: z.array(z.lazy(() => CollectionSchema)).nullish(),
  total_count: z.number().nullish(),
});

/** `collection.FetchModelsBackgroundsFloorPricesOut` (ответ) */
export interface FetchModelsBackgroundsFloorPricesOut {
  model_backgrounds: Record<string, AttributeFloorPrices>;
  [key: string]: unknown;
}

/** `collection.FetchModelsBackgroundsFloorPricesOut` (ответ) */
export const FetchModelsBackgroundsFloorPricesOutSchema: z.ZodType<FetchModelsBackgroundsFloorPricesOut> = z.looseObject({
  model_backgrounds: z.record(z.string(), z.lazy(() => AttributeFloorPricesSchema)),
});

/** `httptrustedapps.fetchOwnedOut` (ответ) */
export interface FetchOwnedOut {
  attribute_floors?: AttributeFloorsMap | null;
  nfts: HttpmodelNft[];
  total_count?: number | null;
  [key: string]: unknown;
}

/** `httptrustedapps.fetchOwnedOut` (ответ) */
export const FetchOwnedOutSchema: z.ZodType<FetchOwnedOut> = z.looseObject({
  attribute_floors: z.lazy(() => AttributeFloorsMapSchema).nullish(),
  nfts: z.array(z.lazy(() => HttpmodelNftSchema)),
  total_count: z.number().nullish(),
});

/** `dwithdrawalsrepo.FetchStatusByIdOut` (ответ) */
export interface FetchStatusByIdOut {
  id: string;
  status: TonWithdrawalStatus | (string & {});
  [key: string]: unknown;
}

/** `dwithdrawalsrepo.FetchStatusByIdOut` (ответ) */
export const FetchStatusByIdOutSchema: z.ZodType<FetchStatusByIdOut> = z.looseObject({
  id: z.string(),
  status: openEnum<TonWithdrawalStatus>(),
});

/** `dtocollectionoffers.FetchTopOut` (ответ) */
export interface FetchTopOut {
  offers?: CollectionOfferItem[] | null;
  total_count?: number | null;
  [key: string]: unknown;
}

/** `dtocollectionoffers.FetchTopOut` (ответ) */
export const FetchTopOutSchema: z.ZodType<FetchTopOut> = z.looseObject({
  offers: z.array(z.lazy(() => CollectionOfferItemSchema)).nullish(),
  total_count: z.number().nullish(),
});

/** `usersactions.FetchUserActionsOut` (ответ) */
export interface FetchUserActionsOut {
  actions: DetailedUserAction[];
  total_actions?: number | null;
  [key: string]: unknown;
}

/** `usersactions.FetchUserActionsOut` (ответ) */
export const FetchUserActionsOutSchema: z.ZodType<FetchUserActionsOut> = z.looseObject({
  actions: z.array(z.lazy(() => DetailedUserActionSchema)),
  total_actions: z.number().nullish(),
});

/** `nft.FetchUserStatsOut` (ответ) */
export interface FetchUserStatsOut {
  listed_count: number;
  unlisted_count: number;
  [key: string]: unknown;
}

/** `nft.FetchUserStatsOut` (ответ) */
export const FetchUserStatsOutSchema: z.ZodType<FetchUserStatsOut> = z.looseObject({
  listed_count: z.number(),
  unlisted_count: z.number(),
});

/** `httptrustedapps.generalOut` (ответ) */
export interface GeneralOut {
  commission: string;
  /** Кулдаун в наносекундах (Go time.Duration). */
  cooldown: number;
  deposit_wallet: string;
  rub_course: string;
  usd_course: string;
  user_cashback: string;
  [key: string]: unknown;
}

/** `httptrustedapps.generalOut` (ответ) */
export const GeneralOutSchema: z.ZodType<GeneralOut> = z.looseObject({
  commission: z.string(),
  /** Кулдаун в наносекундах (Go time.Duration). */
  cooldown: z.number(),
  deposit_wallet: z.string(),
  rub_course: z.string(),
  usd_course: z.string(),
  user_cashback: z.string(),
});

/** `userwallet.GenerateDepositIdOut` (ответ) */
export interface GenerateDepositIdOut {
  id?: string | null;
  [key: string]: unknown;
}

/** `userwallet.GenerateDepositIdOut` (ответ) */
export const GenerateDepositIdOutSchema: z.ZodType<GenerateDepositIdOut> = z.looseObject({
  id: z.string().nullish(),
});

/** `exerr.HttpError` (ответ) */
export interface HttpError {
  code?: string | null;
  message?: string | null;
  [key: string]: unknown;
}

/** `exerr.HttpError` (ответ) */
export const HttpErrorSchema: z.ZodType<HttpError> = z.looseObject({
  code: z.string().nullish(),
  message: z.string().nullish(),
});

/** `httpmodel.Nft` (ответ) */
export interface HttpmodelNft {
  animation_url?: string | null;
  attributes: NftAttribute[];
  bundle_id?: number | null;
  collection_id: string;
  deposit_bonus?: NftDepositBonus | null;
  emoji_id?: string | null;
  external_collection_number: number;
  fiat_eligible?: boolean | null;
  fiat_price_rub?: string | null;
  fiat_purchase_in_progress?: boolean | null;
  fiat_purchase_lock_expires_at?: string | null;
  floor_price?: string | null;
  has_animation?: boolean | null;
  id: string;
  import_source?: NftImportSource | (string & {}) | null;
  imported_at?: string | null;
  is_crafted?: boolean | null;
  is_owned: boolean;
  listed_at?: string | null;
  lucky_buy_eligible?: boolean | null;
  lucky_craft_eligible?: boolean | null;
  name: string;
  photo_url: string;
  premarket_data?: PremarketOrder | null;
  price?: string | null;
  status: NftStatus | (string & {});
  tg_id?: string | null;
  ton_address?: string | null;
  unlocks_at?: string | null;
  [key: string]: unknown;
}

/** `httpmodel.Nft` (ответ) */
export const HttpmodelNftSchema: z.ZodType<HttpmodelNft> = z.looseObject({
  animation_url: z.string().nullish(),
  attributes: z.array(z.lazy(() => NftAttributeSchema)),
  bundle_id: z.number().nullish(),
  collection_id: z.string(),
  deposit_bonus: z.lazy(() => NftDepositBonusSchema).nullish(),
  emoji_id: z.string().nullish(),
  external_collection_number: z.number(),
  fiat_eligible: z.boolean().nullish(),
  fiat_price_rub: z.string().nullish(),
  fiat_purchase_in_progress: z.boolean().nullish(),
  fiat_purchase_lock_expires_at: z.string().nullish(),
  floor_price: z.string().nullish(),
  has_animation: z.boolean().nullish(),
  id: z.string(),
  import_source: openEnum<NftImportSource>().nullish(),
  imported_at: z.string().nullish(),
  is_crafted: z.boolean().nullish(),
  is_owned: z.boolean(),
  listed_at: z.string().nullish(),
  lucky_buy_eligible: z.boolean().nullish(),
  lucky_craft_eligible: z.boolean().nullish(),
  name: z.string(),
  photo_url: z.string(),
  premarket_data: z.lazy(() => PremarketOrderSchema).nullish(),
  price: z.string().nullish(),
  status: openEnum<NftStatus>(),
  tg_id: z.string().nullish(),
  ton_address: z.string().nullish(),
  unlocks_at: z.string().nullish(),
});

/** `userwallet.InfoOut` (ответ) */
export interface InfoOut {
  balance: string;
  frozen_funds: string;
  premarket_funds: string;
  [key: string]: unknown;
}

/** `userwallet.InfoOut` (ответ) */
export const InfoOutSchema: z.ZodType<InfoOut> = z.looseObject({
  balance: z.string(),
  frozen_funds: z.string(),
  premarket_funds: z.string(),
});

/** `nft.InvalidNftDetail` (ответ) */
export interface InvalidNftDetail {
  id?: string | null;
  nft?: ModelNft | null;
  reason?: InvalidNftReason | (string & {}) | null;
  [key: string]: unknown;
}

/** `nft.InvalidNftDetail` (ответ) */
export const InvalidNftDetailSchema: z.ZodType<InvalidNftDetail> = z.looseObject({
  id: z.string().nullish(),
  nft: z.lazy(() => ModelNftSchema).nullish(),
  reason: openEnum<InvalidNftReason>().nullish(),
});

/** `nft.ListForSaleIn` (запрос) */
export interface ListForSaleIn {
  price: string;
}

/** `nft.ListForSaleIn` (запрос) */
export const ListForSaleInSchema: z.ZodType<ListForSaleIn> = z.object({
  price: z.string(),
});

/** `model.Nft` (ответ) */
export interface ModelNft {
  animation_url?: string | null;
  attributes: NftAttribute[];
  bundle_id?: number | null;
  collection_id: string;
  deposit_bonus?: NftDepositBonus | null;
  emoji_id?: string | null;
  external_collection_number: number;
  fiat_eligible?: boolean | null;
  fiat_price_rub?: string | null;
  fiat_purchase_in_progress?: boolean | null;
  fiat_purchase_lock_expires_at?: string | null;
  floor_price?: string | null;
  has_animation?: boolean | null;
  id: string;
  import_source?: NftImportSource | (string & {}) | null;
  imported_at?: string | null;
  is_crafted?: boolean | null;
  listed_at?: string | null;
  lucky_buy_eligible?: boolean | null;
  lucky_craft_eligible?: boolean | null;
  name: string;
  photo_url: string;
  premarket_data?: PremarketOrder | null;
  price?: string | null;
  status: NftStatus | (string & {});
  tg_id?: string | null;
  ton_address?: string | null;
  unlocks_at?: string | null;
  [key: string]: unknown;
}

/** `model.Nft` (ответ) */
export const ModelNftSchema: z.ZodType<ModelNft> = z.looseObject({
  animation_url: z.string().nullish(),
  attributes: z.array(z.lazy(() => NftAttributeSchema)),
  bundle_id: z.number().nullish(),
  collection_id: z.string(),
  deposit_bonus: z.lazy(() => NftDepositBonusSchema).nullish(),
  emoji_id: z.string().nullish(),
  external_collection_number: z.number(),
  fiat_eligible: z.boolean().nullish(),
  fiat_price_rub: z.string().nullish(),
  fiat_purchase_in_progress: z.boolean().nullish(),
  fiat_purchase_lock_expires_at: z.string().nullish(),
  floor_price: z.string().nullish(),
  has_animation: z.boolean().nullish(),
  id: z.string(),
  import_source: openEnum<NftImportSource>().nullish(),
  imported_at: z.string().nullish(),
  is_crafted: z.boolean().nullish(),
  listed_at: z.string().nullish(),
  lucky_buy_eligible: z.boolean().nullish(),
  lucky_craft_eligible: z.boolean().nullish(),
  name: z.string(),
  photo_url: z.string(),
  premarket_data: z.lazy(() => PremarketOrderSchema).nullish(),
  price: z.string().nullish(),
  status: openEnum<NftStatus>(),
  tg_id: z.string().nullish(),
  ton_address: z.string().nullish(),
  unlocks_at: z.string().nullish(),
});

/** `model.NftAttribute` (ответ) */
export interface NftAttribute {
  floor?: string | null;
  rarity_per_mille: number;
  type: NftAttributeType | (string & {});
  value: string;
  [key: string]: unknown;
}

/** `model.NftAttribute` (ответ) */
export const NftAttributeSchema: z.ZodType<NftAttribute> = z.looseObject({
  floor: z.string().nullish(),
  rarity_per_mille: z.number(),
  type: openEnum<NftAttributeType>(),
  value: z.string(),
});

/** `model.NftDepositBonus` (ответ) */
export interface NftDepositBonus {
  amount?: string | null;
  eligible_at?: string | null;
  status?: DepositBonusClaimStatus | (string & {}) | null;
  [key: string]: unknown;
}

/** `model.NftDepositBonus` (ответ) */
export const NftDepositBonusSchema: z.ZodType<NftDepositBonus> = z.looseObject({
  amount: z.string().nullish(),
  eligible_at: z.string().nullish(),
  status: openEnum<DepositBonusClaimStatus>().nullish(),
});

/** `nft.NftPriceDetail` (запрос) */
export interface NftPriceDetail {
  nft_id: string;
  price: string;
}

/** `nft.NftPriceDetail` (запрос) */
export const NftPriceDetailSchema: z.ZodType<NftPriceDetail> = z.object({
  nft_id: z.string(),
  price: z.string(),
});

/** `model.PremarketOrder` (ответ) */
export interface PremarketOrder {
  buyer?: User | null;
  buyer_id?: number | null;
  created_at?: string | null;
  deposit_amount?: string | null;
  deposit_percent?: number | null;
  id?: string | null;
  listed_at?: string | null;
  nft?: ModelNft | null;
  nft_id?: string | null;
  price?: string | null;
  seller?: User | null;
  seller_id?: number | null;
  sold_at?: string | null;
  status?: PremarketOrderStatus | (string & {}) | null;
  transfer_deadline?: string | null;
  unlock_date?: string | null;
  updated_at?: string | null;
  warning_until?: string | null;
  [key: string]: unknown;
}

/** `model.PremarketOrder` (ответ) */
export const PremarketOrderSchema: z.ZodType<PremarketOrder> = z.looseObject({
  buyer: z.lazy(() => UserSchema).nullish(),
  buyer_id: z.number().nullish(),
  created_at: z.string().nullish(),
  deposit_amount: z.string().nullish(),
  deposit_percent: z.number().nullish(),
  id: z.string().nullish(),
  listed_at: z.string().nullish(),
  nft: z.lazy(() => ModelNftSchema).nullish(),
  nft_id: z.string().nullish(),
  price: z.string().nullish(),
  seller: z.lazy(() => UserSchema).nullish(),
  seller_id: z.number().nullish(),
  sold_at: z.string().nullish(),
  status: openEnum<PremarketOrderStatus>().nullish(),
  transfer_deadline: z.string().nullish(),
  unlock_date: z.string().nullish(),
  updated_at: z.string().nullish(),
  warning_until: z.string().nullish(),
});

/** `nft.PurchaseResult` (ответ) */
export interface PurchaseResult {
  error_message?: string | null;
  id?: string | null;
  nft?: ModelNft | null;
  price?: string | null;
  reason?: string | null;
  status?: string | null;
  [key: string]: unknown;
}

/** `nft.PurchaseResult` (ответ) */
export const PurchaseResultSchema: z.ZodType<PurchaseResult> = z.looseObject({
  error_message: z.string().nullish(),
  id: z.string().nullish(),
  nft: z.lazy(() => ModelNftSchema).nullish(),
  price: z.string().nullish(),
  reason: z.string().nullish(),
  status: z.string().nullish(),
});

/** `httptrustedapps.searchNftsOut` (ответ) */
export interface SearchNftsOut {
  results?: HttpmodelNft[] | null;
  total_count?: number | null;
  [key: string]: unknown;
}

/** `httptrustedapps.searchNftsOut` (ответ) */
export const SearchNftsOutSchema: z.ZodType<SearchNftsOut> = z.looseObject({
  results: z.array(z.lazy(() => HttpmodelNftSchema)).nullish(),
  total_count: z.number().nullish(),
});

/** `nft.TransferFailedItem` (ответ) */
export interface TransferFailedItem {
  nft_id?: string | null;
  reason?: string | null;
  [key: string]: unknown;
}

/** `nft.TransferFailedItem` (ответ) */
export const TransferFailedItemSchema: z.ZodType<TransferFailedItem> = z.looseObject({
  nft_id: z.string().nullish(),
  reason: z.string().nullish(),
});

/** `nft.TransferGiftsIn` (запрос) */
export interface TransferGiftsIn {
  anonymous?: boolean | null;
  nft_ids: string[];
  recipient?: string | null;
  recipient_token?: string | null;
}

/** `nft.TransferGiftsIn` (запрос) */
export const TransferGiftsInSchema: z.ZodType<TransferGiftsIn> = z.object({
  anonymous: z.boolean().nullish(),
  nft_ids: z.array(z.string()).min(1),
  recipient: z.string().nullish(),
  recipient_token: z.string().nullish(),
}).refine(exactlyOneOf(["recipient","recipient_token"]), {
  message: "Exactly one of recipient, recipient_token must be set",
  path: ["recipient"],
});

/** `nft.TransferGiftsOut` (ответ) */
export interface TransferGiftsOut {
  failed_items?: TransferFailedItem[] | null;
  recipient?: TransferRecipientInfo | null;
  transferred_count?: number | null;
  [key: string]: unknown;
}

/** `nft.TransferGiftsOut` (ответ) */
export const TransferGiftsOutSchema: z.ZodType<TransferGiftsOut> = z.looseObject({
  failed_items: z.array(z.lazy(() => TransferFailedItemSchema)).nullish(),
  recipient: z.lazy(() => TransferRecipientInfoSchema).nullish(),
  transferred_count: z.number().nullish(),
});

/** `nft.TransferRecipientInfo` (ответ) */
export interface TransferRecipientInfo {
  user_id?: number | null;
  username?: string | null;
  [key: string]: unknown;
}

/** `nft.TransferRecipientInfo` (ответ) */
export const TransferRecipientInfoSchema: z.ZodType<TransferRecipientInfo> = z.looseObject({
  user_id: z.number().nullish(),
  username: z.string().nullish(),
});

/** `collectionoffer.UpdateBatchFailedItem` (ответ) */
export interface UpdateBatchFailedItem {
  id?: string | null;
  reason?: string | null;
  [key: string]: unknown;
}

/** `collectionoffer.UpdateBatchFailedItem` (ответ) */
export const UpdateBatchFailedItemSchema: z.ZodType<UpdateBatchFailedItem> = z.looseObject({
  id: z.string().nullish(),
  reason: z.string().nullish(),
});

/** `collectionoffer.UpdateBatchOut` (ответ) */
export interface UpdateBatchOut {
  failed?: UpdateBatchFailedItem[] | null;
  updated?: string[] | null;
  [key: string]: unknown;
}

/** `collectionoffer.UpdateBatchOut` (ответ) */
export const UpdateBatchOutSchema: z.ZodType<UpdateBatchOut> = z.looseObject({
  failed: z.array(z.lazy(() => UpdateBatchFailedItemSchema)).nullish(),
  updated: z.array(z.string()).nullish(),
});

/** `nft.UpdatedNftDetail` (ответ) */
export interface UpdatedNftDetail {
  current_price?: string | null;
  id?: string | null;
  nft?: ModelNft | null;
  old_price?: string | null;
  status?: NftStatus | (string & {}) | null;
  [key: string]: unknown;
}

/** `nft.UpdatedNftDetail` (ответ) */
export const UpdatedNftDetailSchema: z.ZodType<UpdatedNftDetail> = z.looseObject({
  current_price: z.string().nullish(),
  id: z.string().nullish(),
  nft: z.lazy(() => ModelNftSchema).nullish(),
  old_price: z.string().nullish(),
  status: openEnum<NftStatus>().nullish(),
});

/** `model.User` (ответ) */
export interface User {
  first_name?: string | null;
  is_banned?: boolean | null;
  is_influencer: boolean;
  is_premium?: boolean | null;
  last_name?: string | null;
  name?: string | null;
  photo_url?: string | null;
  referral_level: number;
  referrer_id?: number | null;
  username?: string | null;
  [key: string]: unknown;
}

/** `model.User` (ответ) */
export const UserSchema: z.ZodType<User> = z.looseObject({
  first_name: z.string().nullish(),
  is_banned: z.boolean().nullish(),
  is_influencer: z.boolean(),
  is_premium: z.boolean().nullish(),
  last_name: z.string().nullish(),
  name: z.string().nullish(),
  photo_url: z.string().nullish(),
  referral_level: z.number(),
  referrer_id: z.number().nullish(),
  username: z.string().nullish(),
});

/** `model.UserActionCollectionOffer` (ответ) */
export interface UserActionCollectionOffer {
  floor_price?: string | null;
  id: string;
  name: string;
  photo_url: string;
  short_name: string;
  [key: string]: unknown;
}

/** `model.UserActionCollectionOffer` (ответ) */
export const UserActionCollectionOfferSchema: z.ZodType<UserActionCollectionOffer> = z.looseObject({
  floor_price: z.string().nullish(),
  id: z.string(),
  name: z.string(),
  photo_url: z.string(),
  short_name: z.string(),
});

/** `model.UserActionNft` (ответ) */
export interface UserActionNft {
  animation_url?: string | null;
  attributes?: NftAttribute[] | null;
  collection_id: string;
  emoji_id?: string | null;
  external_collection_number: number;
  floor_price?: string | null;
  has_animation?: boolean | null;
  id: string;
  is_crafted?: boolean | null;
  is_owned: boolean;
  name: string;
  photo_url: string;
  price?: string | null;
  status?: string | null;
  ton_address?: string | null;
  unlocks_at?: string | null;
  [key: string]: unknown;
}

/** `model.UserActionNft` (ответ) */
export const UserActionNftSchema: z.ZodType<UserActionNft> = z.looseObject({
  animation_url: z.string().nullish(),
  attributes: z.array(z.lazy(() => NftAttributeSchema)).nullish(),
  collection_id: z.string(),
  emoji_id: z.string().nullish(),
  external_collection_number: z.number(),
  floor_price: z.string().nullish(),
  has_animation: z.boolean().nullish(),
  id: z.string(),
  is_crafted: z.boolean().nullish(),
  is_owned: z.boolean(),
  name: z.string(),
  photo_url: z.string(),
  price: z.string().nullish(),
  status: z.string().nullish(),
  ton_address: z.string().nullish(),
  unlocks_at: z.string().nullish(),
});

/** `model.UserActionOffer` (ответ) */
export interface UserActionOffer {
  price: string;
  recipient_id?: number | null;
  sender_id?: number | null;
  status: string;
  [key: string]: unknown;
}

/** `model.UserActionOffer` (ответ) */
export const UserActionOfferSchema: z.ZodType<UserActionOffer> = z.looseObject({
  price: z.string(),
  recipient_id: z.number().nullish(),
  sender_id: z.number().nullish(),
  status: z.string(),
});

/** `nft.WithdrawalStatus` (ответ) */
export interface WithdrawalStatus {
  details?: WithdrawalStatusDetails | (string & {}) | null;
  id: number;
  nft_id?: string | null;
  status: WithdrawalStatusValue | (string & {});
  [key: string]: unknown;
}

/** `nft.WithdrawalStatus` (ответ) */
export const WithdrawalStatusSchema: z.ZodType<WithdrawalStatus> = z.looseObject({
  details: openEnum<WithdrawalStatusDetails>().nullish(),
  id: z.number(),
  nft_id: z.string().nullish(),
  status: openEnum<WithdrawalStatusValue>(),
});

/** `nft.WithdrawalStatusesOut` (ответ) */
export interface WithdrawalStatusesOut {
  statuses: WithdrawalStatus[];
  [key: string]: unknown;
}

/** `nft.WithdrawalStatusesOut` (ответ) */
export const WithdrawalStatusesOutSchema: z.ZodType<WithdrawalStatusesOut> = z.looseObject({
  statuses: z.array(z.lazy(() => WithdrawalStatusSchema)),
});

/** `nft.WithdrawGiftsIn` (запрос) */
export interface WithdrawGiftsIn {
  gift_ids?: string[] | null;
  recipient_id?: number | null;
  unsafe_transfer?: boolean | null;
}

/** `nft.WithdrawGiftsIn` (запрос) */
export const WithdrawGiftsInSchema: z.ZodType<WithdrawGiftsIn> = z.object({
  gift_ids: z.array(z.string()).min(1).nullish(),
  recipient_id: z.number().int().nullish(),
  unsafe_transfer: z.boolean().nullish(),
});

/** `nft.WithdrawGiftsOut` (ответ) */
export interface WithdrawGiftsOut {
  withdrawals_ids: number[];
  [key: string]: unknown;
}

/** `nft.WithdrawGiftsOut` (ответ) */
export const WithdrawGiftsOutSchema: z.ZodType<WithdrawGiftsOut> = z.looseObject({
  withdrawals_ids: z.array(z.number()),
});

/** `userwallet.WithdrawIn` (запрос) */
export interface WithdrawIn {
  amount: string;
  external_address: string;
}

/** `userwallet.WithdrawIn` (запрос) */
export const WithdrawInSchema: z.ZodType<WithdrawIn> = z.object({
  amount: z.string(),
  external_address: z.string(),
});

/** `userwallet.WithdrawOut` (ответ) */
export interface WithdrawOut {
  id: string;
  [key: string]: unknown;
}

/** `userwallet.WithdrawOut` (ответ) */
export const WithdrawOutSchema: z.ZodType<WithdrawOut> = z.looseObject({
  id: z.string(),
});

/** `userwallet.WithdrawStatusOut` (ответ) */
export interface WithdrawStatusOut {
  status: FetchStatusByIdOut[];
  [key: string]: unknown;
}

/** `userwallet.WithdrawStatusOut` (ответ) */
export const WithdrawStatusOutSchema: z.ZodType<WithdrawStatusOut> = z.looseObject({
  status: z.array(z.lazy(() => FetchStatusByIdOutSchema)),
});

// ── Operations ──

/** Query-параметры `GET /partners/arena/inventory` */
export interface GetArenaInventoryQuery {
  /** 1-150, default 150 */
  limit?: number | null;
  /** Offset */
  offset?: number | null;
  /** Search by name */
  search?: string | null;
  /** Filter by status */
  status?: string | null;
  /** Filter by multiple statuses, comma separated */
  statuses?: string | null;
  /** Collection short names, comma separated */
  collection?: string | null;
  /** price asc | price desc | listed_at desc */
  sort_by?: string | null;
}

/** Query-параметры `GET /partners/arena/inventory` */
export const GetArenaInventoryQuerySchema: z.ZodType<GetArenaInventoryQuery> = z.object({
  /** 1-150, default 150 */
  limit: z.number().int().nullish(),
  /** Offset */
  offset: z.number().int().nullish(),
  /** Search by name */
  search: z.string().nullish(),
  /** Filter by status */
  status: z.string().nullish(),
  /** Filter by multiple statuses, comma separated */
  statuses: z.string().nullish(),
  /** Collection short names, comma separated */
  collection: z.string().nullish(),
  /** price asc | price desc | listed_at desc */
  sort_by: z.string().nullish(),
});

/** Query-параметры `GET /partners/collection-offers/{collection_id}/all` */
export interface GetCollectionOffersAllQuery {
  /** Limit (default 10, max 10) */
  limit?: number | null;
  /** Offer scope filter */
  scope?: CollectionOfferScopeType | null;
}

/** Query-параметры `GET /partners/collection-offers/{collection_id}/all` */
export const GetCollectionOffersAllQuerySchema: z.ZodType<GetCollectionOffersAllQuery> = z.object({
  /** Limit (default 10, max 10) */
  limit: z.number().int().nullish(),
  /** Offer scope filter */
  scope: CollectionOfferScopeTypeSchema.nullish(),
});

/** Query-параметры `GET /partners/collection-offers/{collection_id}/top` */
export interface GetCollectionOffersTopQuery {
  /** Offer scope filter */
  scope?: CollectionOfferScopeType | null;
}

/** Query-параметры `GET /partners/collection-offers/{collection_id}/top` */
export const GetCollectionOffersTopQuerySchema: z.ZodType<GetCollectionOffersTopQuery> = z.object({
  /** Offer scope filter */
  scope: CollectionOfferScopeTypeSchema.nullish(),
});

/** Query-параметры `GET /partners/collections/models/backgrounds/floors` */
export interface GetCollectionsModelsBackgroundsFloorsQuery {
  /** comma-separated list of model names */
  models: string;
}

/** Query-параметры `GET /partners/collections/models/backgrounds/floors` */
export const GetCollectionsModelsBackgroundsFloorsQuerySchema: z.ZodType<GetCollectionsModelsBackgroundsFloorsQuery> = z.object({
  /** comma-separated list of model names */
  models: z.string(),
});

/** Query-параметры `GET /partners/collections/preview` */
export interface GetCollectionsPreviewQuery {
  /** sort field (name, floor_price) */
  sort_by?: CollectionSortBy | null;
  /** sort order (asc|desc) */
  sort_order?: SortOrder | null;
}

/** Query-параметры `GET /partners/collections/preview` */
export const GetCollectionsPreviewQuerySchema: z.ZodType<GetCollectionsPreviewQuery> = z.object({
  /** sort field (name, floor_price) */
  sort_by: CollectionSortBySchema.nullish(),
  /** sort order (asc|desc) */
  sort_order: SortOrderSchema.nullish(),
});

/** Query-параметры `GET /partners/collections/{collection_id}/metrics` */
export interface GetCollectionsMetricsQuery {
  from?: string | null;
  group_by: string;
  to?: string | null;
}

/** Query-параметры `GET /partners/collections/{collection_id}/metrics` */
export const GetCollectionsMetricsQuerySchema: z.ZodType<GetCollectionsMetricsQuery> = z.object({
  from: z.string().nullish(),
  group_by: z.string(),
  to: z.string().nullish(),
});

/** Query-параметры `GET /partners/market/actions/` */
export interface GetMarketActionsQuery {
  action_types?: MarketActionType[] | null;
  collection_id?: string | null;
  collection_ids?: string[] | null;
  external_collection_number?: number | null;
  filter_by_backdrops?: string[] | null;
  filter_by_models?: string[] | null;
  filter_by_symbols?: string[] | null;
  limit?: number | null;
  max_price?: string | null;
  min_price?: string | null;
  offset?: number | null;
  period?: Period | null;
  search?: string | null;
  sort_by?: SortByActions | null;
  status?: ListingStatus | null;
}

/** Query-параметры `GET /partners/market/actions/` */
export const GetMarketActionsQuerySchema: z.ZodType<GetMarketActionsQuery> = z.object({
  action_types: z.array(MarketActionTypeSchema).nullish(),
  collection_id: z.string().nullish(),
  collection_ids: z.array(z.string()).nullish(),
  external_collection_number: z.number().int().min(1).nullish(),
  filter_by_backdrops: z.array(z.string()).nullish(),
  filter_by_models: z.array(z.string()).nullish(),
  filter_by_symbols: z.array(z.string()).nullish(),
  limit: z.number().int().min(1).max(20).nullish(),
  max_price: z.string().nullish(),
  min_price: z.string().nullish(),
  offset: z.number().int().min(0).max(700).nullish(),
  period: PeriodSchema.nullish(),
  search: z.string().nullish(),
  sort_by: SortByActionsSchema.nullish(),
  status: ListingStatusSchema.nullish(),
});

/** Query-параметры `GET /partners/nfts/owned` */
export interface GetNftsOwnedQuery {
  collection_id?: string | null;
  collection_ids?: string[] | null;
  exclude_bundled?: boolean | null;
  external_collection_number?: number | null;
  filter_by_backdrops?: string[] | null;
  filter_by_models?: string[] | null;
  filter_by_symbols?: string[] | null;
  ids?: string[] | null;
  is_crafted_status?: CraftedStatus | null;
  is_owned?: boolean | null;
  limit?: number | null;
  max_price?: string | null;
  min_price?: string | null;
  mint_status?: MintStatus | null;
  name_filter?: string | null;
  offset?: number | null;
  premarket_status?: PremarketFilterStatus | null;
  search?: string | null;
  sort_by?: SortByNfts | null;
  status?: ListingStatus | null;
  statuses?: string[] | null;
  tg_ids?: string[] | null;
  with_attribute_floors?: boolean | null;
  with_attributes?: boolean | null;
}

/** Query-параметры `GET /partners/nfts/owned` */
export const GetNftsOwnedQuerySchema: z.ZodType<GetNftsOwnedQuery> = z.object({
  collection_id: z.string().nullish(),
  collection_ids: z.array(z.string()).nullish(),
  exclude_bundled: z.boolean().nullish(),
  external_collection_number: z.number().int().nullish(),
  filter_by_backdrops: z.array(z.string()).nullish(),
  filter_by_models: z.array(z.string()).nullish(),
  filter_by_symbols: z.array(z.string()).nullish(),
  ids: z.array(z.string()).nullish(),
  is_crafted_status: CraftedStatusSchema.nullish(),
  is_owned: z.boolean().nullish(),
  limit: z.number().int().nullish(),
  max_price: z.string().nullish(),
  min_price: z.string().nullish(),
  mint_status: MintStatusSchema.nullish(),
  name_filter: z.string().nullish(),
  offset: z.number().int().nullish(),
  premarket_status: PremarketFilterStatusSchema.nullish(),
  search: z.string().nullish(),
  sort_by: SortByNftsSchema.nullish(),
  status: ListingStatusSchema.nullish(),
  statuses: z.array(z.string()).nullish(),
  tg_ids: z.array(z.string()).nullish(),
  with_attribute_floors: z.boolean().nullish(),
  with_attributes: z.boolean().nullish(),
});

/** Query-параметры `GET /partners/nfts/search` */
export interface GetNftsSearchQuery {
  collection_id?: string | null;
  collection_ids?: string[] | null;
  exclude_bundled?: boolean | null;
  external_collection_number?: number | null;
  filter_by_backdrops?: string[] | null;
  filter_by_models?: string[] | null;
  filter_by_symbols?: string[] | null;
  ids?: string[] | null;
  is_crafted_status?: CraftedStatus | null;
  is_owned?: boolean | null;
  limit?: number | null;
  max_price?: string | null;
  min_price?: string | null;
  mint_status?: MintStatus | null;
  name_filter?: string | null;
  offset?: number | null;
  premarket_status?: PremarketFilterStatus | null;
  search?: string | null;
  sort_by?: SortByNfts | null;
  status?: ListingStatus | null;
  statuses?: string[] | null;
  tg_ids?: string[] | null;
  with_attribute_floors?: boolean | null;
  with_attributes?: boolean | null;
}

/** Query-параметры `GET /partners/nfts/search` */
export const GetNftsSearchQuerySchema: z.ZodType<GetNftsSearchQuery> = z.object({
  collection_id: z.string().nullish(),
  collection_ids: z.array(z.string()).nullish(),
  exclude_bundled: z.boolean().nullish(),
  external_collection_number: z.number().int().nullish(),
  filter_by_backdrops: z.array(z.string()).nullish(),
  filter_by_models: z.array(z.string()).nullish(),
  filter_by_symbols: z.array(z.string()).nullish(),
  ids: z.array(z.string()).nullish(),
  is_crafted_status: CraftedStatusSchema.nullish(),
  is_owned: z.boolean().nullish(),
  limit: z.number().int().nullish(),
  max_price: z.string().nullish(),
  min_price: z.string().nullish(),
  mint_status: MintStatusSchema.nullish(),
  name_filter: z.string().nullish(),
  offset: z.number().int().nullish(),
  premarket_status: PremarketFilterStatusSchema.nullish(),
  search: z.string().nullish(),
  sort_by: SortByNftsSchema.nullish(),
  status: ListingStatusSchema.nullish(),
  statuses: z.array(z.string()).nullish(),
  tg_ids: z.array(z.string()).nullish(),
  with_attribute_floors: z.boolean().nullish(),
  with_attributes: z.boolean().nullish(),
});

/** Query-параметры `GET /partners/nfts/withdrawals/statuses` */
export interface GetNftsWithdrawalsStatusesQuery {
  ids: number[];
}

/** Query-параметры `GET /partners/nfts/withdrawals/statuses` */
export const GetNftsWithdrawalsStatusesQuerySchema: z.ZodType<GetNftsWithdrawalsStatusesQuery> = z.object({
  ids: z.array(z.number().int()),
});

/** Query-параметры `GET /partners/users/actions` */
export interface GetUsersActionsQuery {
  action_types?: MarketActionType[] | null;
  collection_id?: string | null;
  collection_ids?: string[] | null;
  external_collection_number?: number | null;
  filter_by_backdrops?: string[] | null;
  filter_by_models?: string[] | null;
  filter_by_symbols?: string[] | null;
  limit?: number | null;
  max_price?: string | null;
  min_price?: string | null;
  offset?: number | null;
  period?: Period | null;
  search?: string | null;
  sort_by?: SortByActions | null;
  status?: ListingStatus | null;
}

/** Query-параметры `GET /partners/users/actions` */
export const GetUsersActionsQuerySchema: z.ZodType<GetUsersActionsQuery> = z.object({
  action_types: z.array(MarketActionTypeSchema).nullish(),
  collection_id: z.string().nullish(),
  collection_ids: z.array(z.string()).nullish(),
  external_collection_number: z.number().int().min(1).nullish(),
  filter_by_backdrops: z.array(z.string()).nullish(),
  filter_by_models: z.array(z.string()).nullish(),
  filter_by_symbols: z.array(z.string()).nullish(),
  limit: z.number().int().min(1).max(20).nullish(),
  max_price: z.string().nullish(),
  min_price: z.string().nullish(),
  offset: z.number().int().min(0).max(700).nullish(),
  period: PeriodSchema.nullish(),
  search: z.string().nullish(),
  sort_by: SortByActionsSchema.nullish(),
  status: ListingStatusSchema.nullish(),
});

/** Query-параметры `GET /partners/users/wallets/withdrawals/statuses` */
export interface GetUsersWalletsWithdrawalsStatusesQuery {
  ids: string[];
}

/** Query-параметры `GET /partners/users/wallets/withdrawals/statuses` */
export const GetUsersWalletsWithdrawalsStatusesQuerySchema: z.ZodType<GetUsersWalletsWithdrawalsStatusesQuery> = z.object({
  ids: z.array(z.string()),
});

/** Все операции спеки: метод, путь, схемы запроса и ответа, лимит из описания. */
export const operations = {
  /** Place an Arena bet in TON or gifts */
  postArenaBet: {
    method: "POST",
    path: "/partners/arena/bet",
    pathParams: [],
    query: undefined,
    body: ArenaBetRequestSchema,
    response: ArenaBetResponseSchema,
    successStatus: 200,
    rateLimit: undefined,
  },
  /** Own gifts with Arena valuation */
  getArenaInventory: {
    method: "GET",
    path: "/partners/arena/inventory",
    pathParams: [],
    query: GetArenaInventoryQuerySchema,
    body: undefined,
    response: ArenaInventoryResponseSchema,
    successStatus: 200,
    rateLimit: undefined,
  },
  /** Arena state: all rooms with the current game and its bets */
  getArenaState: {
    method: "GET",
    path: "/partners/arena/state",
    pathParams: [],
    query: undefined,
    body: undefined,
    response: ArenaStateResponseSchema,
    successStatus: 200,
    rateLimit: undefined,
  },
  /** Create a new collection offer */
  postCollectionOffers: {
    method: "POST",
    path: "/partners/collection-offers/",
    pathParams: [],
    query: undefined,
    body: CreateOfferRequestSchema,
    response: CreateOfferResponseSchema,
    successStatus: 201,
    rateLimit: undefined,
  },
  /** Bulk update collection offers */
  postCollectionOffersBulkUpdate: {
    method: "POST",
    path: "/partners/collection-offers/bulk/update",
    pathParams: [],
    query: undefined,
    body: BulkUpdateOffersRequestSchema,
    response: UpdateBatchOutSchema,
    successStatus: 200,
    rateLimit: undefined,
  },
  /** Cancel a collection offer */
  postCollectionOffersCancel: {
    method: "POST",
    path: "/partners/collection-offers/cancel",
    pathParams: [],
    query: undefined,
    body: CancelOfferRequestSchema,
    response: null,
    successStatus: 204,
    rateLimit: undefined,
  },
  /** Get collections available for offers */
  getCollectionOffersCollections: {
    method: "GET",
    path: "/partners/collection-offers/collections",
    pathParams: [],
    query: undefined,
    body: undefined,
    response: FetchCollectionsOutSchema,
    successStatus: 200,
    rateLimit: undefined,
  },
  /** Get top collection offers (up to 10) */
  getCollectionOffersAll: {
    method: "GET",
    path: "/partners/collection-offers/{collection_id}/all",
    pathParams: ["collection_id"],
    query: GetCollectionOffersAllQuerySchema,
    body: undefined,
    response: FetchTopOutSchema,
    successStatus: 200,
    rateLimit: undefined,
  },
  /** Get top collection offer */
  getCollectionOffersTop: {
    method: "GET",
    path: "/partners/collection-offers/{collection_id}/top",
    pathParams: ["collection_id"],
    query: GetCollectionOffersTopQuerySchema,
    body: undefined,
    response: CollectionOfferItemSchema.nullable(),
    successStatus: 200,
    rateLimit: undefined,
  },
  /** Accept a collection offer */
  postCollectionOffersAccept: {
    method: "POST",
    path: "/partners/collection-offers/{offer_id}/accept",
    pathParams: ["offer_id"],
    query: undefined,
    body: AcceptOfferRequestSchema,
    response: null,
    successStatus: 204,
    rateLimit: undefined,
  },
  /** Get all unique attribute floor prices */
  getCollectionsAttributeFloors: {
    method: "GET",
    path: "/partners/collections/attribute-floors",
    pathParams: [],
    query: undefined,
    body: undefined,
    response: FetchAllUniqueAttributeFloorsOutSchema,
    successStatus: 200,
    rateLimit: undefined,
  },
  /** Get floor prices for common backgrounds */
  getCollectionsBackdropsFloors: {
    method: "GET",
    path: "/partners/collections/backdrops/floors",
    pathParams: [],
    query: undefined,
    body: undefined,
    response: FetchBackgroundFloorPricesOutSchema,
    successStatus: 200,
    rateLimit: undefined,
  },
  /** Get floor prices for all collections */
  getCollectionsFloors: {
    method: "GET",
    path: "/partners/collections/floors",
    pathParams: [],
    query: undefined,
    body: undefined,
    response: FetchBackgroundFloorPricesOutSchema,
    successStatus: 200,
    rateLimit: undefined,
  },
  /** Get background floor prices for specific models */
  getCollectionsModelsBackgroundsFloors: {
    method: "GET",
    path: "/partners/collections/models/backgrounds/floors",
    pathParams: [],
    query: GetCollectionsModelsBackgroundsFloorsQuerySchema,
    body: undefined,
    response: FetchModelsBackgroundsFloorPricesOutSchema,
    successStatus: 200,
    rateLimit: undefined,
  },
  /** Get all collections with preview */
  getCollectionsPreview: {
    method: "GET",
    path: "/partners/collections/preview",
    pathParams: [],
    query: GetCollectionsPreviewQuerySchema,
    body: undefined,
    response: FetchAllCollectionsWithPreviewOutSchema,
    successStatus: 200,
    rateLimit: undefined,
  },
  /** Get collection metrics history */
  getCollectionsMetrics: {
    method: "GET",
    path: "/partners/collections/{collection_id}/metrics",
    pathParams: ["collection_id"],
    query: GetCollectionsMetricsQuerySchema,
    body: undefined,
    response: FetchCollectionMetricsOutSchema,
    successStatus: 200,
    rateLimit: undefined,
  },
  /** Generate deposit ID for user */
  postDeposits: {
    method: "POST",
    path: "/partners/deposits",
    pathParams: [],
    query: undefined,
    body: undefined,
    response: GenerateDepositIdOutSchema,
    successStatus: 200,
    rateLimit: undefined,
  },
  /** Get market activity */
  getMarketActions: {
    method: "GET",
    path: "/partners/market/actions/",
    pathParams: [],
    query: GetMarketActionsQuerySchema,
    body: undefined,
    response: FetchAllUserActionsOutSchema,
    successStatus: 200,
    rateLimit: undefined,
  },
  /** Get market configuration */
  getMarketConfig: {
    method: "GET",
    path: "/partners/market/config",
    pathParams: [],
    query: undefined,
    body: undefined,
    response: GeneralOutSchema,
    successStatus: 200,
    rateLimit: undefined,
  },
  /** Buy NFTs with partial purchase support */
  postNfts: {
    method: "POST",
    path: "/partners/nfts",
    pathParams: [],
    query: undefined,
    body: BuyPartialInSchema,
    response: BuyPartialOutSchema,
    successStatus: 200,
    rateLimit: undefined,
  },
  /** Bulk list NFTs for sale */
  postNftsBulkList: {
    method: "POST",
    path: "/partners/nfts/bulk-list",
    pathParams: [],
    query: undefined,
    body: BulkListForSaleInSchema,
    response: BulkListingResultSchema,
    successStatus: 200,
    rateLimit: undefined,
  },
  /** Bulk delist NFTs from sale */
  postNftsBulkUnlist: {
    method: "POST",
    path: "/partners/nfts/bulk-unlist",
    pathParams: [],
    query: undefined,
    body: BulkDelistInSchema,
    response: BulkListingResultSchema,
    successStatus: 200,
    rateLimit: undefined,
  },
  /** Get NFTs owned by user */
  getNftsOwned: {
    method: "GET",
    path: "/partners/nfts/owned",
    pathParams: [],
    query: GetNftsOwnedQuerySchema,
    body: undefined,
    response: FetchOwnedOutSchema,
    successStatus: 200,
    rateLimit: undefined,
  },
  /** Search NFTs by name with filters */
  getNftsSearch: {
    method: "GET",
    path: "/partners/nfts/search",
    pathParams: [],
    query: GetNftsSearchQuerySchema,
    body: undefined,
    response: SearchNftsOutSchema,
    successStatus: 200,
    rateLimit: undefined,
  },
  /** Get user NFT statistics */
  getNftsStats: {
    method: "GET",
    path: "/partners/nfts/stats",
    pathParams: [],
    query: undefined,
    body: undefined,
    response: FetchUserStatsOutSchema,
    successStatus: 200,
    rateLimit: undefined,
  },
  /** Transfer gifts to another user */
  postNftsTransfer: {
    method: "POST",
    path: "/partners/nfts/transfer",
    pathParams: [],
    query: undefined,
    body: TransferGiftsInSchema,
    response: TransferGiftsOutSchema,
    successStatus: 200,
    rateLimit: undefined,
  },
  /** Withdraw multiple gifts to user account */
  postNftsWithdraw: {
    method: "POST",
    path: "/partners/nfts/withdraw",
    pathParams: [],
    query: undefined,
    body: WithdrawGiftsInSchema,
    response: WithdrawGiftsOutSchema,
    successStatus: 200,
    rateLimit: undefined,
  },
  /** Get withdrawal statuses */
  getNftsWithdrawalsStatuses: {
    method: "GET",
    path: "/partners/nfts/withdrawals/statuses",
    pathParams: [],
    query: GetNftsWithdrawalsStatusesQuerySchema,
    body: undefined,
    response: WithdrawalStatusesOutSchema,
    successStatus: 200,
    rateLimit: undefined,
  },
  /** List NFT for sale */
  postNftsList: {
    method: "POST",
    path: "/partners/nfts/{nft_id}/list",
    pathParams: ["nft_id"],
    query: undefined,
    body: ListForSaleInSchema,
    response: null,
    successStatus: 204,
    rateLimit: undefined,
  },
  /** Delist NFT from sale */
  postNftsUnlist: {
    method: "POST",
    path: "/partners/nfts/{nft_id}/unlist",
    pathParams: ["nft_id"],
    query: undefined,
    body: undefined,
    response: null,
    successStatus: 204,
    rateLimit: undefined,
  },
  /** Get user actions */
  getUsersActions: {
    method: "GET",
    path: "/partners/users/actions",
    pathParams: [],
    query: GetUsersActionsQuerySchema,
    body: undefined,
    response: FetchUserActionsOutSchema,
    successStatus: 200,
    rateLimit: undefined,
  },
  /** Get user wallet info */
  getUsersWallets: {
    method: "GET",
    path: "/partners/users/wallets/",
    pathParams: [],
    query: undefined,
    body: undefined,
    response: InfoOutSchema,
    successStatus: 200,
    rateLimit: undefined,
  },
  /** Withdraw TON from user wallet */
  postUsersWalletsWithdraw: {
    method: "POST",
    path: "/partners/users/wallets/withdraw",
    pathParams: [],
    query: undefined,
    body: WithdrawInSchema,
    response: WithdrawOutSchema,
    successStatus: 200,
    rateLimit: undefined,
  },
  /** Get withdrawal statuses by IDs */
  getUsersWalletsWithdrawalsStatuses: {
    method: "GET",
    path: "/partners/users/wallets/withdrawals/statuses",
    pathParams: [],
    query: GetUsersWalletsWithdrawalsStatusesQuerySchema,
    body: undefined,
    response: WithdrawStatusOutSchema,
    successStatus: 200,
    rateLimit: undefined,
  },
  /** Check if user exists */
  getUsers: {
    method: "GET",
    path: "/partners/users/{user_id}",
    pathParams: ["user_id"],
    query: undefined,
    body: undefined,
    response: CheckExistenceOutSchema,
    successStatus: 200,
    rateLimit: undefined,
  },
} as const;

export type OperationId = keyof typeof operations;

/** Схема каждого определения спеки по его исходному имени. */
export const definitionSchemas: Record<string, z.ZodType> = {
  "collection.FetchAllCollectionsWithPreviewOut": FetchAllCollectionsWithPreviewOutSchema,
  "collection.FetchAllUniqueAttributeFloorsOut": FetchAllUniqueAttributeFloorsOutSchema,
  "collection.FetchBackgroundFloorPricesOut": FetchBackgroundFloorPricesOutSchema,
  "collection.FetchCollectionMetricsOut": FetchCollectionMetricsOutSchema,
  "collection.FetchModelsBackgroundsFloorPricesOut": FetchModelsBackgroundsFloorPricesOutSchema,
  "collectionoffer.FetchCollectionsOut": FetchCollectionsOutSchema,
  "collectionoffer.UpdateBatchFailedItem": UpdateBatchFailedItemSchema,
  "collectionoffer.UpdateBatchOut": UpdateBatchOutSchema,
  "dtocollectionfiltersrepo.AttributeFloorInfo": AttributeFloorInfoSchema,
  "dtocollectionfiltersrepo.FetchCollectionAttrFloorPricesOut": FetchCollectionAttrFloorPricesOutSchema,
  "dtocollectionoffers.CollectionInfo": CollectionInfoSchema,
  "dtocollectionoffers.CollectionOfferItem": CollectionOfferItemSchema,
  "dtocollectionoffers.FetchTopOut": FetchTopOutSchema,
  "dtonft.BulkListingResult": BulkListingResultSchema,
  "dtonft.FailedNft": FailedNftSchema,
  "dwithdrawalsrepo.FetchStatusByIdOut": FetchStatusByIdOutSchema,
  "exerr.HttpError": HttpErrorSchema,
  "httpcollectionoffer.CreateOfferAttribute": CreateOfferAttributeSchema,
  "httpcollectionoffer.CreateOfferResponse": CreateOfferResponseSchema,
  "httpmodel.Nft": HttpmodelNftSchema,
  "httptrustedapps.AcceptOfferRequest": AcceptOfferRequestSchema,
  "httptrustedapps.BulkUpdateOfferItem": BulkUpdateOfferItemSchema,
  "httptrustedapps.BulkUpdateOffersRequest": BulkUpdateOffersRequestSchema,
  "httptrustedapps.CancelOfferRequest": CancelOfferRequestSchema,
  "httptrustedapps.CreateOfferRequest": CreateOfferRequestSchema,
  "httptrustedapps.arenaBet": ArenaBetSchema,
  "httptrustedapps.arenaBetRequest": ArenaBetRequestSchema,
  "httptrustedapps.arenaBetResponse": ArenaBetResponseSchema,
  "httptrustedapps.arenaGame": ArenaGameSchema,
  "httptrustedapps.arenaInventoryAttr": ArenaInventoryAttrSchema,
  "httptrustedapps.arenaInventoryItem": ArenaInventoryItemSchema,
  "httptrustedapps.arenaInventoryResponse": ArenaInventoryResponseSchema,
  "httptrustedapps.arenaRoom": ArenaRoomSchema,
  "httptrustedapps.arenaStateResponse": ArenaStateResponseSchema,
  "httptrustedapps.fetchOwnedOut": FetchOwnedOutSchema,
  "httptrustedapps.generalOut": GeneralOutSchema,
  "httptrustedapps.searchNftsOut": SearchNftsOutSchema,
  "model.AnonymizedUserAction": AnonymizedUserActionSchema,
  "model.AttributeFloorPrices": AttributeFloorPricesSchema,
  "model.BundleExtended": BundleExtendedSchema,
  "model.BundleNft": BundleNftSchema,
  "model.BundleNftDetails": BundleNftDetailsSchema,
  "model.BundleStatus": BundleStatusSchema,
  "model.Collection": CollectionSchema,
  "model.CollectionAsset": CollectionAssetSchema,
  "model.CollectionMetrics": CollectionMetricsSchema,
  "model.CollectionOfferScope": CollectionOfferScopeSchema,
  "model.CollectionWithPreview": CollectionWithPreviewSchema,
  "model.DepositBonusClaimStatus": DepositBonusClaimStatusSchema,
  "model.DetailedUserAction": DetailedUserActionSchema,
  "model.Nft": ModelNftSchema,
  "model.NftAttribute": NftAttributeSchema,
  "model.NftAttributeType": NftAttributeTypeSchema,
  "model.NftDepositBonus": NftDepositBonusSchema,
  "model.NftImportSource": NftImportSourceSchema,
  "model.NftStatus": NftStatusSchema,
  "model.PremarketOrder": PremarketOrderSchema,
  "model.PremarketOrderStatus": PremarketOrderStatusSchema,
  "model.TonWithdrawalStatus": TonWithdrawalStatusSchema,
  "model.User": UserSchema,
  "model.UserActionCollectionOffer": UserActionCollectionOfferSchema,
  "model.UserActionNft": UserActionNftSchema,
  "model.UserActionOffer": UserActionOfferSchema,
  "model.UserActionType": UserActionTypeSchema,
  "nft.AttributeFloorsMap": AttributeFloorsMapSchema,
  "nft.BulkDelistIn": BulkDelistInSchema,
  "nft.BulkListForSaleIn": BulkListForSaleInSchema,
  "nft.BuyDetail": BuyDetailSchema,
  "nft.BuyPartialIn": BuyPartialInSchema,
  "nft.BuyPartialOut": BuyPartialOutSchema,
  "nft.FetchUserStatsOut": FetchUserStatsOutSchema,
  "nft.InvalidNftDetail": InvalidNftDetailSchema,
  "nft.InvalidNftReason": InvalidNftReasonSchema,
  "nft.ListForSaleIn": ListForSaleInSchema,
  "nft.NftPriceDetail": NftPriceDetailSchema,
  "nft.PurchaseResult": PurchaseResultSchema,
  "nft.TransferFailedItem": TransferFailedItemSchema,
  "nft.TransferGiftsIn": TransferGiftsInSchema,
  "nft.TransferGiftsOut": TransferGiftsOutSchema,
  "nft.TransferRecipientInfo": TransferRecipientInfoSchema,
  "nft.UpdatedNftDetail": UpdatedNftDetailSchema,
  "nft.WithdrawGiftsIn": WithdrawGiftsInSchema,
  "nft.WithdrawGiftsOut": WithdrawGiftsOutSchema,
  "nft.WithdrawalStatus": WithdrawalStatusSchema,
  "nft.WithdrawalStatusesOut": WithdrawalStatusesOutSchema,
  "user.CheckExistenceOut": CheckExistenceOutSchema,
  "usersactions.FetchAllUserActionsOut": FetchAllUserActionsOutSchema,
  "usersactions.FetchUserActionsOut": FetchUserActionsOutSchema,
  "userwallet.GenerateDepositIdOut": GenerateDepositIdOutSchema,
  "userwallet.InfoOut": InfoOutSchema,
  "userwallet.WithdrawIn": WithdrawInSchema,
  "userwallet.WithdrawOut": WithdrawOutSchema,
  "userwallet.WithdrawStatusOut": WithdrawStatusOutSchema,
};
