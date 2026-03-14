import type { z } from "zod";
import type {
  NftAttributeSchema,
  UserSchema,
  BundleNftDetailsSchema,
  BundleNftSchema,
  BundleExtendedSchema,
  PremarketOrderSchema,
  NftModelSchema,
  HttpNftSchema,
  AttributeFloorPricesSchema,
  AttributeFloorsMapSchema,
  CollectionSchema,
  CollectionAssetSchema,
  CollectionWithPreviewSchema,
  CollectionMetricsSchema,
  CollectionOfferSchema,
  CollectionOfferInfoSchema,
  CollectionOfferItemSchema,
  UserActionNftSchema,
  UserActionOfferSchema,
  UserActionCollectionOfferSchema,
  AnonymizedUserActionSchema,
  DetailedUserActionSchema,
  BuyDetailSchema,
  NftPriceDetailSchema,
  PurchaseResultSchema,
  InvalidNftDetailSchema,
  UpdatedNftDetailSchema,
  BulkListingFailedNftSchema,
  TransferFailedItemSchema,
  TransferRecipientInfoSchema,
  WithdrawalStatusSchema,
  TonWithdrawalStatusItemSchema,
  AttributeFloorInfoSchema,
  CreateOfferRequestSchema,
  CancelOfferRequestSchema,
  AcceptOfferRequestSchema,
  BuyPartialRequestSchema,
  BulkListRequestSchema,
  BulkDelistRequestSchema,
  ListForSaleRequestSchema,
  TransferGiftsRequestSchema,
  WithdrawGiftsRequestSchema,
  WithdrawTonRequestSchema,
  CreateOfferResponseSchema,
  FetchOfferCollectionsResponseSchema,
  FetchTopOffersResponseSchema,
  TopCollectionOfferResponseSchema,
  AttributeFloorsResponseSchema,
  BackdropFloorsResponseSchema,
  ModelBackgroundFloorsResponseSchema,
  CollectionsPreviewResponseSchema,
  CollectionMetricsResponseSchema,
  GenerateDepositIdResponseSchema,
  MarketActionsResponseSchema,
  MarketConfigResponseSchema,
  BuyPartialResponseSchema,
  BulkListingResultResponseSchema,
  OwnedNftsResponseSchema,
  SearchNftsResponseSchema,
  NftStatsResponseSchema,
  TransferGiftsResponseSchema,
  WithdrawGiftsResponseSchema,
  WithdrawalStatusesResponseSchema,
  CheckUserExistsResponseSchema,
  UserActionsResponseSchema,
  WalletInfoResponseSchema,
  WithdrawTonResponseSchema,
  WalletWithdrawalStatusesResponseSchema,
} from "./schemas";
import {
  type ListingStatus,
  type SortByNfts,
  type SortByActions,
  type MarketActionType,
  type Period,
  type CraftedStatus,
  type MintStatus,
  type PremarketFilterStatus,
  type CollectionSortBy,
  type SortOrder,
} from "./schemas";

// ── Models ──

export type NftAttribute = z.infer<typeof NftAttributeSchema>;
export type User = z.infer<typeof UserSchema>;
export type BundleNftDetails = z.infer<typeof BundleNftDetailsSchema>;
export type BundleNft = z.infer<typeof BundleNftSchema>;
export type BundleExtended = z.infer<typeof BundleExtendedSchema>;
export type PremarketOrder = z.infer<typeof PremarketOrderSchema>;
export type NftModel = z.infer<typeof NftModelSchema>;
export type HttpNft = z.infer<typeof HttpNftSchema>;
export type AttributeFloorPrices = z.infer<typeof AttributeFloorPricesSchema>;
export type AttributeFloorsMap = z.infer<typeof AttributeFloorsMapSchema>;
export type Collection = z.infer<typeof CollectionSchema>;
export type CollectionAsset = z.infer<typeof CollectionAssetSchema>;
export type CollectionWithPreview = z.infer<typeof CollectionWithPreviewSchema>;
export type CollectionMetrics = z.infer<typeof CollectionMetricsSchema>;
export type CollectionOffer = z.infer<typeof CollectionOfferSchema>;
export type CollectionOfferInfo = z.infer<typeof CollectionOfferInfoSchema>;
export type CollectionOfferItem = z.infer<typeof CollectionOfferItemSchema>;
export type UserActionNft = z.infer<typeof UserActionNftSchema>;
export type UserActionOffer = z.infer<typeof UserActionOfferSchema>;
export type UserActionCollectionOffer = z.infer<typeof UserActionCollectionOfferSchema>;
export type AnonymizedUserAction = z.infer<typeof AnonymizedUserActionSchema>;
export type DetailedUserAction = z.infer<typeof DetailedUserActionSchema>;
export type BuyDetail = z.infer<typeof BuyDetailSchema>;
export type NftPriceDetail = z.infer<typeof NftPriceDetailSchema>;
export type PurchaseResult = z.infer<typeof PurchaseResultSchema>;
export type InvalidNftDetail = z.infer<typeof InvalidNftDetailSchema>;
export type UpdatedNftDetail = z.infer<typeof UpdatedNftDetailSchema>;
export type BulkListingFailedNft = z.infer<typeof BulkListingFailedNftSchema>;
export type TransferFailedItem = z.infer<typeof TransferFailedItemSchema>;
export type TransferRecipientInfo = z.infer<typeof TransferRecipientInfoSchema>;
export type WithdrawalStatus = z.infer<typeof WithdrawalStatusSchema>;
export type TonWithdrawalStatusItem = z.infer<typeof TonWithdrawalStatusItemSchema>;
export type AttributeFloorInfo = z.infer<typeof AttributeFloorInfoSchema>;

// ── Requests ──

export type CreateOfferRequest = z.infer<typeof CreateOfferRequestSchema>;
export type CancelOfferRequest = z.infer<typeof CancelOfferRequestSchema>;
export type AcceptOfferRequest = z.infer<typeof AcceptOfferRequestSchema>;
export type BuyPartialRequest = z.infer<typeof BuyPartialRequestSchema>;
export type BulkListRequest = z.infer<typeof BulkListRequestSchema>;
export type BulkDelistRequest = z.infer<typeof BulkDelistRequestSchema>;
export type ListForSaleRequest = z.infer<typeof ListForSaleRequestSchema>;
export type TransferGiftsRequest = z.infer<typeof TransferGiftsRequestSchema>;
export type WithdrawGiftsRequest = z.infer<typeof WithdrawGiftsRequestSchema>;
export type WithdrawTonRequest = z.infer<typeof WithdrawTonRequestSchema>;

// ── Responses ──

export type CreateOfferResponse = z.infer<typeof CreateOfferResponseSchema>;
export type FetchOfferCollectionsResponse = z.infer<typeof FetchOfferCollectionsResponseSchema>;
export type FetchTopOffersResponse = z.infer<typeof FetchTopOffersResponseSchema>;
export type TopCollectionOfferResponse = z.infer<typeof TopCollectionOfferResponseSchema>;
export type AttributeFloorsResponse = z.infer<typeof AttributeFloorsResponseSchema>;
export type BackdropFloorsResponse = z.infer<typeof BackdropFloorsResponseSchema>;
export type ModelBackgroundFloorsResponse = z.infer<typeof ModelBackgroundFloorsResponseSchema>;
export type CollectionsPreviewResponse = z.infer<typeof CollectionsPreviewResponseSchema>;
export type CollectionMetricsResponse = z.infer<typeof CollectionMetricsResponseSchema>;
export type GenerateDepositIdResponse = z.infer<typeof GenerateDepositIdResponseSchema>;
export type MarketActionsResponse = z.infer<typeof MarketActionsResponseSchema>;
export type MarketConfigResponse = z.infer<typeof MarketConfigResponseSchema>;
export type BuyPartialResponse = z.infer<typeof BuyPartialResponseSchema>;
export type BulkListingResultResponse = z.infer<typeof BulkListingResultResponseSchema>;
export type OwnedNftsResponse = z.infer<typeof OwnedNftsResponseSchema>;
export type SearchNftsResponse = z.infer<typeof SearchNftsResponseSchema>;
export type NftStatsResponse = z.infer<typeof NftStatsResponseSchema>;
export type TransferGiftsResponse = z.infer<typeof TransferGiftsResponseSchema>;
export type WithdrawGiftsResponse = z.infer<typeof WithdrawGiftsResponseSchema>;
export type WithdrawalStatusesResponse = z.infer<typeof WithdrawalStatusesResponseSchema>;
export type CheckUserExistsResponse = z.infer<typeof CheckUserExistsResponseSchema>;
export type UserActionsResponse = z.infer<typeof UserActionsResponseSchema>;
export type WalletInfoResponse = z.infer<typeof WalletInfoResponseSchema>;
export type WithdrawTonResponse = z.infer<typeof WithdrawTonResponseSchema>;
export type WalletWithdrawalStatusesResponse = z.infer<typeof WalletWithdrawalStatusesResponseSchema>;

// ── Query Params ──

export interface NftSearchParams {
  collection_id?: string;
  collection_ids?: string[];
  ids?: string[];
  tg_ids?: string[];
  search?: string;
  status?: ListingStatus;
  sort_by?: SortByNfts;
  min_price?: string;
  max_price?: string;
  limit?: number;
  offset?: number;
  filter_by_models?: string[];
  filter_by_backdrops?: string[];
  filter_by_symbols?: string[];
  external_collection_number?: number;
  exclude_bundled?: boolean;
  is_owned?: boolean;
  is_crafted_status?: CraftedStatus;
  mint_status?: MintStatus;
  premarket_status?: PremarketFilterStatus;
  name_filter?: string;
  with_attributes?: boolean;
  with_attribute_floors?: boolean;
}

export interface MarketActionsParams {
  action_types?: MarketActionType[];
  collection_id?: string;
  collection_ids?: string[];
  filter_by_models?: string[];
  filter_by_backdrops?: string[];
  filter_by_symbols?: string[];
  search?: string;
  status?: ListingStatus;
  sort_by?: SortByActions;
  min_price?: string;
  max_price?: string;
  limit?: number;
  offset?: number;
  period?: Period;
  external_collection_number?: number;
}

export interface UserActionsParams {
  action_types?: MarketActionType[];
  collection_id?: string;
  collection_ids?: string[];
  filter_by_models?: string[];
  filter_by_backdrops?: string[];
  filter_by_symbols?: string[];
  search?: string;
  status?: ListingStatus;
  sort_by?: SortByActions;
  min_price?: string;
  max_price?: string;
  limit?: number;
  offset?: number;
  period?: Period;
  external_collection_number?: number;
}

export interface CollectionMetricsParams {
  group_by: string;
  from?: string;
  to?: string;
}

export interface CollectionsPreviewParams {
  sort_by?: CollectionSortBy;
  sort_order?: SortOrder;
}
