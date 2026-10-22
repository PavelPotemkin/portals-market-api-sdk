# Changelog

## 2.0.0

A rewrite on top of schemas generated from the current Partner API spec. Breaking: there are no 1.x
compatibility shims.

### Highlights

- Types and zod 4 schemas are generated from `spec/partners.swagger.json` (82 definitions, 32 operations) plus
  documented fixes in `spec/overrides.ts`. `npm test` fails if `src/generated.ts` is stale.
- All 32 operations are covered. New: `bulkUpdateCollectionOffers` (`POST /partners/collection-offers/bulk/update`).
- New request fields: `scope` (`broad` | `trait`) for `getTopCollectionOffer` / `getAllCollectionOffers`,
  `attributes` for `createCollectionOffer`, `statuses` for `searchNfts` / `getOwnedNfts`, `recipient_token` for
  `transferGifts`.
- Responses are tolerant: unknown fields are kept, unknown enum values are accepted, optional fields may be `null`.
  Fields that 1.x silently dropped are now available: offer `scope`, `fiat_*`, `lucky_buy_eligible`, `old_price`,
  `related_entity_*`, collection flags, user fields, error `code`.
- Methods never throw. One error class `PortalsError` with `kind`.
- Per-attempt timeout (default 30 s), `AbortSignal` on every call, 429 retries with `Retry-After` (seconds or
  HTTP-date), exponential backoff with jitter; irreversible operations are never retried.
- `getAllOwnedNfts` (full portfolio with `total_count` verification) and page iterators.
- Runtime dependency `@pavelpotemkin/utils` removed (it pulled `axios`, `form-data`, `follow-redirects` with known
  vulnerabilities). The only runtime dependency is `zod@^4`.

### Migration from 1.x

#### Package

| 1.x | 2.0 |
| --- | --- |
| `zod@^3` | `zod@^4`; exported schemas are zod 4 schemas |
| depends on `@pavelpotemkin/utils` | no dependency; `Result` helpers are exported by the SDK |
| no `engines` | `node >= 20` (any runtime with `fetch` works) |
| — | `sideEffects: false` |

#### Result

| 1.x | 2.0 |
| --- | --- |
| `Ok(value)` (function) | `ok(value)` |
| `Err(error)` (function) | `err(error)` |
| `OkType<T>`, `ErrType<E>` | `Ok<T>`, `Err<E>` (types only) |
| `Result<T, E = Error>`, `isOk`, `isErr`, `unwrap` | same names and shape `{ ok: true, value } \| { ok: false, error }`; default `E` is `PortalsError` |

#### Errors

| 1.x | 2.0 |
| --- | --- |
| `PortalsError` (base class from utils) | `PortalsError` — the only class, `kind` tells what happened |
| `PortalsApiError` | `PortalsError` with `kind: "http"` |
| `PortalsNetworkError` | `kind: "network"`, `"timeout"` or `"aborted"` |
| `PortalsValidationError` | `kind: "validation"` |
| `PortalsNetworkError` for invalid arguments (`ZodError` inside) | `kind: "request"`, `issues`, no request sent |
| `SyntaxError` **thrown** on a non-JSON 2xx body | `kind: "parse"` returned as `Err`, raw text in `body` |
| `error instanceof PortalsApiError` | `error.kind === "http"` |
| `apiError.body` (parsed JSON, `null` for non-JSON) | `error.data` (parsed JSON) and `error.body` (raw text, always kept) |
| `apiError.statusText` | part of `error.message` |
| `validationError.rawData` | `error.data` |
| `validationError.zodError` | `error.issues` |
| `endpoint` | `endpoint` (actual path) plus `method` |
| — | `code` (backend `exerr.HttpError.code`), `retryable`, `attempts` |
| `isRateLimited`, `isUnauthorized`, `isNotFound` | same getters |
| `isBadRequest`, `isValidationError`, `isServerError` | removed: check `error.status` (400, 422, ≥ 500) |
| README's `PortalsRateLimitError` / `retryAfterMs` | never existed; the limiter waits instead of failing |

#### Configuration and call options

| 1.x | 2.0 |
| --- | --- |
| `retryDelaySec` (pause without `Retry-After`, s) | `retry.baseDelayMs` (exponential backoff base, ms) |
| 3 retries on 429, fixed | `retry.maxRetries` (default 3), `retry.maxDelayMs` (default 30000) |
| no timeout | `timeoutMs` (default 30000, per attempt incl. body; `0` disables) |
| no cancellation | every method takes `options?: { signal?, timeoutMs? }` as the last argument |
| `baseUrl` path prefix silently dropped | prefix kept: `https://proxy/x/api` → `https://proxy/x/api/partners/…` |
| constructor throws `Error` on empty token | throws `TypeError` (also for invalid `baseUrl` or missing `fetch`) |

#### Retry behavior

| 1.x | 2.0 |
| --- | --- |
| every request, including `buyNfts`, retried on 429 | `buyNfts`, `withdrawGifts`, `withdrawTon`, `transferGifts`, `acceptCollectionOffer`, `createCollectionOffer` are never retried; their errors have `retryable: false` |
| `Retry-After` only in seconds | seconds or HTTP-date |
| retries bypassed the rate limiter | retries wait in the rate limiter again |
| — | `bulkUpdateCollectionOffers` limited to 2 req/s |

#### Methods

| 1.x | 2.0 |
| --- | --- |
| `getTopCollectionOffer(id)` → `TopCollectionOfferResponse`; `null` body → `PortalsValidationError` | `getTopCollectionOffer(id, { scope? }?, options?)` → `TopOffer \| null` |
| `getAllCollectionOffers(id, { limit? })` | `getAllCollectionOffers(id, { limit?, scope? }?, options?)` |
| `getCollectionFloors()` → `BackdropFloorsResponse` | → `CollectionFloorsResponse` (same shape) |
| `getOwnedNfts(params?: NftSearchParams)` | `getOwnedNfts(params?: OwnedNftsParams)` |
| `transferGifts({ recipient, nft_ids })` | exactly one of `recipient` / `recipient_token` (checked at runtime) |
| `listNft(id, { price? })` | `price` required |
| `getModelBackgroundFloors([])`, `getWithdrawalStatuses([])`, `getWalletWithdrawalStatuses([])` sent a request | return `kind: "request"` without a request |
| — | `bulkUpdateCollectionOffers(body)`, `iterateOwnedNfts`, `iterateSearchNfts`, `getAllOwnedNfts` |

All other method names and positional arguments are unchanged.

#### Enums

1.x TypeScript `enum`s became `const` objects with a string-literal type of the same name: `NftStatus.Listed` still
works, and a plain `"listed"` is now accepted where `NftStatus` is expected. Enum fields in **responses** are typed
`X | (string & {})` and accept unknown values.

| 1.x | 2.0 |
| --- | --- |
| `SortByNfts.CollectionNumberAsc` / `CollectionNumberDesc` | `SortByNfts.ExternalCollectionNumberAsc` / `ExternalCollectionNumberDesc` |
| `SortByNfts.RarityAsc` / `RarityDesc` | `SortByNfts.ModelRarityAsc` / `ModelRarityDesc` |
| `SortByActions.CollectionNumberAsc` / `CollectionNumberDesc` | `SortByActions.ExternalCollectionNumberAsc` / `ExternalCollectionNumberDesc` |
| `SortByActions.RarityAsc` / `RarityDesc` | `SortByActions.ModelRarityAsc` / `ModelRarityDesc` |
| `CollectionOfferStatus` | removed: the spec types offer `status` as a string |
| `InvalidNftReason` | adds `NftNotAvailable` |
| `UserActionType` | adds `LuckyBuyWin`, `LuckyBuyLoss`, `LootPackGram`, `LootPackPayout`, `LootPackTakeGift` |
| `MarketActionType` | adds `LuckyBuy`, `LootPack`, `LootPackTakeGift`, `LootPackGram`, `LootPackPayout` |
| — | new `CollectionOfferScopeType` (`broad`, `trait`), `WithdrawalStatusDetails` |

Unchanged: `BundleStatus`, `CollectionSortBy`, `CraftedStatus`, `ListingStatus`, `MintStatus`, `NftAttributeType`,
`NftImportSource`, `NftStatus`, `Period`, `PremarketFilterStatus`, `PremarketOrderStatus`, `SortOrder`,
`TonWithdrawalStatus`, `WithdrawalStatusValue`.

#### Types

| 1.x | 2.0 |
| --- | --- |
| `HttpNft` | `Nft` |
| `NftModel` | `NftModel` (`model.Nft`, nested in purchases and premarket orders) |
| `TopCollectionOfferResponse` | `TopOffer` (= `CollectionOfferItem`) |
| `CollectionOffer` (create-offer response) | `CreateOfferResponse` |
| `BackdropFloorsResponse` for collection floors | `CollectionFloorsResponse` (`BackdropFloorsResponse` stays for `getBackdropFloors`) |
| `NftSearchParams` for owned NFTs | `OwnedNftsParams` (`NftSearchParams` stays for `searchNfts`) |
| `{ limit?: number }` inline | `AllCollectionOffersParams`, `TopCollectionOfferParams` |
| `TransferGiftsRequest { recipient: string; … }` | union: `{ recipient: string }` or `{ recipient_token: string }` |
| — | `BulkUpdateOffersRequest`, `BulkUpdateOffersResponse`, `BulkUpdateOfferItem`, `BulkUpdateFailedItem`, `CreateOfferAttribute`, `CollectionOfferScope`, `CollectionAttrFloorPrices`, `ApiErrorBody`, `NftPage`, `OwnedPortfolio`, `OwnedPortfolioParams`, `OwnedPortfolioOptions`, `PageOptions`, `PortfolioLogEntry`, `RequestOptions`, `RetryConfig`, `PortalsErrorKind`, `HttpMethod` |

All other 1.x type names are kept. Shapes follow the spec exactly:
- fields outside the spec's `required` are optional and nullable (`T | null | undefined`); in 1.x several were
  required (e.g. all 9 fields of the create-offer response, offer items), now they are optional per spec;
- response objects have an index signature `[key: string]: unknown` (unknown fields are kept);
- `AttributeFloorsResponse.models` is marked `@deprecated` (use `attribute_floors`);
- `ListForSaleRequest.price` and `NftPriceDetail.price` are required (the backend rejects a missing price);
- `CreateOfferRequest` requires `collection_id`, `amount`, `max_nfts`; `AcceptOfferRequest.nft_ids` is 1..50 items;
- `MarketConfigResponse.cooldown`: `string | number` → `number` (nanoseconds; the backend serializes a Go
  `time.Duration`, the spec's `string` is wrong).

#### Schemas

Top-level `*Schema` exports are removed. All generated schemas are under the `schemas` namespace and are named after
spec definitions; they are typed `z.ZodType<T>` (no `.shape` / `.extend` in types).

| 1.x | 2.0 (`schemas.*`) |
| --- | --- |
| `AttributeFloorsResponseSchema` | `FetchAllUniqueAttributeFloorsOutSchema` |
| `BackdropFloorsResponseSchema` | `FetchBackgroundFloorPricesOutSchema` |
| `BulkDelistRequestSchema` | `BulkDelistInSchema` |
| `BulkListingFailedNftSchema` | `FailedNftSchema` |
| `BulkListingResultResponseSchema` | `BulkListingResultSchema` |
| `BulkListRequestSchema` | `BulkListForSaleInSchema` |
| `BuyPartialRequestSchema` | `BuyPartialInSchema` |
| `BuyPartialResponseSchema` | `BuyPartialOutSchema` |
| `CheckUserExistsResponseSchema` | `CheckExistenceOutSchema` |
| `CollectionAttrFloorPricesSchema` | `FetchCollectionAttrFloorPricesOutSchema` |
| `CollectionMetricsResponseSchema` | `FetchCollectionMetricsOutSchema` |
| `CollectionOfferInfoSchema` | `CollectionInfoSchema` |
| `CollectionOfferSchema` | `CreateOfferResponseSchema` |
| `CollectionOfferStatusSchema` | removed |
| `CollectionsPreviewResponseSchema` | `FetchAllCollectionsWithPreviewOutSchema` |
| `FetchOfferCollectionsResponseSchema` | `FetchCollectionsOutSchema` |
| `FetchTopOffersResponseSchema` | `FetchTopOutSchema` |
| `GenerateDepositIdResponseSchema` | `GenerateDepositIdOutSchema` |
| `HttpNftSchema` | `HttpmodelNftSchema` |
| `ListForSaleRequestSchema` | `ListForSaleInSchema` |
| `MarketActionsResponseSchema` | `FetchAllUserActionsOutSchema` |
| `MarketConfigResponseSchema` | `GeneralOutSchema` |
| `ModelBackgroundFloorsResponseSchema` | `FetchModelsBackgroundsFloorPricesOutSchema` |
| `NftModelSchema` | `ModelNftSchema` |
| `NftStatsResponseSchema` | `FetchUserStatsOutSchema` |
| `OwnedNftsResponseSchema` | `FetchOwnedOutSchema` |
| `SearchNftsResponseSchema` | `SearchNftsOutSchema` |
| `TonWithdrawalStatusItemSchema` | `FetchStatusByIdOutSchema` |
| `TopCollectionOfferResponseSchema` | `CollectionOfferItemSchema` (nullable: `operations.getCollectionOffersTop.response`) |
| `TransferGiftsRequestSchema` | `TransferGiftsInSchema` |
| `TransferGiftsResponseSchema` | `TransferGiftsOutSchema` |
| `UserActionsResponseSchema` | `FetchUserActionsOutSchema` |
| `WalletInfoResponseSchema` | `InfoOutSchema` |
| `WalletWithdrawalStatusesResponseSchema` | `WithdrawStatusOutSchema` |
| `WithdrawalStatusesResponseSchema` | `WithdrawalStatusesOutSchema` |
| `WithdrawGiftsRequestSchema` | `WithdrawGiftsInSchema` |
| `WithdrawGiftsResponseSchema` | `WithdrawGiftsOutSchema` |
| `WithdrawTonRequestSchema` | `WithdrawInSchema` |
| `WithdrawTonResponseSchema` | `WithdrawOutSchema` |

Same name under `schemas.`: `AcceptOfferRequestSchema`, `AnonymizedUserActionSchema`, `AttributeFloorInfoSchema`,
`AttributeFloorPricesSchema`, `AttributeFloorsMapSchema`, `BundleExtendedSchema`, `BundleNftDetailsSchema`,
`BundleNftSchema`, `BuyDetailSchema`, `CancelOfferRequestSchema`, `CollectionAssetSchema`, `CollectionMetricsSchema`,
`CollectionOfferItemSchema`, `CollectionSchema`, `CollectionWithPreviewSchema`, `CreateOfferRequestSchema`,
`CreateOfferResponseSchema`, `DetailedUserActionSchema`, `HttpErrorSchema`, `InvalidNftDetailSchema`,
`NftAttributeSchema`, `NftPriceDetailSchema`, `PremarketOrderSchema`, `PurchaseResultSchema`,
`TransferFailedItemSchema`, `TransferRecipientInfoSchema`, `UpdatedNftDetailSchema`,
`UserActionCollectionOfferSchema`, `UserActionNftSchema`, `UserActionOfferSchema`, `UserSchema`,
`WithdrawalStatusSchema`, and every enum schema (`NftStatusSchema`, `SortByNftsSchema`, …).

Also new under `schemas`: query schemas per operation (`GetNftsSearchQuerySchema`, …), `operations` (method, path,
schemas, rate limit for each of the 32 operations), `definitionSchemas` (by spec name), `GLOBAL_RATE_LIMIT`.

#### Pagination

Code that paged `getOwnedNfts` by offset (overlapping pages without `sort_by`) can use
`client.getAllOwnedNfts({ status })` → `{ items, totalCount, complete, fetched, requests, errors }`. It ports the
grouping / splitting / per-collection paging algorithm from `portals-gift-mm` (`fetchAllOwnedChecked`); logging goes
through an optional `log` callback.

#### Example

```ts
// 1.x
import { HttpNft, isOk, Ok, PortalsApiError, SortByNfts } from "@pavelpotemkin/portals-market-api-sdk";
const res = await client.getOwnedNfts({ collection_id, sort_by: SortByNfts.CollectionNumberAsc });
if (!isOk(res) && res.error instanceof PortalsApiError && res.error.status === 422) { /* … */ }

// 2.0
import { type Nft, isOk, ok, SortByNfts } from "@pavelpotemkin/portals-market-api-sdk";
const res = await client.getOwnedNfts({ collection_id, sort_by: SortByNfts.ExternalCollectionNumberAsc });
if (!isOk(res) && res.error.kind === "http" && res.error.status === 422) { /* … */ }
```
