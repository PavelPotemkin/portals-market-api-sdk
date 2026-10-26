/**
 * Публичные имена типов. Сами типы генерируются из спеки в `generated.ts`
 * (там имена повторяют определения спеки); здесь — понятные имена для потребителей.
 */
import type * as G from "./generated";

// ── Модели ──

/** NFT в выдаче `searchNfts` и `getOwnedNfts` (`httpmodel.Nft`, есть `is_owned`). */
export type Nft = G.HttpmodelNft;
/** NFT внутри других объектов: покупка, премаркет (`model.Nft`, без `is_owned`). */
export type NftModel = G.ModelNft;
export type NftAttribute = G.NftAttribute;
export type User = G.User;
export type BundleNftDetails = G.BundleNftDetails;
export type BundleNft = G.BundleNft;
export type BundleExtended = G.BundleExtended;
export type PremarketOrder = G.PremarketOrder;
/** Цены по имени атрибута: имя → цена строкой. */
export type AttributeFloorPrices = G.AttributeFloorPrices;
export type AttributeFloorsMap = G.AttributeFloorsMap;
export type AttributeFloorInfo = G.AttributeFloorInfo;
/** Флоры атрибутов по коллекциям: коллекция → { models, backdrops, symbols }. */
export type CollectionAttrFloorPrices = G.FetchCollectionAttrFloorPricesOut;
export type Collection = G.Collection;
export type CollectionAsset = G.CollectionAsset;
export type CollectionWithPreview = G.CollectionWithPreview;
export type CollectionMetrics = G.CollectionMetrics;
/** Коллекция в оффере на коллекцию (`dtocollectionoffers.CollectionInfo`). */
export type CollectionOfferInfo = G.CollectionInfo;
/** Оффер на коллекцию в выдаче `/top` и `/all`. */
export type CollectionOfferItem = G.CollectionOfferItem;
/** Лучший оффер коллекции (`getTopCollectionOffer`). */
export type TopOffer = G.CollectionOfferItem;
/** Атрибуты trait-оффера; пустой или отсутствующий scope — оффер на всю коллекцию. */
export type CollectionOfferScope = G.CollectionOfferScope;
export type CreateOfferAttribute = G.CreateOfferAttribute;
export type BulkUpdateOfferItem = G.BulkUpdateOfferItem;
export type BulkUpdateFailedItem = G.UpdateBatchFailedItem;
export type UserActionNft = G.UserActionNft;
export type UserActionOffer = G.UserActionOffer;
export type UserActionCollectionOffer = G.UserActionCollectionOffer;
export type AnonymizedUserAction = G.AnonymizedUserAction;
export type DetailedUserAction = G.DetailedUserAction;
export type BuyDetail = G.BuyDetail;
export type NftPriceDetail = G.NftPriceDetail;
export type PurchaseResult = G.PurchaseResult;
export type InvalidNftDetail = G.InvalidNftDetail;
export type UpdatedNftDetail = G.UpdatedNftDetail;
export type BulkListingFailedNft = G.FailedNft;
export type TransferFailedItem = G.TransferFailedItem;
export type TransferRecipientInfo = G.TransferRecipientInfo;
/** Статус вывода гифта. */
export type WithdrawalStatus = G.WithdrawalStatus;
/** Статус вывода TON. */
export type TonWithdrawalStatusItem = G.FetchStatusByIdOut;
/** Комната Arena с текущей игрой. */
export type ArenaRoom = G.ArenaRoom;
/** Текущая игра комнаты Arena: статус, отсчёт, банк и ставки по порядку. */
export type ArenaGame = G.ArenaGame;
/** Ставка в игре Arena; `mine` — ставка владельца ключа. */
export type ArenaBet = G.ArenaBet;
/** Свой гифт с оценкой Arena (`price`), как в инвентаре Arena мини-аппа. */
export type ArenaInventoryItem = G.ArenaInventoryItem;
export type ArenaInventoryAttribute = G.ArenaInventoryAttr;
/** Бонус за депозит на NFT. */
export type NftDepositBonus = G.NftDepositBonus;
/** Тело ошибки бэкенда (`exerr.HttpError`). */
export type ApiErrorBody = G.HttpError;

// ── Запросы ──

export type CreateOfferRequest = G.CreateOfferRequest;
export type CancelOfferRequest = G.CancelOfferRequest;
export type AcceptOfferRequest = G.AcceptOfferRequest;
export type BulkUpdateOffersRequest = G.BulkUpdateOffersRequest;
export type BuyPartialRequest = G.BuyPartialIn;
export type BulkListRequest = G.BulkListForSaleIn;
export type BulkDelistRequest = G.BulkDelistIn;
export type ListForSaleRequest = G.ListForSaleIn;
/** Передача гифтов: получатель задаётся ровно одним из `recipient` или `recipient_token`. */
export type TransferGiftsRequest = Omit<G.TransferGiftsIn, "recipient" | "recipient_token"> &
  (
    | {
        /** Username или Telegram ID получателя. */
        recipient: string;
        recipient_token?: never;
      }
    | {
        /** Токен получателя из пользовательского `/nfts/transfer-gifts/recipients`. */
        recipient_token: string;
        recipient?: never;
      }
  );
export type WithdrawGiftsRequest = G.WithdrawGiftsIn;
export type WithdrawTonRequest = G.WithdrawIn;
/** Ставка Arena: `bet_type: "ton"` с `amount` или `bet_type: "gift"` с `gift_ids` (1–50). */
export type ArenaBetRequest = Omit<G.ArenaBetRequest, "bet_type" | "amount" | "gift_ids"> &
  (
    | {
        bet_type: "ton";
        /** Сумма ставки TON строкой. */
        amount: string;
        gift_ids?: never;
      }
    | {
        bet_type: "gift";
        /** ID своих гифтов. */
        gift_ids: string[];
        amount?: never;
      }
  );

// ── Ответы ──

export type CreateOfferResponse = G.CreateOfferResponse;
export type BulkUpdateOffersResponse = G.UpdateBatchOut;
export type FetchOfferCollectionsResponse = G.FetchCollectionsOut;
export type FetchTopOffersResponse = G.FetchTopOut;
export type AttributeFloorsResponse = G.FetchAllUniqueAttributeFloorsOut;
/** `getBackdropFloors`: фон → минимальная цена. */
export type BackdropFloorsResponse = G.FetchBackgroundFloorPricesOut;
/** `getCollectionFloors`: коллекция → минимальная цена (та же форма, что у бэкдропов). */
export type CollectionFloorsResponse = G.FetchBackgroundFloorPricesOut;
export type ModelBackgroundFloorsResponse = G.FetchModelsBackgroundsFloorPricesOut;
export type CollectionsPreviewResponse = G.FetchAllCollectionsWithPreviewOut;
export type CollectionMetricsResponse = G.FetchCollectionMetricsOut;
export type GenerateDepositIdResponse = G.GenerateDepositIdOut;
export type MarketActionsResponse = G.FetchAllUserActionsOut;
export type MarketConfigResponse = G.GeneralOut;
export type BuyPartialResponse = G.BuyPartialOut;
export type BulkListingResultResponse = G.BulkListingResult;
export type OwnedNftsResponse = G.FetchOwnedOut;
export type SearchNftsResponse = G.SearchNftsOut;
export type NftStatsResponse = G.FetchUserStatsOut;
export type TransferGiftsResponse = G.TransferGiftsOut;
export type WithdrawGiftsResponse = G.WithdrawGiftsOut;
export type WithdrawalStatusesResponse = G.WithdrawalStatusesOut;
export type CheckUserExistsResponse = G.CheckExistenceOut;
export type UserActionsResponse = G.FetchUserActionsOut;
export type WalletInfoResponse = G.InfoOut;
export type WithdrawTonResponse = G.WithdrawOut;
export type WalletWithdrawalStatusesResponse = G.WithdrawStatusOut;
export type ArenaStateResponse = G.ArenaStateResponse;
export type ArenaBetResponse = G.ArenaBetResponse;
export type ArenaInventoryResponse = G.ArenaInventoryResponse;

// ── Query-параметры ──

export type NftSearchParams = G.GetNftsSearchQuery;
export type OwnedNftsParams = G.GetNftsOwnedQuery;
export type MarketActionsParams = G.GetMarketActionsQuery;
export type UserActionsParams = G.GetUsersActionsQuery;
export type CollectionMetricsParams = G.GetCollectionsMetricsQuery;
export type CollectionsPreviewParams = G.GetCollectionsPreviewQuery;
export type AllCollectionOffersParams = G.GetCollectionOffersAllQuery;
export type TopCollectionOfferParams = G.GetCollectionOffersTopQuery;
export type ArenaInventoryParams = G.GetArenaInventoryQuery;
