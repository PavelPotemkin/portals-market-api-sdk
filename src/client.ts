import type { PortalsError } from "./errors";
import {
  getAllOwnedNfts,
  iterateOwnedNfts,
  iterateSearchNfts,
  type NftPage,
  type OwnedPortfolio,
  type OwnedPortfolioOptions,
  type OwnedPortfolioParams,
  type PageOptions,
} from "./pagination";
import type { Result } from "./result";
import { type PortalsClientConfig, type RequestOptions, Transport } from "./transport";
import type {
  AcceptOfferRequest,
  AllCollectionOffersParams,
  AttributeFloorsResponse,
  BackdropFloorsResponse,
  BulkDelistRequest,
  BulkListingResultResponse,
  BulkListRequest,
  BulkUpdateOffersRequest,
  BulkUpdateOffersResponse,
  BuyPartialRequest,
  BuyPartialResponse,
  CancelOfferRequest,
  CheckUserExistsResponse,
  CollectionFloorsResponse,
  CollectionMetricsParams,
  CollectionMetricsResponse,
  CollectionsPreviewParams,
  CollectionsPreviewResponse,
  CreateOfferRequest,
  CreateOfferResponse,
  FetchOfferCollectionsResponse,
  FetchTopOffersResponse,
  GenerateDepositIdResponse,
  ListForSaleRequest,
  MarketActionsParams,
  MarketActionsResponse,
  MarketConfigResponse,
  ModelBackgroundFloorsResponse,
  NftSearchParams,
  NftStatsResponse,
  OwnedNftsParams,
  OwnedNftsResponse,
  SearchNftsResponse,
  TopCollectionOfferParams,
  TopOffer,
  TransferGiftsRequest,
  TransferGiftsResponse,
  UserActionsParams,
  UserActionsResponse,
  WalletInfoResponse,
  WalletWithdrawalStatusesResponse,
  WithdrawalStatusesResponse,
  WithdrawGiftsRequest,
  WithdrawGiftsResponse,
  WithdrawTonRequest,
  WithdrawTonResponse,
} from "./types";

type R<T> = Promise<Result<T, PortalsError>>;

/**
 * Клиент Portals Market Partner API.
 *
 * Методы никогда не бросают исключений: результат — `Result<T, PortalsError>`.
 * Необратимые операции (`buyNfts`, `withdrawGifts`, `withdrawTon`, `transferGifts`,
 * `acceptCollectionOffer`, `createCollectionOffer`) не повторяются автоматически.
 */
export class PortalsMarketClient {
  private readonly transport: Transport;

  constructor(config: PortalsClientConfig) {
    this.transport = new Transport(config);
  }

  // ── Collection Offers ──

  /**
   * Создать оффер на покупку NFT из коллекции. Средства замораживаются до принятия или отмены.
   * `attributes` делают trait-оффер; пока trait-офферы выключены, бэкенд отвечает 403.
   * Необратимая операция: не повторяется на 429.
   */
  createCollectionOffer(
    body: CreateOfferRequest,
    options?: RequestOptions,
  ): R<CreateOfferResponse> {
    return this.transport.call("postCollectionOffers", { body }, options);
  }

  /**
   * Обновить до 50 своих офферов. Элементы обрабатываются независимо: результат по каждому
   * в `updated` / `failed`. Увеличение `max_nfts` списывает комиссию за добавленные слоты.
   * Rate limit: 2 req/s.
   */
  bulkUpdateCollectionOffers(
    body: BulkUpdateOffersRequest,
    options?: RequestOptions,
  ): R<BulkUpdateOffersResponse> {
    return this.transport.call("postCollectionOffersBulkUpdate", { body }, options);
  }

  /** Отменить свой оффер на коллекцию и вернуть замороженные средства. */
  cancelCollectionOffer(body: CancelOfferRequest, options?: RequestOptions): R<void> {
    return this.transport.call("postCollectionOffersCancel", { body }, options);
  }

  /**
   * Принять оффер, продав NFT из его коллекции. `amount` должен совпадать с ценой оффера.
   * Необратимая операция: не повторяется на 429.
   */
  acceptCollectionOffer(
    offerId: string,
    body: AcceptOfferRequest,
    options?: RequestOptions,
  ): R<void> {
    return this.transport.call(
      "postCollectionOffersAccept",
      { pathParams: { offer_id: offerId }, body },
      options,
    );
  }

  /** Коллекции, поддерживающие офферы на коллекцию. */
  getOfferCollections(options?: RequestOptions): R<FetchOfferCollectionsResponse> {
    return this.transport.call("getCollectionOffersCollections", {}, options);
  }

  /**
   * Лучший активный оффер коллекции или `null`, если офферов нет.
   * `scope`: `broad` — только офферы на всю коллекцию, `trait` — только trait-офферы.
   * Rate limit: 10 req/s.
   */
  getTopCollectionOffer(
    collectionId: string,
    params?: TopCollectionOfferParams,
    options?: RequestOptions,
  ): R<TopOffer | null> {
    return this.transport.call(
      "getCollectionOffersTop",
      { pathParams: { collection_id: collectionId }, query: params },
      options,
    );
  }

  /**
   * До 10 лучших активных офферов коллекции по убыванию суммы. Rate limit: 10 req/s.
   */
  getAllCollectionOffers(
    collectionId: string,
    params?: AllCollectionOffersParams,
    options?: RequestOptions,
  ): R<FetchTopOffersResponse> {
    return this.transport.call(
      "getCollectionOffersAll",
      { pathParams: { collection_id: collectionId }, query: params },
      options,
    );
  }

  // ── Collection Filters ──

  /** Минимальные цены уникальных атрибутов по коллекциям. Rate limit: 5 req/s. */
  getAttributeFloors(options?: RequestOptions): R<AttributeFloorsResponse> {
    return this.transport.call("getCollectionsAttributeFloors", {}, options);
  }

  /** Минимальные цены листинга по фонам. Rate limit: 2 req/s. */
  getBackdropFloors(options?: RequestOptions): R<BackdropFloorsResponse> {
    return this.transport.call("getCollectionsBackdropsFloors", {}, options);
  }

  /** Минимальные цены листинга по коллекциям. Rate limit: 9 req/s. */
  getCollectionFloors(options?: RequestOptions): R<CollectionFloorsResponse> {
    return this.transport.call("getCollectionsFloors", {}, options);
  }

  /**
   * Минимальные цены фонов для указанных моделей. Rate limit: 3 req/s.
   * @param models Имена моделей; уходят через запятую.
   */
  getModelBackgroundFloors(
    models: string[],
    options?: RequestOptions,
  ): R<ModelBackgroundFloorsResponse> {
    return this.transport.call(
      "getCollectionsModelsBackgroundsFloors",
      { query: { models: models.length > 0 ? models.join(",") : undefined } },
      options,
    );
  }

  // ── Collections ──

  /** Все коллекции с превью и базовой информацией, без пагинации. */
  getCollectionsPreview(
    params?: CollectionsPreviewParams,
    options?: RequestOptions,
  ): R<CollectionsPreviewResponse> {
    return this.transport.call("getCollectionsPreview", { query: params }, options);
  }

  /** Историческая метрика коллекции: объём и средние цены. Rate limit: 8 req/s. */
  getCollectionMetrics(
    collectionId: string,
    params: CollectionMetricsParams,
    options?: RequestOptions,
  ): R<CollectionMetricsResponse> {
    return this.transport.call(
      "getCollectionsMetrics",
      { pathParams: { collection_id: collectionId }, query: params },
      options,
    );
  }

  // ── Deposit ──

  /** Сгенерировать deposit ID для memo TON-депозита. */
  generateDepositId(options?: RequestOptions): R<GenerateDepositIdResponse> {
    return this.transport.call("postDeposits", {}, options);
  }

  // ── Market ──

  /** Недавние действия маркета (покупки, продажи, листинги и т.д.) с фильтрами. */
  getMarketActions(
    params?: MarketActionsParams,
    options?: RequestOptions,
  ): R<MarketActionsResponse> {
    return this.transport.call("getMarketActions", { query: params }, options);
  }

  /** Настройки маркета: комиссия, кошелёк депозитов, курсы. */
  getMarketConfig(options?: RequestOptions): R<MarketConfigResponse> {
    return this.transport.call("getMarketConfig", {}, options);
  }

  // ── NFTs ──

  /**
   * Купить несколько NFT с частичной покупкой: невалидные NFT попадают в `invalid_nfts`,
   * остальные покупаются. Цена — точная строка из выдачи.
   *
   * Необратимая операция: не повторяется на 429, `retryable` у ошибок всегда `false`.
   * При `kind` `validation` покупка могла пройти — ответ лежит в `error.data`;
   * при `network`, `timeout`, `aborted`, `parse` и 5xx исход неизвестен — сверяйтесь
   * по `getUserActions` / `getOwnedNfts` до повтора.
   */
  buyNfts(body: BuyPartialRequest, options?: RequestOptions): R<BuyPartialResponse> {
    return this.transport.call("postNfts", { body }, options);
  }

  /** Массовый листинг NFT с индивидуальными ценами. */
  bulkListNfts(body: BulkListRequest, options?: RequestOptions): R<BulkListingResultResponse> {
    return this.transport.call("postNftsBulkList", { body }, options);
  }

  /** Массово снять NFT с продажи. */
  bulkUnlistNfts(body: BulkDelistRequest, options?: RequestOptions): R<BulkListingResultResponse> {
    return this.transport.call("postNftsBulkUnlist", { body }, options);
  }

  /**
   * Свои NFT с фильтрами. Rate limit: 6 req/s. Без `sort_by` страницы по offset перекрываются;
   * полный портфель — `getAllOwnedNfts`.
   */
  getOwnedNfts(params?: OwnedNftsParams, options?: RequestOptions): R<OwnedNftsResponse> {
    return this.transport.call("getNftsOwned", { query: params }, options);
  }

  /** Поиск NFT по имени, цене и атрибутам. Rate limit: 15 req/s. */
  searchNfts(params?: NftSearchParams, options?: RequestOptions): R<SearchNftsResponse> {
    return this.transport.call("getNftsSearch", { query: params }, options);
  }

  /** Количество своих залистенных и незалистенных NFT. */
  getNftStats(options?: RequestOptions): R<NftStatsResponse> {
    return this.transport.call("getNftsStats", {}, options);
  }

  /**
   * Передать NFT другому пользователю: ровно одно из `recipient` (username или Telegram ID)
   * или `recipient_token`. Необратимая операция: не повторяется на 429.
   */
  transferGifts(body: TransferGiftsRequest, options?: RequestOptions): R<TransferGiftsResponse> {
    return this.transport.call("postNftsTransfer", { body }, options);
  }

  /**
   * Вывести NFT-гифты в Telegram; возвращает ID выводов. Необратимая операция.
   */
  withdrawGifts(body: WithdrawGiftsRequest, options?: RequestOptions): R<WithdrawGiftsResponse> {
    return this.transport.call("postNftsWithdraw", { body }, options);
  }

  /** Статусы выводов гифтов по ID. */
  getWithdrawalStatuses(ids: number[], options?: RequestOptions): R<WithdrawalStatusesResponse> {
    return this.transport.call(
      "getNftsWithdrawalsStatuses",
      { query: { ids: ids.length > 0 ? ids : undefined } },
      options,
    );
  }

  /** Выставить одну NFT на продажу. */
  listNft(nftId: string, body: ListForSaleRequest, options?: RequestOptions): R<void> {
    return this.transport.call("postNftsList", { pathParams: { nft_id: nftId }, body }, options);
  }

  /** Снять одну NFT с продажи. */
  unlistNft(nftId: string, options?: RequestOptions): R<void> {
    return this.transport.call("postNftsUnlist", { pathParams: { nft_id: nftId } }, options);
  }

  // ── Users ──

  /** Существует ли пользователь с таким Telegram ID. */
  checkUserExists(userId: number, options?: RequestOptions): R<CheckUserExistsResponse> {
    return this.transport.call("getUsers", { pathParams: { user_id: userId } }, options);
  }

  /** Действия авторизованного партнёра: покупки, продажи, листинги и т.д. */
  getUserActions(params?: UserActionsParams, options?: RequestOptions): R<UserActionsResponse> {
    return this.transport.call("getUsersActions", { query: params }, options);
  }

  // ── Wallets ──

  /** Баланс кошелька: `balance`, `frozen_funds`, `premarket_funds` строками. */
  getWalletInfo(options?: RequestOptions): R<WalletInfoResponse> {
    return this.transport.call("getUsersWallets", {}, options);
  }

  /** Вывести TON на внешний кошелёк. Необратимая операция. */
  withdrawTon(body: WithdrawTonRequest, options?: RequestOptions): R<WithdrawTonResponse> {
    return this.transport.call("postUsersWalletsWithdraw", { body }, options);
  }

  /** Статусы выводов TON по ID. */
  getWalletWithdrawalStatuses(
    ids: string[],
    options?: RequestOptions,
  ): R<WalletWithdrawalStatusesResponse> {
    return this.transport.call(
      "getUsersWalletsWithdrawalsStatuses",
      { query: { ids: ids.length > 0 ? ids : undefined } },
      options,
    );
  }

  // ── Pagination ──

  /**
   * Постраничный обход `getOwnedNfts` с дедупликацией по `id`. Для одной коллекции без
   * `sort_by` сортирует по `external_collection_number asc` (детерминированно). Для полного
   * портфеля используйте `getAllOwnedNfts`.
   */
  iterateOwnedNfts(
    params?: OwnedNftsParams,
    options?: PageOptions,
  ): AsyncGenerator<Result<NftPage, PortalsError>, void, undefined> {
    return iterateOwnedNfts(this, params, options);
  }

  /** Постраничный обход `searchNfts`; правила как у `iterateOwnedNfts`. */
  iterateSearchNfts(
    params?: NftSearchParams,
    options?: PageOptions,
  ): AsyncGenerator<Result<NftPage, PortalsError>, void, undefined> {
    return iterateSearchNfts(this, params, options);
  }

  /** Полный список своих NFT с проверкой `total_count` до и после. */
  getAllOwnedNfts(
    params?: OwnedPortfolioParams,
    options?: OwnedPortfolioOptions,
  ): R<OwnedPortfolio> {
    return getAllOwnedNfts(this, params, options);
  }
}
