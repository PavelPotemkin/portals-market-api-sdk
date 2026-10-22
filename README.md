# @pavelpotemkin/portals-market-api-sdk

TypeScript client for the [Portals Market](https://portal-market.com) Partner API.

- Types and zod 4 schemas are **generated** from the Swagger spec (`spec/partners.swagger.json`) with
  documented fixes for known spec errors (`spec/overrides.ts`).
- Methods **never throw**: every call returns `Result<T, PortalsError>`.
- Tolerant responses: unknown fields are kept, unknown enum values are accepted, optional fields may be `null`.
- Strict requests: arguments are validated before anything is sent.
- Per-attempt timeouts, `AbortSignal` support, 429 retries with `Retry-After`, in-memory rate limiting.
- Full-portfolio helper that works around overlapping offset pages.
- One runtime dependency: `zod`. ESM + CJS, Node.js ≥ 20 (or any runtime with `fetch`).

Upgrading from 1.x: see [CHANGELOG.md](./CHANGELOG.md).

## Install

```bash
npm install @pavelpotemkin/portals-market-api-sdk
```

## Quick start

```ts
import { PortalsMarketClient, ListingStatus, SortByNfts } from "@pavelpotemkin/portals-market-api-sdk";

const client = new PortalsMarketClient({ token: process.env.PORTALS_PARTNER_TOKEN! });

const res = await client.searchNfts({
  collection_id: "…",
  status: ListingStatus.Listed,
  sort_by: SortByNfts.PriceAsc,
  min_price: "1.5", // prices are decimal strings everywhere
  limit: 20,
});

if (res.ok) {
  for (const nft of res.value.results ?? []) console.log(nft.name, nft.price);
} else {
  console.error(res.error.kind, res.error.status, res.error.code, res.error.message);
}
```

## Configuration

```ts
const client = new PortalsMarketClient({
  token: "partner-token",               // required; sent as `Authorization: partners <token>`
  baseUrl: "https://portal-market.com", // default; a path prefix is kept (https://proxy/x/api → https://proxy/x/api/partners/…)
  fetch: customFetch,                   // default: globalThis.fetch
  timeoutMs: 30_000,                    // default; per HTTP attempt incl. reading the body; 0 = no timeout
  rateLimiting: true,                   // default; in-memory limits from the spec
  retry: {
    maxRetries: 3,                      // default; retries after 429
    baseDelayMs: 1_000,                 // default; exponential backoff base when there is no Retry-After
    maxDelayMs: 30_000,                 // default; cap for a single pause
  },
});
```

The constructor throws `TypeError` for an empty token, an invalid `baseUrl` or a missing `fetch` — that is
a programming error, not a runtime condition.

Every method accepts an optional last argument:

```ts
await client.getWalletInfo({ signal: AbortSignal.timeout(5_000), timeoutMs: 2_000 });
```

- `signal` cancels the whole call: waiting in the rate limiter, the request, and pauses between retries → `kind: "aborted"`.
- `timeoutMs` overrides the per-attempt timeout for this call → `kind: "timeout"`. The timeout is enforced even if a
  custom `fetch` ignores `signal`.

## Result

```ts
import { ok, err, isOk, isErr, unwrap, type Result } from "@pavelpotemkin/portals-market-api-sdk";

type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

const wallet = unwrap(await client.getWalletInfo()); // returns the value or throws the PortalsError
```

## Errors

There is one error class, `PortalsError extends Error`:

| Field | Meaning |
| --- | --- |
| `kind` | `"http"` · `"network"` · `"timeout"` · `"aborted"` · `"parse"` · `"validation"` · `"request"` |
| `method`, `endpoint` | `GET`/`POST` and the request path without base URL and query, e.g. `/partners/nfts/abc/list` |
| `status` | HTTP status (`http`, and `parse`/`validation` of a 2xx response) |
| `code` | `code` from the backend error body (`exerr.HttpError`) |
| `body` | raw response text (read once; kept for non-JSON bodies too) |
| `data` | response parsed as JSON; for `validation` — the data that failed the schema |
| `issues` | zod issues for `validation` and `request` |
| `retryable` | repeating the same call is safe and may succeed (always `false` for irreversible operations) |
| `attempts` | HTTP attempts made (`0` for `request` errors) |
| `isRateLimited`, `isNotFound`, `isUnauthorized` | getters for `http` 429 / 404 / 401 |

| `kind` | When |
| --- | --- |
| `http` | non-2xx response |
| `network` | `fetch` rejected, returned a non-`Response`, or the body stream failed |
| `timeout` | `timeoutMs` elapsed during the request or while reading the body |
| `aborted` | the caller's `signal` fired |
| `parse` | 2xx response whose body is not JSON (including an empty body) |
| `validation` | 2xx JSON that does not match the response schema — `data` keeps it |
| `request` | arguments failed the request schema; nothing was sent |

`retryable` is `true` for `network`, `timeout`, and `http` 408/429/500/502/503/504 — except for irreversible operations.

## Retries and rate limits

- Only **429** is retried automatically, up to `retry.maxRetries` times. The pause is `Retry-After` (seconds or an
  HTTP-date) plus a small jitter, otherwise exponential backoff with jitter; each pause is capped by `retry.maxDelayMs`.
  Retries go through the rate limiter again. Other errors are returned immediately; use `retryable` to decide.
- **Irreversible operations are never retried** and their errors always have `retryable: false`:
  `buyNfts`, `withdrawGifts`, `withdrawTon`, `transferGifts`, `acceptCollectionOffer`, `createCollectionOffer`
  (exported as `IRREVERSIBLE_OPERATIONS`). Other POSTs (`listNft`, `unlistNft`, `bulkListNfts`, `bulkUnlistNfts`,
  `cancelCollectionOffer`, `bulkUpdateCollectionOffers`, `generateDepositId`) are retried on 429.
- The in-memory limiter waits (it never fails) before each attempt. Limits come from the spec:

| Method | Limit |
| --- | --- |
| `searchNfts` | 15 req/s |
| `getTopCollectionOffer`, `getAllCollectionOffers` | 10 req/s |
| `getCollectionFloors` | 9 req/s |
| `getCollectionMetrics` | 8 req/s |
| `getOwnedNfts` | 6 req/s |
| `getAttributeFloors` | 5 req/s |
| `getModelBackgroundFloors` | 3 req/s |
| `getBackdropFloors`, `bulkUpdateCollectionOffers` | 2 req/s |
| all requests (global) | 25 req/s |

The limiter state lives in one client instance: several clients or processes with the same token do not share it.
Disable with `rateLimiting: false`.

## Buying: partial success

`buyNfts` buys what it can: invalid NFTs come back in `invalid_nfts` with a `reason` (`InvalidNftReason`, e.g.
`NFT_NOT_AVAILABLE`, `PRICE_CHANGED`), the rest is bought. Pass the exact price string from the search result.

```ts
const res = await client.buyNfts({ nft_details: [{ id: nft.id, price: nft.price! }] });
if (res.ok) {
  console.log(res.value.total_purchased, res.value.invalid_nfts);
} else if (res.error.kind === "validation") {
  // The purchase went through but the response did not match the schema: inspect res.error.data.
} else if (res.error.kind === "http" && (res.error.status ?? 0) < 500) {
  // Rejected by the backend (4xx): nothing was bought.
} else {
  // network / timeout / aborted / parse / 5xx: the outcome is unknown.
  // Check getUserActions() or getOwnedNfts() before trying again — do not blindly retry.
}
```

The same applies to the other irreversible operations.

## Collection offers

```ts
const top = await client.getTopCollectionOffer(collectionId, { scope: "broad" }); // Result<TopOffer | null>
if (top.ok && top.value) console.log(top.value.amount, top.value.scope);

await client.createCollectionOffer({
  collection_id: collectionId,
  amount: "10",
  max_nfts: 3,
  attributes: [{ type: "model", value: "Cool" }], // trait offer; 403 while trait offers are disabled
});

await client.bulkUpdateCollectionOffers({ offers: [{ id: offerId, amount: "11", expiration_days: 7 }] });
```

`scope` query: `broad` — offers on the whole collection, `trait` — trait offers. The `scope` field of an offer lists
its `models` / `backdrops` / `symbols`; empty or missing means a collection-wide offer.

## Pagination

Offset pages of `/nfts/owned` and `/nfts/search` are **not stable**: without `sort_by` the market orders by
`listed_at` (NULL for unlisted NFTs), and `external_collection_number` is unique only inside one collection. Pages
overlap — some NFTs come twice, some never.

### Full portfolio: `getAllOwnedNfts`

```ts
const res = await client.getAllOwnedNfts(
  { status: "unlisted" },                      // optional filters, except collection/limit/offset/sort_by
  { log: (e) => logger[e.level](e.message) },  // optional; the SDK never writes to the console
);
if (res.ok) {
  const { items, totalCount, complete, fetched, requests, errors } = res.value;
}
```

Algorithm (ported from the production market maker):
1. `total_count` (limit 1), then a fast pass without `sort_by`. If the unique count equals `total_count` and a second
   count is unchanged — done.
2. Otherwise the collections seen in the fast pass are fetched in groups (≤ 5 collections, ≤ 40 NFTs estimated) that
   fit into one page, where order does not matter. A group larger than a page is split in halves; a single large
   collection is paged with `sort_by: external_collection_number asc`.
3. If the groups add up to less than `total_count`, a collection was missed entirely: the remaining collections from
   `getCollectionsPreview` are checked the same way.

Result: `complete` — every request succeeded and the count matched `total_count` before and after; `fetched` — every
request succeeded; on an incomplete result `items` are the exact part plus fast-pass NFTs. `Err` is returned only if the
initial count fails or the call is aborted.

### Page iterators

```ts
for await (const page of client.iterateOwnedNfts({ collection_id: id }, { pageSize: 50 })) {
  if (!page.ok) break; // the iterator stops after an error
  handle(page.value.items); // new items only (deduplicated by id); also offset, totalCount, received, duplicates
}
```

`iterateOwnedNfts` / `iterateSearchNfts` yield `Result<NftPage>` per page. For a single collection without `sort_by`
they sort by `external_collection_number asc`, which is deterministic. For several collections or no collection the
order is not stable: duplicates are removed, but NFTs can still be missed — use `getAllOwnedNfts` for a full portfolio.
Options: `pageSize` (1..50), `maxPages`, `signal`, `timeoutMs`.

## Types, enums, schemas

- Friendly types: `Nft`, `NftModel`, `CollectionOfferItem`, `TopOffer`, `BuyPartialResponse`, `NftSearchParams`, …
- Enums are plain objects plus a string-literal type, so both `ListingStatus.Listed` and `"listed"` work:

  ```ts
  export const NftStatus = { Listed: "listed", Unlisted: "unlisted", … } as const;
  export type NftStatus = (typeof NftStatus)[keyof typeof NftStatus];
  ```

  In responses enum fields are typed `NftStatus | (string & {})`: new backend values do not break parsing.
- Generated zod schemas and the operation table are available as `schemas` (`schemas.HttpmodelNftSchema`,
  `schemas.operations.getNftsSearch`, …). Names there follow spec definitions.

## Methods

| Method | Endpoint |
| --- | --- |
| `createCollectionOffer(body)` | `POST /partners/collection-offers/` |
| `bulkUpdateCollectionOffers(body)` | `POST /partners/collection-offers/bulk/update` |
| `cancelCollectionOffer(body)` | `POST /partners/collection-offers/cancel` |
| `acceptCollectionOffer(offerId, body)` | `POST /partners/collection-offers/{offer_id}/accept` |
| `getOfferCollections()` | `GET /partners/collection-offers/collections` |
| `getTopCollectionOffer(collectionId, { scope? })` | `GET /partners/collection-offers/{collection_id}/top` |
| `getAllCollectionOffers(collectionId, { limit?, scope? })` | `GET /partners/collection-offers/{collection_id}/all` |
| `getAttributeFloors()` | `GET /partners/collections/attribute-floors` |
| `getBackdropFloors()` | `GET /partners/collections/backdrops/floors` |
| `getCollectionFloors()` | `GET /partners/collections/floors` |
| `getModelBackgroundFloors(models)` | `GET /partners/collections/models/backgrounds/floors` |
| `getCollectionsPreview(params?)` | `GET /partners/collections/preview` |
| `getCollectionMetrics(collectionId, params)` | `GET /partners/collections/{collection_id}/metrics` |
| `generateDepositId()` | `POST /partners/deposits` |
| `getMarketActions(params?)` | `GET /partners/market/actions/` |
| `getMarketConfig()` | `GET /partners/market/config` |
| `buyNfts(body)` | `POST /partners/nfts` |
| `bulkListNfts(body)` | `POST /partners/nfts/bulk-list` |
| `bulkUnlistNfts(body)` | `POST /partners/nfts/bulk-unlist` |
| `getOwnedNfts(params?)` | `GET /partners/nfts/owned` |
| `searchNfts(params?)` | `GET /partners/nfts/search` |
| `getNftStats()` | `GET /partners/nfts/stats` |
| `transferGifts(body)` — exactly one of `recipient` / `recipient_token` | `POST /partners/nfts/transfer` |
| `withdrawGifts(body)` | `POST /partners/nfts/withdraw` |
| `getWithdrawalStatuses(ids)` | `GET /partners/nfts/withdrawals/statuses` |
| `listNft(nftId, { price })` | `POST /partners/nfts/{nft_id}/list` |
| `unlistNft(nftId)` | `POST /partners/nfts/{nft_id}/unlist` |
| `checkUserExists(userId)` | `GET /partners/users/{user_id}` |
| `getUserActions(params?)` | `GET /partners/users/actions` |
| `getWalletInfo()` | `GET /partners/users/wallets/` |
| `withdrawTon(body)` | `POST /partners/users/wallets/withdraw` |
| `getWalletWithdrawalStatuses(ids)` | `GET /partners/users/wallets/withdrawals/statuses` |
| `iterateOwnedNfts`, `iterateSearchNfts`, `getAllOwnedNfts` | pagination helpers |

Every method also takes `options?: { signal?, timeoutMs? }` as the last argument.

## Development

```bash
npm run generate         # regenerate src/generated.ts from spec/ (after updating spec/partners.swagger.json)
npm run generate:check   # fail if src/generated.ts is stale (also covered by `npm test`)
npm run lint             # biome
npm run typecheck        # tsc over src, tests, scripts, spec
npm run test             # unit + contract tests (mock fetch)
npm run test:integration # read-only calls to the live API; needs PORTALS_PARTNER_TOKEN (optional PORTALS_PARTNER_BASE_URL)
npm run build            # ESM + CJS + .d.ts
```

Updating the spec: copy the new `partners.swagger.json` into `spec/`, run `npm run generate`. The generator fails if an
override in `spec/overrides.ts` became a no-op (the spec was fixed — delete the override) or an inline enum has no name.

## Publishing

GitHub Actions publishes to npm on push to `main` when `version` in `package.json` differs from the published one.
