import { z } from "zod";

// ── Enums ──

export enum NftStatus {
  Listed = "listed",
  Unlisted = "unlisted",
  Withdrawn = "withdrawn",
  Auction = "auction",
  GiveawayLocked = "giveaway_locked",
  Bundle = "bundle",
  Deleted = "deleted",
}
export const NftStatusSchema = z.nativeEnum(NftStatus);

export enum NftAttributeType {
  Model = "model",
  Backdrop = "backdrop",
  Symbol = "symbol",
}
export const NftAttributeTypeSchema = z.nativeEnum(NftAttributeType);

export enum NftImportSource {
  Bot = "bot",
  UserBot = "user_bot",
}
export const NftImportSourceSchema = z.nativeEnum(NftImportSource);

export enum BundleStatus {
  Listed = "listed",
  Unlisted = "unlisted",
  Separated = "separated",
}
export const BundleStatusSchema = z.nativeEnum(BundleStatus);

export enum CollectionOfferStatus {
  Pending = "pending",
  Completed = "completed",
  Rejected = "rejected",
  Canceled = "canceled",
}
export const CollectionOfferStatusSchema = z.nativeEnum(CollectionOfferStatus);

export enum PremarketOrderStatus {
  Draft = "draft",
  Listed = "listed",
  Sold = "sold",
  Transferring = "transferring",
  Completed = "completed",
  Cancelled = "cancelled",
  Expired = "expired",
  Failed = "failed",
  Hidden = "hidden",
  Deleted = "deleted",
}
export const PremarketOrderStatusSchema = z.nativeEnum(PremarketOrderStatus);

export enum TonWithdrawalStatus {
  Pending = "pending",
  InProgress = "in_progress",
  Resolved = "resolved",
}
export const TonWithdrawalStatusSchema = z.nativeEnum(TonWithdrawalStatus);

export enum UserActionType {
  Purchase = "purchase",
  Offer = "offer",
  CollectionOffer = "collection_offer",
  Listing = "listing",
  PriceUpdate = "price_update",
  Delist = "delist",
  Reject = "reject",
  Cancel = "cancel",
  Transfer = "transfer",
  GiveawaySent = "giveaway_sent",
  GiveawayWon = "giveaway_won",
  PremarketCollateral = "premarket_collateral",
  BundleListing = "bundle_listing",
  BundleDelisting = "bundle_delisting",
  BundleSeparated = "bundle_separated",
  BundleBundled = "bundle_bundled",
  BundlePurchase = "bundle_purchase",
  BundleOffer = "bundle_offer",
  BundleTransfer = "bundle_transfer",
  BundlePriceUpdate = "bundle_price_update",
}
export const UserActionTypeSchema = z.nativeEnum(UserActionType);

export enum InvalidNftReason {
  NftNotFound = "NFT_NOT_FOUND",
  NftNotListed = "NFT_NOT_LISTED",
  OwnerChanged = "OWNER_CHANGED",
  PriceChanged = "PRICE_CHANGED",
  SelfPurchase = "SELF_PURCHASE",
  DuplicateNft = "DUPLICATE_NFT",
  BundledNft = "BUNDLED_NFT",
  NftNotImported = "NFT_NOT_IMPORTED",
}
export const InvalidNftReasonSchema = z.nativeEnum(InvalidNftReason);

export enum MarketActionType {
  BundleOffer = "bundle_offer",
  BundlePurchase = "bundle_purchase",
  BundleBundled = "bundle_bundled",
  BundleSeparated = "bundle_separated",
  Sell = "sell",
  Buy = "buy",
  Offer = "offer",
  Listing = "listing",
  PriceUpdate = "price_update",
  Delist = "delist",
  Transfer = "transfer",
  Cancel = "cancel",
  Reject = "reject",
}
export const MarketActionTypeSchema = z.nativeEnum(MarketActionType);

export enum WithdrawalStatusValue {
  Pending = "pending",
  Completed = "completed",
  Errored = "errored",
  Recovered = "recovered",
  Unknown = "unknown",
}
export const WithdrawalStatusValueSchema = z.nativeEnum(WithdrawalStatusValue);

export enum SortByNfts {
  ListedAtDesc = "listed_at desc",
  PriceAsc = "price asc",
  PriceDesc = "price desc",
  CollectionNumberAsc = "external_collection_number asc",
  CollectionNumberDesc = "external_collection_number desc",
  RarityAsc = "model_rarity asc",
  RarityDesc = "model_rarity desc",
  NameAsc = "name asc",
  NameDesc = "name desc",
}
export const SortByNftsSchema = z.nativeEnum(SortByNfts);

export enum SortByActions {
  ListedAtDesc = "listed_at desc",
  PriceAsc = "price asc",
  PriceDesc = "price desc",
  CollectionNumberAsc = "external_collection_number asc",
  CollectionNumberDesc = "external_collection_number desc",
  RarityAsc = "model_rarity asc",
  RarityDesc = "model_rarity desc",
  CreatedAtAsc = "created_at asc",
  CreatedAtDesc = "created_at desc",
  IdDesc = "id desc",
  IdAsc = "id asc",
}
export const SortByActionsSchema = z.nativeEnum(SortByActions);

export enum ListingStatus {
  Listed = "listed",
  Unlisted = "unlisted",
}
export const ListingStatusSchema = z.nativeEnum(ListingStatus);

export enum Period {
  SevenDays = "seven_days",
  FourteenDays = "fourteen_days",
  OneMonth = "one_month",
}
export const PeriodSchema = z.nativeEnum(Period);

export enum CraftedStatus {
  All = "all",
  Crafted = "crafted",
  NotCrafted = "not_crafted",
}
export const CraftedStatusSchema = z.nativeEnum(CraftedStatus);

export enum MintStatus {
  All = "all",
  Minted = "minted",
  NotMinted = "not_minted",
}
export const MintStatusSchema = z.nativeEnum(MintStatus);

export enum PremarketFilterStatus {
  All = "all",
  OnlyPremarket = "only_premarket",
  WithoutPremarket = "without_premarket",
  Draft = "draft",
  Listed = "listed",
  Sold = "sold",
}
export const PremarketFilterStatusSchema = z.nativeEnum(PremarketFilterStatus);

export enum CollectionSortBy {
  Name = "name",
  FloorPrice = "floor_price",
}
export const CollectionSortBySchema = z.nativeEnum(CollectionSortBy);

export enum SortOrder {
  Asc = "asc",
  Desc = "desc",
}
export const SortOrderSchema = z.nativeEnum(SortOrder);

// ── Models ──

export const HttpErrorSchema = z.object({
  message: z.string().optional().nullable(),
});

export const NftAttributeSchema = z.object({
  type: NftAttributeTypeSchema,
  value: z.string(),
  rarity_per_mille: z.number(),
  floor: z.string().optional().nullable(),
});

export const UserSchema = z.object({
  name: z.string().optional().nullable(),
  username: z.string().optional().nullable(),
  is_influencer: z.boolean(),
  referral_level: z.number(),
  referrer_id: z.number().optional().nullable(),
});

export const BundleNftDetailsSchema = z.object({
  id: z.string(),
  name: z.string(),
  photo_url: z.string(),
  external_collection_number: z.number(),
  status: NftStatusSchema,
  collection_floor_price: z.string().optional().nullable(),
  tg_id: z.string().optional().nullable(),
});

export const BundleNftSchema = z.object({
  bundle_id: z.number(),
  nft: BundleNftDetailsSchema,
  position: z.number(),
  added_at: z.string(),
});

export const BundleExtendedSchema = z.object({
  id: z.number(),
  status: BundleStatusSchema,
  nfts: z.array(BundleNftSchema),
  nfts_count: z.number(),
  floor_price: z.string(),
  created_at: z.string(),
  price: z.string().optional().nullable(),
  is_owned: z.boolean().optional().nullable(),
});

export const PremarketOrderSchema: z.ZodType<{
  id?: string | null;
  nft_id?: string | null;
  seller_id?: number | null;
  buyer_id?: number | null;
  price?: string | null;
  deposit_amount?: string | null;
  deposit_percent?: number | null;
  status?: string | null;
  created_at?: string | null;
  listed_at?: string | null;
  sold_at?: string | null;
  updated_at?: string | null;
  transfer_deadline?: string | null;
  unlock_date?: string | null;
  warning_until?: string | null;
  seller?: z.infer<typeof UserSchema> | null;
  buyer?: z.infer<typeof UserSchema> | null;
  nft?: unknown | null;
}> = z.object({
  id: z.string().optional().nullable(),
  nft_id: z.string().optional().nullable(),
  seller_id: z.number().optional().nullable(),
  buyer_id: z.number().optional().nullable(),
  price: z.string().optional().nullable(),
  deposit_amount: z.string().optional().nullable(),
  deposit_percent: z.number().optional().nullable(),
  status: PremarketOrderStatusSchema.optional().nullable(),
  created_at: z.string().optional().nullable(),
  listed_at: z.string().optional().nullable(),
  sold_at: z.string().optional().nullable(),
  updated_at: z.string().optional().nullable(),
  transfer_deadline: z.string().optional().nullable(),
  unlock_date: z.string().optional().nullable(),
  warning_until: z.string().optional().nullable(),
  seller: UserSchema.optional().nullable(),
  buyer: UserSchema.optional().nullable(),
  nft: z.lazy(() => NftModelSchema).optional().nullable(),
});

export const NftModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  photo_url: z.string(),
  collection_id: z.string(),
  external_collection_number: z.number(),
  status: NftStatusSchema,
  attributes: z.array(NftAttributeSchema),
  price: z.string().optional().nullable(),
  listed_at: z.string().optional().nullable(),
  floor_price: z.string().optional().nullable(),
  animation_url: z.string().optional().nullable(),
  has_animation: z.boolean().optional().nullable(),
  emoji_id: z.string().optional().nullable(),
  tg_id: z.string().optional().nullable(),
  ton_address: z.string().optional().nullable(),
  bundle_id: z.number().optional().nullable(),
  is_crafted: z.boolean().optional().nullable(),
  import_source: NftImportSourceSchema.optional().nullable(),
  imported_at: z.string().optional().nullable(),
  unlocks_at: z.string().optional().nullable(),
  premarket_data: PremarketOrderSchema.optional().nullable(),
});

export const HttpNftSchema = NftModelSchema.extend({
  is_owned: z.boolean(),
});

export const AttributeFloorPricesSchema = z.record(z.string(), z.string());

export const AttributeFloorsMapSchema = z.object({
  models: z.record(z.string(), z.string()),
  backdrops: z.record(z.string(), z.string()),
  symbols: z.record(z.string(), z.string()),
});

export const CollectionSchema = z.object({
  id: z.string().optional().nullable(),
  name: z.string(),
  photo_url: z.string(),
  short_name: z.string().optional().nullable(),
  floor_price: z.string().optional().nullable(),
  day_volume: z.string().optional().nullable(),
  market_cap: z.string().optional().nullable(),
  supply: z.number().optional().nullable(),
  is_premarket: z.boolean().optional().nullable(),
  is_crafted: z.boolean().optional().nullable(),
  created_at: z.string().optional().nullable(),
  unlocks_in: z.string().optional().nullable(),
});

export const CollectionAssetSchema = z.object({
  name: z.string(),
  url: z.string(),
  rarity_per_mille: z.number().optional().nullable(),
  crafted_rarity: z.string().optional().nullable(),
});

export const CollectionWithPreviewSchema = z.object({
  id: z.string().optional().nullable(),
  name: z.string(),
  photo_url: z.string().optional().nullable(),
  short_name: z.string().optional().nullable(),
  floor_price: z.string().optional().nullable(),
  day_volume: z.string().optional().nullable(),
  supply: z.string().optional().nullable(),
  preview: CollectionAssetSchema.optional().nullable(),
});

export const CollectionMetricsSchema = z.object({
  collection_id: z.string(),
  avg_price: z.string(),
  total_volume: z.string(),
  floor_price: z.string().optional().nullable(),
  interval_time: z.string().optional().nullable(),
});

export const CollectionOfferSchema = z.object({
  id: z.string(),
  collection_id: z.string(),
  sender_id: z.number(),
  amount: z.string(),
  max_nfts: z.number(),
  current_nfts: z.number(),
  status: CollectionOfferStatusSchema,
  created_at: z.string(),
  updated_at: z.string(),
  expires_at: z.string().optional().nullable(),
});

export const CollectionOfferInfoSchema = z.object({
  name: z.string().optional().nullable(),
  short_name: z.string().optional().nullable(),
  photo_url: z.string().optional().nullable(),
  floor_price: z.string().optional().nullable(),
  is_premarket: z.boolean().optional().nullable(),
  unlocks_in: z.string().optional().nullable(),
});

export const CollectionOfferItemSchema = z.object({
  id: z.string().optional().nullable(),
  collection_id: z.string().optional().nullable(),
  sender_id: z.number().optional().nullable(),
  amount: z.string().optional().nullable(),
  max_nfts: z.number().optional().nullable(),
  current_nfts: z.number().optional().nullable(),
  status: CollectionOfferStatusSchema.optional().nullable(),
  created_at: z.string().optional().nullable(),
  updated_at: z.string().optional().nullable(),
  expires_at: z.string().optional().nullable(),
  collection: CollectionOfferInfoSchema.optional().nullable(),
});

export const UserActionNftSchema = z.object({
  id: z.string(),
  name: z.string(),
  photo_url: z.string(),
  collection_id: z.string(),
  external_collection_number: z.number(),
  is_owned: z.boolean(),
  price: z.string().optional().nullable(),
  floor_price: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  animation_url: z.string().optional().nullable(),
  has_animation: z.boolean().optional().nullable(),
  emoji_id: z.string().optional().nullable(),
  is_crafted: z.boolean().optional().nullable(),
  ton_address: z.string().optional().nullable(),
  unlocks_at: z.string().optional().nullable(),
  attributes: z.array(NftAttributeSchema).optional().nullable(),
});

export const UserActionOfferSchema = z.object({
  price: z.string(),
  status: z.string(),
  sender_id: z.number().optional().nullable(),
  recipient_id: z.number().optional().nullable(),
});

export const UserActionCollectionOfferSchema = z.object({
  id: z.string(),
  name: z.string(),
  photo_url: z.string(),
  short_name: z.string(),
  floor_price: z.string().optional().nullable(),
});

export const AnonymizedUserActionSchema = z.object({
  type: UserActionTypeSchema,
  created_at: z.string(),
  amount: z.string().optional().nullable(),
  offer_id: z.string().optional().nullable(),
  nft: UserActionNftSchema.optional().nullable(),
  bundle: BundleExtendedSchema.optional().nullable(),
});

export const DetailedUserActionSchema = z.object({
  type: UserActionTypeSchema,
  collection_id: z.string(),
  amount: z.string().optional().nullable(),
  nft_id: z.string().optional().nullable(),
  offer_id: z.string().optional().nullable(),
  created_at: z.string().optional().nullable(),
  initiator_user_id: z.number().optional().nullable(),
  target_user_id: z.number().optional().nullable(),
  max_nfts: z.number().optional().nullable(),
  referrer_revenue: z.string().optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional().nullable(),
  nft: UserActionNftSchema.optional().nullable(),
  offer: UserActionOfferSchema.optional().nullable(),
  collection: UserActionCollectionOfferSchema.optional().nullable(),
  bundle: BundleExtendedSchema.optional().nullable(),
});

export const BuyDetailSchema = z.object({
  id: z.string(),
  price: z.string(),
});

export const NftPriceDetailSchema = z.object({
  nft_id: z.string(),
  price: z.string().optional().nullable(),
});

export const PurchaseResultSchema = z.object({
  id: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  price: z.string().optional().nullable(),
  reason: z.string().optional().nullable(),
  error_message: z.string().optional().nullable(),
  nft: NftModelSchema.optional().nullable(),
});

export const InvalidNftDetailSchema = z.object({
  id: z.string().optional().nullable(),
  reason: InvalidNftReasonSchema.optional().nullable(),
  nft: NftModelSchema.optional().nullable(),
});

export const UpdatedNftDetailSchema = z.object({
  id: z.string().optional().nullable(),
  old_price: z.string().optional().nullable(),
  current_price: z.string().optional().nullable(),
  status: NftStatusSchema.optional().nullable(),
  nft: NftModelSchema.optional().nullable(),
});

export const BulkListingFailedNftSchema = z.object({
  nft_id: z.string().optional().nullable(),
  reason: z.string().optional().nullable(),
});

export const TransferFailedItemSchema = z.object({
  nft_id: z.string().optional().nullable(),
  reason: z.string().optional().nullable(),
});

export const TransferRecipientInfoSchema = z.object({
  user_id: z.number().optional().nullable(),
  username: z.string().optional().nullable(),
});

export const WithdrawalStatusSchema = z.object({
  id: z.number(),
  status: WithdrawalStatusValueSchema,
  nft_id: z.string().optional().nullable(),
  details: z.string().optional().nullable(),
});

export const TonWithdrawalStatusItemSchema = z.object({
  id: z.string(),
  status: TonWithdrawalStatusSchema,
});

export const AttributeFloorInfoSchema = z.object({
  name: z.string(),
  collection_name: z.string(),
  floor_price: z.string(),
});

export const CollectionAttrFloorPricesSchema = z.record(
  z.string(),
  z.object({
    models: AttributeFloorPricesSchema,
    backdrops: AttributeFloorPricesSchema,
    symbols: AttributeFloorPricesSchema,
  }),
);

// ── Request Schemas ──

export const CreateOfferRequestSchema = z.object({
  collection_id: z.string(),
  amount: z.string(),
  max_nfts: z.number().min(1).max(50),
  expiration_days: z.number().optional(),
});

export const CancelOfferRequestSchema = z.object({
  id: z.string(),
});

export const AcceptOfferRequestSchema = z.object({
  amount: z.string(),
  nft_ids: z.array(z.string()).min(1).max(50),
});

export const BuyPartialRequestSchema = z.object({
  nft_details: z.array(BuyDetailSchema),
});

export const BulkListRequestSchema = z.object({
  nft_prices: z.array(NftPriceDetailSchema),
});

export const BulkDelistRequestSchema = z.object({
  nft_ids: z.array(z.string()),
});

export const ListForSaleRequestSchema = z.object({
  price: z.string().optional(),
});

export const TransferGiftsRequestSchema = z.object({
  recipient: z.string(),
  nft_ids: z.array(z.string()).min(1),
  anonymous: z.boolean().optional(),
});

export const WithdrawGiftsRequestSchema = z.object({
  gift_ids: z.array(z.string()).min(1).optional(),
  recipient_id: z.number().optional(),
  unsafe_transfer: z.boolean().optional(),
});

export const WithdrawTonRequestSchema = z.object({
  amount: z.string(),
  external_address: z.string(),
});

// ── Response Schemas ──

export const CreateOfferResponseSchema = CollectionOfferSchema;

export const FetchOfferCollectionsResponseSchema = z.object({
  collections: z.array(CollectionSchema).optional().nullable(),
  total_count: z.number().optional().nullable(),
});

export const FetchTopOffersResponseSchema = z.object({
  offers: z.array(CollectionOfferItemSchema).optional().nullable(),
  total_count: z.number().optional().nullable(),
});

export const TopCollectionOfferResponseSchema = CollectionOfferItemSchema;

export const AttributeFloorsResponseSchema = z.object({
  models: z.array(AttributeFloorInfoSchema).optional().nullable(),
  attribute_floors: CollectionAttrFloorPricesSchema.optional().nullable(),
  updated_at: z.string(),
});

export const BackdropFloorsResponseSchema = z.object({
  floorPrices: AttributeFloorPricesSchema,
});

export const ModelBackgroundFloorsResponseSchema = z.object({
  model_backgrounds: z.record(z.string(), AttributeFloorPricesSchema),
});

export const CollectionsPreviewResponseSchema = z.object({
  collections: z.array(CollectionWithPreviewSchema).optional().nullable(),
});

export const CollectionMetricsResponseSchema = z.object({
  history: z.array(CollectionMetricsSchema).optional().nullable(),
});

export const GenerateDepositIdResponseSchema = z.object({
  id: z.string().optional().nullable(),
});

export const MarketActionsResponseSchema = z.object({
  actions: z.array(AnonymizedUserActionSchema),
});

export const MarketConfigResponseSchema = z.object({
  commission: z.string(),
  cooldown: z.union([z.string(), z.number()]),
  deposit_wallet: z.string(),
  rub_course: z.string(),
  usd_course: z.string(),
  user_cashback: z.string(),
});

export const BuyPartialResponseSchema = z.object({
  total_requested: z.number().optional().nullable(),
  total_purchased: z.number().optional().nullable(),
  total_failed: z.number().optional().nullable(),
  total_spent: z.string().optional().nullable(),
  purchase_results: z.array(PurchaseResultSchema).optional().nullable(),
  invalid_nfts: z.array(InvalidNftDetailSchema).optional().nullable(),
  updated_nfts: z.array(UpdatedNftDetailSchema).optional().nullable(),
});

export const BulkListingResultResponseSchema = z.object({
  successful_nfts: z.array(z.string()).optional().nullable(),
  failed_nfts: z.array(BulkListingFailedNftSchema).optional().nullable(),
});

export const OwnedNftsResponseSchema = z.object({
  nfts: z.array(HttpNftSchema),
  total_count: z.number().optional().nullable(),
  attribute_floors: AttributeFloorsMapSchema.optional().nullable(),
});

export const SearchNftsResponseSchema = z.object({
  results: z.array(HttpNftSchema).optional().nullable(),
  total_count: z.number().optional().nullable(),
});

export const NftStatsResponseSchema = z.object({
  listed_count: z.number(),
  unlisted_count: z.number(),
});

export const TransferGiftsResponseSchema = z.object({
  transferred_count: z.number().optional().nullable(),
  recipient: TransferRecipientInfoSchema.optional().nullable(),
  failed_items: z.array(TransferFailedItemSchema).optional().nullable(),
});

export const WithdrawGiftsResponseSchema = z.object({
  withdrawals_ids: z.array(z.number()),
});

export const WithdrawalStatusesResponseSchema = z.object({
  statuses: z.array(WithdrawalStatusSchema),
});

export const CheckUserExistsResponseSchema = z.object({
  exists: z.boolean().optional().nullable(),
});

export const UserActionsResponseSchema = z.object({
  actions: z.array(DetailedUserActionSchema),
  total_actions: z.number().optional().nullable(),
});

export const WalletInfoResponseSchema = z.object({
  balance: z.string(),
  frozen_funds: z.string(),
  premarket_funds: z.string(),
});

export const WithdrawTonResponseSchema = z.object({
  id: z.string(),
});

export const WalletWithdrawalStatusesResponseSchema = z.object({
  status: z.array(TonWithdrawalStatusItemSchema),
});
