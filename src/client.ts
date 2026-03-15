import type { ZodType } from "zod";
import { Ok, Err, type Result } from "@pavelpotemkin/utils";
import {
  PortalsApiError,
  PortalsNetworkError,
  PortalsRateLimitError,
  PortalsValidationError,
  PortalsError,
} from "./errors";
import { RateLimiter } from "./rate-limiter";
import {
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
import type {
  CreateOfferRequest,
  CancelOfferRequest,
  AcceptOfferRequest,
  BuyPartialRequest,
  BulkListRequest,
  BulkDelistRequest,
  ListForSaleRequest,
  TransferGiftsRequest,
  WithdrawGiftsRequest,
  WithdrawTonRequest,
  CreateOfferResponse,
  FetchOfferCollectionsResponse,
  FetchTopOffersResponse,
  TopCollectionOfferResponse,
  AttributeFloorsResponse,
  BackdropFloorsResponse,
  ModelBackgroundFloorsResponse,
  CollectionsPreviewResponse,
  CollectionMetricsResponse,
  GenerateDepositIdResponse,
  MarketActionsResponse,
  MarketConfigResponse,
  BuyPartialResponse,
  BulkListingResultResponse,
  OwnedNftsResponse,
  SearchNftsResponse,
  NftStatsResponse,
  TransferGiftsResponse,
  WithdrawGiftsResponse,
  WithdrawalStatusesResponse,
  CheckUserExistsResponse,
  UserActionsResponse,
  WalletInfoResponse,
  WithdrawTonResponse,
  WalletWithdrawalStatusesResponse,
  NftSearchParams,
  MarketActionsParams,
  UserActionsParams,
  CollectionMetricsParams,
  CollectionsPreviewParams,
} from "./types";

const DEFAULT_BASE_URL = "https://portal-market.com";

export interface PortalsClientConfig {
  token: string;
  baseUrl?: string;
  fetch?: typeof globalThis.fetch;
  /** Включить in-memory rate limiting (default: true) */
  rateLimiting?: boolean;
}

interface EndpointRateLimit {
  key: string;
  limit: number;
}

const GLOBAL_RATE_LIMIT = 25;

export class PortalsMarketClient {
  private readonly token: string;
  private readonly baseUrl: string;
  private readonly fetch: typeof globalThis.fetch;
  private readonly rateLimiting: boolean;
  private readonly rateLimiter: RateLimiter;

  constructor(config: PortalsClientConfig) {
    if (!config.token) {
      throw new Error("PortalsMarketClient: token is required");
    }
    this.token = config.token;
    this.baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.fetch = config.fetch ?? globalThis.fetch.bind(globalThis);
    this.rateLimiting = config.rateLimiting ?? true;
    this.rateLimiter = new RateLimiter();
  }

  // ── Collection Offers ──

  /**
   * Создать оффер на покупку NFT из коллекции.
   * Средства будут заморожены до принятия или отмены оффера.
   */
  async createCollectionOffer(
    body: CreateOfferRequest,
  ): Promise<Result<CreateOfferResponse, PortalsError>> {
    return this.post(
      "/partners/collection-offers/",
      CreateOfferRequestSchema,
      body,
      CreateOfferResponseSchema,
    );
  }

  /**
   * Отменить свой оффер на коллекцию и вернуть замороженные средства.
   */
  async cancelCollectionOffer(
    body: CancelOfferRequest,
  ): Promise<Result<void, PortalsError>> {
    return this.postNoContent(
      "/partners/collection-offers/cancel",
      CancelOfferRequestSchema,
      body,
    );
  }

  /**
   * Принять оффер, предоставив NFT ID для продажи.
   * NFT должны принадлежать коллекции оффера.
   */
  async acceptCollectionOffer(
    offerId: string,
    body: AcceptOfferRequest,
  ): Promise<Result<void, PortalsError>> {
    return this.postNoContent(
      `/partners/collection-offers/${encodeURIComponent(offerId)}/accept`,
      AcceptOfferRequestSchema,
      body,
    );
  }

  /**
   * Получить список коллекций, которые поддерживают офферы на коллекцию.
   */
  async getOfferCollections(): Promise<
    Result<FetchOfferCollectionsResponse, PortalsError>
  > {
    return this.get(
      "/partners/collection-offers/collections",
      FetchOfferCollectionsResponseSchema,
    );
  }

  /**
   * Получить лучший активный оффер для коллекции.
   * Rate limit: 10 req/s (можно увеличить по запросу).
   */
  async getTopCollectionOffer(
    collectionId: string,
  ): Promise<Result<TopCollectionOfferResponse, PortalsError>> {
    return this.get(
      `/partners/collection-offers/${encodeURIComponent(collectionId)}/top`,
      TopCollectionOfferResponseSchema,
      undefined,
      { key: "collection-offers/top", limit: 10 },
    );
  }

  /**
   * Получить топ активных офферов для коллекции, отсортированных по сумме (убывание).
   * Rate limit: 10 req/s (можно увеличить по запросу).
   */
  async getAllCollectionOffers(
    collectionId: string,
    params?: { limit?: number },
  ): Promise<Result<FetchTopOffersResponse, PortalsError>> {
    return this.get(
      `/partners/collection-offers/${encodeURIComponent(collectionId)}/all`,
      FetchTopOffersResponseSchema,
      params,
      { key: "collection-offers/all", limit: 10 },
    );
  }

  // ── Collection Filters ──

  /**
   * Получить минимальные цены для всех уникальных атрибутов моделей по коллекциям.
   * Rate limit: 5 req/s.
   */
  async getAttributeFloors(): Promise<
    Result<AttributeFloorsResponse, PortalsError>
  > {
    return this.get(
      "/partners/collections/attribute-floors",
      AttributeFloorsResponseSchema,
      undefined,
      { key: "collections/attribute-floors", limit: 5 },
    );
  }

  /**
   * Получить минимальные цены листинга, сгруппированные по типу бэкграунда.
   * Rate limit: 2 req/s.
   */
  async getBackdropFloors(): Promise<
    Result<BackdropFloorsResponse, PortalsError>
  > {
    return this.get(
      "/partners/collections/backdrops/floors",
      BackdropFloorsResponseSchema,
      undefined,
      { key: "collections/backdrops/floors", limit: 2 },
    );
  }

  /**
   * Получить минимальные цены листинга для каждой коллекции.
   * Rate limit: 9 req/s.
   */
  async getCollectionFloors(): Promise<
    Result<BackdropFloorsResponse, PortalsError>
  > {
    return this.get(
      "/partners/collections/floors",
      BackdropFloorsResponseSchema,
      undefined,
      { key: "collections/floors", limit: 9 },
    );
  }

  /**
   * Получить минимальные цены листинга бэкграундов для указанных моделей.
   * Rate limit: 3 req/s.
   * @param models Список имён моделей через запятую.
   */
  async getModelBackgroundFloors(
    models: string[],
  ): Promise<Result<ModelBackgroundFloorsResponse, PortalsError>> {
    return this.get(
      "/partners/collections/models/backgrounds/floors",
      ModelBackgroundFloorsResponseSchema,
      { models: models.join(",") },
      { key: "collections/models/backgrounds/floors", limit: 3 },
    );
  }

  // ── Collections ──

  /**
   * Получить все коллекции с превью-изображениями и базовой информацией.
   * Без пагинации.
   */
  async getCollectionsPreview(
    params?: CollectionsPreviewParams,
  ): Promise<Result<CollectionsPreviewResponse, PortalsError>> {
    return this.get(
      "/partners/collections/preview",
      CollectionsPreviewResponseSchema,
      params,
    );
  }

  /**
   * Получить историческую метрику коллекции: объём и средние цены.
   * Rate limit: 8 req/s.
   */
  async getCollectionMetrics(
    collectionId: string,
    params: CollectionMetricsParams,
  ): Promise<Result<CollectionMetricsResponse, PortalsError>> {
    return this.get(
      `/partners/collections/${encodeURIComponent(collectionId)}/metrics`,
      CollectionMetricsResponseSchema,
      params,
      { key: "collections/metrics", limit: 8 },
    );
  }

  // ── Deposit ──

  /**
   * Сгенерировать уникальный deposit ID для TON-депозитов.
   * Используйте этот ID в memo транзакции.
   */
  async generateDepositId(): Promise<
    Result<GenerateDepositIdResponse, PortalsError>
  > {
    return this.postEmpty(
      "/partners/deposits",
      GenerateDepositIdResponseSchema,
    );
  }

  // ── Market ──

  /**
   * Получить недавние действия маркета (покупки, продажи, листинги и т.д.)
   * с опциональными фильтрами.
   */
  async getMarketActions(
    params?: MarketActionsParams,
  ): Promise<Result<MarketActionsResponse, PortalsError>> {
    return this.get(
      "/partners/market/actions/",
      MarketActionsResponseSchema,
      params,
    );
  }

  /**
   * Получить конфигурацию маркета: комиссия, кошелёк для депозитов, курс TON/USDT.
   */
  async getMarketConfig(): Promise<
    Result<MarketConfigResponse, PortalsError>
  > {
    return this.get("/partners/market/config", MarketConfigResponseSchema);
  }

  // ── NFTs ──

  /**
   * Купить несколько NFT с поддержкой частичной покупки.
   * Если часть NFT невалидна или недоступна — остальные всё равно будут куплены.
   */
  async buyNfts(
    body: BuyPartialRequest,
  ): Promise<Result<BuyPartialResponse, PortalsError>> {
    return this.post(
      "/partners/nfts",
      BuyPartialRequestSchema,
      body,
      BuyPartialResponseSchema,
    );
  }

  /**
   * Массовый листинг NFT на продажу с индивидуальными ценами.
   */
  async bulkListNfts(
    body: BulkListRequest,
  ): Promise<Result<BulkListingResultResponse, PortalsError>> {
    return this.post(
      "/partners/nfts/bulk-list",
      BulkListRequestSchema,
      body,
      BulkListingResultResponseSchema,
    );
  }

  /**
   * Массово снять NFT с продажи.
   */
  async bulkUnlistNfts(
    body: BulkDelistRequest,
  ): Promise<Result<BulkListingResultResponse, PortalsError>> {
    return this.post(
      "/partners/nfts/bulk-unlist",
      BulkDelistRequestSchema,
      body,
      BulkListingResultResponseSchema,
    );
  }

  /**
   * Получить NFT, принадлежащие авторизованному пользователю, с фильтрами.
   * Rate limit: 6 req/s.
   */
  async getOwnedNfts(
    params?: NftSearchParams,
  ): Promise<Result<OwnedNftsResponse, PortalsError>> {
    return this.get(
      "/partners/nfts/owned",
      OwnedNftsResponseSchema,
      params,
      { key: "nfts/owned", limit: 6 },
    );
  }

  /**
   * Поиск NFT по имени, ценовому диапазону и атрибутам.
   * Rate limit: 15 req/s (можно увеличить по запросу).
   */
  async searchNfts(
    params?: NftSearchParams,
  ): Promise<Result<SearchNftsResponse, PortalsError>> {
    return this.get(
      "/partners/nfts/search",
      SearchNftsResponseSchema,
      params,
      { key: "nfts/search", limit: 15 },
    );
  }

  /**
   * Получить статистику NFT пользователя: количество залистенных и незалистенных.
   */
  async getNftStats(): Promise<Result<NftStatsResponse, PortalsError>> {
    return this.get("/partners/nfts/stats", NftStatsResponseSchema);
  }

  /**
   * Передать NFT (гифты) другому пользователю по username или Telegram ID.
   * Поддерживает анонимную передачу (без уведомления).
   */
  async transferGifts(
    body: TransferGiftsRequest,
  ): Promise<Result<TransferGiftsResponse, PortalsError>> {
    return this.post(
      "/partners/nfts/transfer",
      TransferGiftsRequestSchema,
      body,
      TransferGiftsResponseSchema,
    );
  }

  /**
   * Вывести NFT-гифты на аккаунт Telegram пользователя.
   * Возвращает ID вывода для отслеживания статуса.
   */
  async withdrawGifts(
    body: WithdrawGiftsRequest,
  ): Promise<Result<WithdrawGiftsResponse, PortalsError>> {
    return this.post(
      "/partners/nfts/withdraw",
      WithdrawGiftsRequestSchema,
      body,
      WithdrawGiftsResponseSchema,
    );
  }

  /**
   * Проверить статус ожидающих или завершённых выводов гифтов.
   * @param ids Массив ID выводов.
   */
  async getWithdrawalStatuses(
    ids: number[],
  ): Promise<Result<WithdrawalStatusesResponse, PortalsError>> {
    return this.get(
      "/partners/nfts/withdrawals/statuses",
      WithdrawalStatusesResponseSchema,
      { ids: ids.join(",") },
    );
  }

  /**
   * Выставить одну NFT на продажу по указанной цене.
   */
  async listNft(
    nftId: string,
    body: ListForSaleRequest,
  ): Promise<Result<void, PortalsError>> {
    return this.postNoContent(
      `/partners/nfts/${encodeURIComponent(nftId)}/list`,
      ListForSaleRequestSchema,
      body,
    );
  }

  /**
   * Снять одну NFT с продажи.
   */
  async unlistNft(nftId: string): Promise<Result<void, PortalsError>> {
    return this.postNoContent(
      `/partners/nfts/${encodeURIComponent(nftId)}/unlist`,
      null,
      null,
    );
  }

  // ── Users ──

  /**
   * Проверить существование пользователя по Telegram ID.
   */
  async checkUserExists(
    userId: number,
  ): Promise<Result<CheckUserExistsResponse, PortalsError>> {
    return this.get(
      `/partners/users/${encodeURIComponent(String(userId))}`,
      CheckUserExistsResponseSchema,
    );
  }

  /**
   * Получить действия авторизованного партнёрского пользователя
   * (покупки, продажи, листинги и т.д.). Полезно для отслеживания продажи гифтов.
   */
  async getUserActions(
    params?: UserActionsParams,
  ): Promise<Result<UserActionsResponse, PortalsError>> {
    return this.get(
      "/partners/users/actions",
      UserActionsResponseSchema,
      params,
    );
  }

  // ── Wallets ──

  /**
   * Получить баланс кошелька и адрес для депозита авторизованного пользователя.
   */
  async getWalletInfo(): Promise<Result<WalletInfoResponse, PortalsError>> {
    return this.get("/partners/users/wallets/", WalletInfoResponseSchema);
  }

  /**
   * Вывести TON-баланс на внешний кошелёк.
   */
  async withdrawTon(
    body: WithdrawTonRequest,
  ): Promise<Result<WithdrawTonResponse, PortalsError>> {
    return this.post(
      "/partners/users/wallets/withdraw",
      WithdrawTonRequestSchema,
      body,
      WithdrawTonResponseSchema,
    );
  }

  /**
   * Проверить статус ожидающих или завершённых выводов TON.
   * @param ids Массив ID выводов.
   */
  async getWalletWithdrawalStatuses(
    ids: string[],
  ): Promise<Result<WalletWithdrawalStatusesResponse, PortalsError>> {
    return this.get(
      "/partners/users/wallets/withdrawals/statuses",
      WalletWithdrawalStatusesResponseSchema,
      { ids: ids.join(",") },
    );
  }

  // ── Internal helpers ──

  private serializeParams(
    params: Record<string, unknown> | object,
  ): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(
      params as Record<string, unknown>,
    )) {
      if (value === undefined || value === null) continue;
      if (Array.isArray(value)) {
        result[key] = value.join(",");
      } else {
        result[key] = String(value);
      }
    }
    return result;
  }

  private buildUrl(path: string, query?: Record<string, string>): string {
    const url = new URL(path, this.baseUrl);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== "") {
          url.searchParams.set(key, value);
        }
      }
    }
    return url.toString();
  }

  private checkRateLimit(
    path: string,
    endpointLimit?: EndpointRateLimit,
  ): PortalsRateLimitError | null {
    if (!this.rateLimiting) return null;

    if (endpointLimit) {
      const result = this.rateLimiter.check(
        endpointLimit.key,
        endpointLimit.limit,
      );
      if (!result.allowed) {
        return new PortalsRateLimitError({
          endpoint: path,
          limit: endpointLimit.limit,
          retryAfterMs: result.retryAfterMs,
        });
      }
    }

    const globalResult = this.rateLimiter.check(
      "__global__",
      GLOBAL_RATE_LIMIT,
    );
    if (!globalResult.allowed) {
      return new PortalsRateLimitError({
        endpoint: path,
        limit: GLOBAL_RATE_LIMIT,
        retryAfterMs: globalResult.retryAfterMs,
      });
    }

    return null;
  }

  private async get<T>(
    path: string,
    responseSchema: ZodType<T>,
    query?: Record<string, unknown> | object,
    rateLimit?: EndpointRateLimit,
  ): Promise<Result<T, PortalsError>> {
    const rateLimitErr = this.checkRateLimit(path, rateLimit);
    if (rateLimitErr) return Err(rateLimitErr);

    try {
      const url = this.buildUrl(
        path,
        query ? this.serializeParams(query) : undefined,
      );
      const res = await this.request(url, { method: "GET" });
      return this.parseResponse(res, path, responseSchema);
    } catch (err) {
      return Err(
        err instanceof PortalsError
          ? err
          : new PortalsNetworkError({
              cause: err instanceof Error ? err : new Error(String(err)),
              endpoint: path,
            }),
      );
    }
  }

  private async post<TReq, TRes>(
    path: string,
    requestSchema: ZodType<TReq>,
    body: TReq,
    responseSchema: ZodType<TRes>,
    rateLimit?: EndpointRateLimit,
  ): Promise<Result<TRes, PortalsError>> {
    const rateLimitErr = this.checkRateLimit(path, rateLimit);
    if (rateLimitErr) return Err(rateLimitErr);

    try {
      const validatedBody = requestSchema.parse(body);
      const url = this.buildUrl(path);
      const res = await this.request(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedBody),
      });
      return this.parseResponse(res, path, responseSchema);
    } catch (err) {
      return Err(
        err instanceof PortalsError
          ? err
          : new PortalsNetworkError({
              cause: err instanceof Error ? err : new Error(String(err)),
              endpoint: path,
            }),
      );
    }
  }

  private async postNoContent<TReq>(
    path: string,
    requestSchema: ZodType<TReq> | null,
    body: TReq | null,
    rateLimit?: EndpointRateLimit,
  ): Promise<Result<void, PortalsError>> {
    const rateLimitErr = this.checkRateLimit(path, rateLimit);
    if (rateLimitErr) return Err(rateLimitErr);

    try {
      const validatedBody =
        requestSchema && body ? requestSchema.parse(body) : undefined;
      const url = this.buildUrl(path);
      const init: RequestInit = { method: "POST" };
      if (validatedBody !== undefined) {
        init.headers = { "Content-Type": "application/json" };
        init.body = JSON.stringify(validatedBody);
      }
      const res = await this.request(url, init);
      if (!res.ok) {
        return Err(await this.buildApiError(res, path));
      }
      return Ok(undefined);
    } catch (err) {
      return Err(
        err instanceof PortalsError
          ? err
          : new PortalsNetworkError({
              cause: err instanceof Error ? err : new Error(String(err)),
              endpoint: path,
            }),
      );
    }
  }

  private async postEmpty<T>(
    path: string,
    responseSchema: ZodType<T>,
    rateLimit?: EndpointRateLimit,
  ): Promise<Result<T, PortalsError>> {
    const rateLimitErr = this.checkRateLimit(path, rateLimit);
    if (rateLimitErr) return Err(rateLimitErr);

    try {
      const url = this.buildUrl(path);
      const res = await this.request(url, { method: "POST" });
      return this.parseResponse(res, path, responseSchema);
    } catch (err) {
      return Err(
        err instanceof PortalsError
          ? err
          : new PortalsNetworkError({
              cause: err instanceof Error ? err : new Error(String(err)),
              endpoint: path,
            }),
      );
    }
  }

  private async request(url: string, init: RequestInit): Promise<Response> {
    const endpoint = new URL(url).pathname;
    try {
      return await this.fetch(url, {
        ...init,
        headers: {
          ...((init.headers as Record<string, string>) ?? {}),
          Authorization: `partners ${this.token}`,
        },
      });
    } catch (err) {
      throw new PortalsNetworkError({
        cause: err instanceof Error ? err : new Error(String(err)),
        endpoint,
      });
    }
  }

  private async parseResponse<T>(
    res: Response,
    path: string,
    schema: ZodType<T>,
  ): Promise<Result<T, PortalsError>> {
    if (!res.ok) {
      return Err(await this.buildApiError(res, path));
    }

    const json = await res.json();
    const parsed = schema.safeParse(json);

    if (!parsed.success) {
      return Err(
        new PortalsValidationError({
          zodError: parsed.error,
          endpoint: path,
          rawData: json,
        }),
      );
    }

    return Ok(parsed.data);
  }

  private async buildApiError(
    res: Response,
    path: string,
  ): Promise<PortalsApiError> {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = await res.text().catch(() => null);
    }
    return new PortalsApiError({
      status: res.status,
      statusText: res.statusText,
      body,
      endpoint: path,
    });
  }
}
