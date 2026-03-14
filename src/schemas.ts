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
  message: z.string().optional(),
});

export const NftAttributeSchema = z.object({
  type: NftAttributeTypeSchema,
  value: z.string(),
  rarity_per_mille: z.number(),
  floor: z.string().optional(),
});

export const UserSchema = z.object({
  name: z.string().optional(),
  username: z.string().optional(),
  is_influencer: z.boolean(),
  referral_level: z.number(),
  referrer_id: z.number().optional(),
});

export const BundleNftDetailsSchema = z.object({
  id: z.string(),
  name: z.string(),
  photo_url: z.string(),
  external_collection_number: z.number(),
  status: NftStatusSchema,
  collection_floor_price: z.string().optional(),
  tg_id: z.string().optional(),
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
  price: z.string().optional(),
  is_owned: z.boolean().optional(),
});

export const PremarketOrderSchema: z.ZodType<{
  id?: string;
  nft_id?: string;
  seller_id?: number;
  buyer_id?: number;
  price?: string;
  deposit_amount?: string;
  deposit_percent?: number;
  status?: string;
  created_at?: string;
  listed_at?: string;
  sold_at?: string;
  updated_at?: string;
  transfer_deadline?: string;
  unlock_date?: string;
  warning_until?: string;
  seller?: z.infer<typeof UserSchema>;
  buyer?: z.infer<typeof UserSchema>;
  nft?: unknown;
}> = z.object({
  id: z.string().optional(),
  nft_id: z.string().optional(),
  seller_id: z.number().optional(),
  buyer_id: z.number().optional(),
  price: z.string().optional(),
  deposit_amount: z.string().optional(),
  deposit_percent: z.number().optional(),
  status: PremarketOrderStatusSchema.optional(),
  created_at: z.string().optional(),
  listed_at: z.string().optional(),
  sold_at: z.string().optional(),
  updated_at: z.string().optional(),
  transfer_deadline: z.string().optional(),
  unlock_date: z.string().optional(),
  warning_until: z.string().optional(),
  seller: UserSchema.optional(),
  buyer: UserSchema.optional(),
  nft: z.lazy(() => NftModelSchema).optional(),
});

export const NftModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  photo_url: z.string(),
  collection_id: z.string(),
  external_collection_number: z.number(),
  status: NftStatusSchema,
  attributes: z.array(NftAttributeSchema),
  price: z.string().optional(),
  listed_at: z.string().optional(),
  floor_price: z.string().optional(),
  animation_url: z.string().optional(),
  has_animation: z.boolean().optional(),
  emoji_id: z.string().optional(),
  tg_id: z.string().optional(),
  ton_address: z.string().optional(),
  bundle_id: z.number().optional(),
  is_crafted: z.boolean().optional(),
  import_source: NftImportSourceSchema.optional(),
  imported_at: z.string().optional(),
  unlocks_at: z.string().optional(),
  premarket_data: PremarketOrderSchema.optional(),
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
  id: z.string().optional(),
  name: z.string(),
  photo_url: z.string(),
  short_name: z.string().optional(),
  floor_price: z.string().optional(),
  day_volume: z.string().optional(),
  market_cap: z.string().optional(),
  supply: z.number().optional(),
  is_premarket: z.boolean().optional(),
  is_crafted: z.boolean().optional(),
  created_at: z.string().optional(),
  unlocks_in: z.string().optional(),
});

export const CollectionAssetSchema = z.object({
  name: z.string(),
  url: z.string(),
  rarity_per_mille: z.number().optional(),
  crafted_rarity: z.string().optional(),
});

export const CollectionWithPreviewSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  photo_url: z.string().optional(),
  short_name: z.string().optional(),
  floor_price: z.string().optional(),
  day_volume: z.string().optional(),
  supply: z.string().optional(),
  preview: CollectionAssetSchema.optional(),
});

export const CollectionMetricsSchema = z.object({
  collection_id: z.string(),
  avg_price: z.string(),
  total_volume: z.string(),
  floor_price: z.string().optional(),
  interval_time: z.string().optional(),
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
  expires_at: z.string().optional(),
});

export const CollectionOfferInfoSchema = z.object({
  name: z.string().optional(),
  short_name: z.string().optional(),
  photo_url: z.string().optional(),
  floor_price: z.string().optional(),
  is_premarket: z.boolean().optional(),
  unlocks_in: z.string().optional(),
});

export const CollectionOfferItemSchema = z.object({
  id: z.string().optional(),
  collection_id: z.string().optional(),
  sender_id: z.number().optional(),
  amount: z.string().optional(),
  max_nfts: z.number().optional(),
  current_nfts: z.number().optional(),
  status: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  expires_at: z.string().optional(),
  collection: CollectionOfferInfoSchema.optional(),
});

export const UserActionNftSchema = z.object({
  id: z.string(),
  name: z.string(),
  photo_url: z.string(),
  collection_id: z.string(),
  external_collection_number: z.number(),
  is_owned: z.boolean(),
  price: z.string().optional(),
  floor_price: z.string().optional(),
  status: z.string().optional(),
  animation_url: z.string().optional(),
  has_animation: z.boolean().optional(),
  emoji_id: z.string().optional(),
  is_crafted: z.boolean().optional(),
  ton_address: z.string().optional(),
  unlocks_at: z.string().optional(),
  attributes: z.array(NftAttributeSchema).optional(),
});

export const UserActionOfferSchema = z.object({
  price: z.string(),
  status: z.string(),
  sender_id: z.number().optional(),
  recipient_id: z.number().optional(),
});

export const UserActionCollectionOfferSchema = z.object({
  id: z.string(),
  name: z.string(),
  photo_url: z.string(),
  short_name: z.string(),
  floor_price: z.string().optional(),
});

export const AnonymizedUserActionSchema = z.object({
  type: UserActionTypeSchema,
  created_at: z.string(),
  amount: z.string().optional(),
  offer_id: z.string().optional(),
  nft: UserActionNftSchema.optional(),
  bundle: BundleExtendedSchema.optional(),
});

export const DetailedUserActionSchema = z.object({
  type: UserActionTypeSchema,
  collection_id: z.string(),
  amount: z.string().optional(),
  nft_id: z.string().optional(),
  offer_id: z.string().optional(),
  created_at: z.string().optional(),
  initiator_user_id: z.number().optional(),
  target_user_id: z.number().optional(),
  max_nfts: z.number().optional(),
  referrer_revenue: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  nft: UserActionNftSchema.optional(),
  offer: UserActionOfferSchema.optional(),
  collection: UserActionCollectionOfferSchema.optional(),
  bundle: BundleExtendedSchema.optional(),
});

export const BuyDetailSchema = z.object({
  id: z.string(),
  price: z.string(),
});

export const NftPriceDetailSchema = z.object({
  nft_id: z.string(),
  price: z.string().optional(),
});

export const PurchaseResultSchema = z.object({
  id: z.string().optional(),
  status: z.string().optional(),
  price: z.string().optional(),
  reason: z.string().optional(),
  error_message: z.string().optional(),
  nft: NftModelSchema.optional(),
});

export const InvalidNftDetailSchema = z.object({
  id: z.string().optional(),
  reason: InvalidNftReasonSchema.optional(),
  nft: NftModelSchema.optional(),
});

export const UpdatedNftDetailSchema = z.object({
  id: z.string().optional(),
  old_price: z.string().optional(),
  current_price: z.string().optional(),
  status: NftStatusSchema.optional(),
  nft: NftModelSchema.optional(),
});

export const BulkListingFailedNftSchema = z.object({
  nft_id: z.string().optional(),
  reason: z.string().optional(),
});

export const TransferFailedItemSchema = z.object({
  nft_id: z.string().optional(),
  reason: z.string().optional(),
});

export const TransferRecipientInfoSchema = z.object({
  user_id: z.number().optional(),
  username: z.string().optional(),
});

export const WithdrawalStatusSchema = z.object({
  id: z.number(),
  status: WithdrawalStatusValueSchema,
  nft_id: z.string().optional(),
  details: z.string().optional(),
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
  collections: z.array(CollectionSchema).optional(),
  total_count: z.number().optional(),
});

export const FetchTopOffersResponseSchema = z.object({
  offers: z.array(CollectionOfferItemSchema).optional(),
  total_count: z.number().optional(),
});

export const TopCollectionOfferResponseSchema = CollectionOfferItemSchema;

export const AttributeFloorsResponseSchema = z.object({
  models: z.array(AttributeFloorInfoSchema).optional(),
  attribute_floors: CollectionAttrFloorPricesSchema.optional(),
  updated_at: z.string(),
});

export const BackdropFloorsResponseSchema = z.object({
  floorPrices: AttributeFloorPricesSchema,
});

export const ModelBackgroundFloorsResponseSchema = z.object({
  model_backgrounds: z.record(z.string(), AttributeFloorPricesSchema),
});

export const CollectionsPreviewResponseSchema = z.object({
  collections: z.array(CollectionWithPreviewSchema).optional(),
});

export const CollectionMetricsResponseSchema = z.object({
  history: z.array(CollectionMetricsSchema).optional(),
});

export const GenerateDepositIdResponseSchema = z.object({
  id: z.string().optional(),
});

export const MarketActionsResponseSchema = z.object({
  actions: z.array(AnonymizedUserActionSchema),
});

export const MarketConfigResponseSchema = z.object({
  commission: z.string(),
  cooldown: z.string(),
  deposit_wallet: z.string(),
  rub_course: z.string(),
  usd_course: z.string(),
  user_cashback: z.string(),
});

export const BuyPartialResponseSchema = z.object({
  total_requested: z.number().optional(),
  total_purchased: z.number().optional(),
  total_failed: z.number().optional(),
  total_spent: z.string().optional(),
  purchase_results: z.array(PurchaseResultSchema).optional(),
  invalid_nfts: z.array(InvalidNftDetailSchema).optional(),
  updated_nfts: z.array(UpdatedNftDetailSchema).optional(),
});

export const BulkListingResultResponseSchema = z.object({
  successful_nfts: z.array(z.string()).optional(),
  failed_nfts: z.array(BulkListingFailedNftSchema).optional(),
});

export const OwnedNftsResponseSchema = z.object({
  nfts: z.array(HttpNftSchema),
  total_count: z.number().optional(),
  attribute_floors: AttributeFloorsMapSchema.optional(),
});

export const SearchNftsResponseSchema = z.object({
  results: z.array(HttpNftSchema).optional(),
  total_count: z.number().optional(),
});

export const NftStatsResponseSchema = z.object({
  listed_count: z.number(),
  unlisted_count: z.number(),
});

export const TransferGiftsResponseSchema = z.object({
  transferred_count: z.number().optional(),
  recipient: TransferRecipientInfoSchema.optional(),
  failed_items: z.array(TransferFailedItemSchema).optional(),
});

export const WithdrawGiftsResponseSchema = z.object({
  withdrawals_ids: z.array(z.number()),
});

export const WithdrawalStatusesResponseSchema = z.object({
  statuses: z.array(WithdrawalStatusSchema),
});

export const CheckUserExistsResponseSchema = z.object({
  exists: z.boolean().optional(),
});

export const UserActionsResponseSchema = z.object({
  actions: z.array(DetailedUserActionSchema),
  total_actions: z.number().optional(),
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
