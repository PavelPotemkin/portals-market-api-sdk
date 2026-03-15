# portals-market-api-sdk

TypeScript SDK for [Portals Partners NFT Marketplace API](https://portal-market.com).

- Zod validation for all requests and responses
- Result type instead of throw (`Ok`/`Err`)
- In-memory rate limiting
- All types and enums are exported

## Install

```bash
npm install portals-market-api-sdk
```

## Quick start

```ts
import {
  PortalsMarketClient,
  unwrap,
  isErr,
  ListingStatus,
  NftStatus,
  PortalsApiError,
} from "portals-market-api-sdk";

const client = new PortalsMarketClient({ token: "your-partner-token" });

// Result type — no try/catch
const res = await client.searchNfts({
  status: ListingStatus.Listed,
  limit: 10,
});

if (res.ok) {
  for (const nft of res.value.results ?? []) {
    console.log(nft.name, nft.price, nft.status);
  }
} else {
  if (res.error instanceof PortalsApiError) {
    console.log(res.error.status, res.error.body);
  }
}

// unwrap — throws if Result is not ok
const data = unwrap(await client.getMarketConfig());
console.log(data.commission, data.usd_course);
```

## Configuration

```ts
const client = new PortalsMarketClient({
  token: "your-partner-token",
  baseUrl: "https://portal-market.com", // default
  rateLimiting: true,                   // default, in-memory rate limiter
  fetch: customFetch,                   // optional, custom fetch
});
```

## Rate Limiting

Built-in in-memory rate limiter based on API documentation. Returns `PortalsRateLimitError` before sending request if limit exceeded:

| Method | Limit |
|---|---|
| `searchNfts` | 15 req/s |
| `getTopCollectionOffer` | 10 req/s |
| `getAllCollectionOffers` | 10 req/s |
| `getCollectionFloors` | 9 req/s |
| `getCollectionMetrics` | 8 req/s |
| `getOwnedNfts` | 6 req/s |
| `getAttributeFloors` | 5 req/s |
| `getModelBackgroundFloors` | 3 req/s |
| `getBackdropFloors` | 2 req/s |
| **All requests (global)** | **25 req/s** |

```ts
import { PortalsRateLimitError, isErr } from "portals-market-api-sdk";

const res = await client.getBackdropFloors();
if (isErr(res) && res.error instanceof PortalsRateLimitError) {
  console.log(`Retry after ${res.error.retryAfterMs}ms`);
}
```

Disable: `rateLimiting: false`.

## Errors

All methods return `Result<T, PortalsError>`:

| Class | When |
|---|---|
| `PortalsApiError` | HTTP 4xx/5xx from server |
| `PortalsValidationError` | Response failed Zod validation |
| `PortalsRateLimitError` | Rate limit exceeded (before request) |
| `PortalsNetworkError` | Network error (fetch failed) |

`PortalsApiError` helpers: `.isBadRequest`, `.isUnauthorized`, `.isNotFound`, `.isValidationError`, `.isServerError`, `.isRateLimited`.

## Methods

### Collection Offers
- `createCollectionOffer(body)` — create collection offer
- `cancelCollectionOffer(body)` — cancel offer
- `acceptCollectionOffer(offerId, body)` — accept offer
- `getOfferCollections()` — collections available for offers
- `getTopCollectionOffer(collectionId)` — top offer for collection
- `getAllCollectionOffers(collectionId, params?)` — all offers for collection

### Collections
- `getCollectionsPreview(params?)` — all collections with preview
- `getCollectionMetrics(collectionId, params)` — collection metrics
- `getCollectionFloors()` — floor prices by collection
- `getBackdropFloors()` — floor prices by backdrop
- `getAttributeFloors()` — floor prices by attribute
- `getModelBackgroundFloors(models)` — backdrop floor prices for models

### NFTs
- `searchNfts(params?)` — search NFTs
- `getOwnedNfts(params?)` — user's NFTs
- `getNftStats()` — NFT stats
- `buyNfts(body)` — buy NFTs (partial purchase support)
- `bulkListNfts(body)` — bulk list for sale
- `bulkUnlistNfts(body)` — bulk delist
- `listNft(nftId, body)` — list single NFT
- `unlistNft(nftId)` — delist single NFT
- `transferGifts(body)` — transfer gifts to user
- `withdrawGifts(body)` — withdraw gifts to Telegram
- `getWithdrawalStatuses(ids)` — gift withdrawal statuses

### Users
- `checkUserExists(userId)` — check if user exists by Telegram ID

### Wallets
- `getWalletInfo()` — wallet balance
- `withdrawTon(body)` — withdraw TON
- `getWalletWithdrawalStatuses(ids)` — TON withdrawal statuses

### Market
- `getMarketConfig()` — market configuration
- `getMarketActions(params?)` — market activity
- `getUserActions(params?)` — user actions
- `generateDepositId()` — generate deposit ID for TON

## Development

```bash
npm run build            # ESM + CJS + .d.ts
npm run typecheck        # type check
npm run lint             # eslint
npm run test             # unit tests
npm run test:integration # integration tests (needs PORTALS_TOKEN)
```

## Publishing

Publish happens automatically via GitHub Actions on push to `main` when `version` in `package.json` changes.

To publish a new version:
1. Update `version` in `package.json`
2. Push to `main`
