# @portals/market-sdk

TypeScript SDK для Portals Partners NFT Marketplace API.

- Zod-валидация всех запросов и ответов
- Result-тип вместо throw (`Ok`/`Err`)
- In-memory rate limiting
- Все типы и enum-ы экспортируются

## Установка

```bash
npm install @portals/market-sdk zod
```

## Быстрый старт

```ts
import {
  PortalsMarketClient,
  unwrap,
  isErr,
  ListingStatus,
  NftStatus,
  PortalsApiError,
} from "@portals/market-sdk";

const client = new PortalsMarketClient({ token: "your-partner-token" });

// Result-тип — без try/catch
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

// или unwrap — бросит ошибку если Result не ok
const data = unwrap(await client.getMarketConfig());
console.log(data.commission, data.usd_course);
```

## Конфигурация

```ts
const client = new PortalsMarketClient({
  token: "your-partner-token",
  baseUrl: "https://portal-market.com",  // default
  rateLimiting: true,                     // default, in-memory rate limiter
  fetch: customFetch,                     // optional, custom fetch implementation
});
```

## Rate Limiting

SDK отслеживает лимиты из документации API в памяти и возвращает `PortalsRateLimitError` до отправки запроса:

| Метод | Лимит |
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
| **Все запросы (global)** | **25 req/s** |

```ts
import { PortalsRateLimitError, isErr } from "@portals/market-sdk";

const res = await client.getBackdropFloors();
if (isErr(res) && res.error instanceof PortalsRateLimitError) {
  console.log(`Retry after ${res.error.retryAfterMs}ms`);
}
```

Отключить: `rateLimiting: false`.

## Ошибки

Все методы возвращают `Result<T, PortalsError>`. Типы ошибок:

| Класс | Когда |
|---|---|
| `PortalsApiError` | HTTP 4xx/5xx от сервера |
| `PortalsValidationError` | Ответ не прошёл Zod-валидацию |
| `PortalsRateLimitError` | Превышен rate limit (до отправки) |
| `PortalsNetworkError` | Сетевая ошибка (fetch failed) |

`PortalsApiError` имеет хелперы: `.isBadRequest`, `.isUnauthorized`, `.isNotFound`, `.isValidationError`, `.isServerError`, `.isRateLimited`.

## Методы

### Collection Offers
- `createCollectionOffer(body)` — создать оффер на коллекцию
- `cancelCollectionOffer(body)` — отменить оффер
- `acceptCollectionOffer(offerId, body)` — принять оффер
- `getOfferCollections()` — коллекции доступные для офферов
- `getTopCollectionOffer(collectionId)` — лучший оффер коллекции
- `getAllCollectionOffers(collectionId, params?)` — все офферы коллекции

### Collections
- `getCollectionsPreview(params?)` — превью всех коллекций
- `getCollectionMetrics(collectionId, params)` — метрики коллекции
- `getCollectionFloors()` — floor-цены коллекций
- `getBackdropFloors()` — floor-цены по бэкграундам
- `getAttributeFloors()` — floor-цены по атрибутам
- `getModelBackgroundFloors(models)` — floor-цены бэкграундов моделей

### NFTs
- `searchNfts(params?)` — поиск NFT
- `getOwnedNfts(params?)` — NFT пользователя
- `getNftStats()` — статистика NFT
- `buyNfts(body)` — купить NFT
- `bulkListNfts(body)` — массовый листинг
- `bulkUnlistNfts(body)` — массовый делист
- `listNft(nftId, body)` — листинг одного NFT
- `unlistNft(nftId)` — делист одного NFT
- `transferGifts(body)` — передать гифты
- `withdrawGifts(body)` — вывести гифты в Telegram
- `getWithdrawalStatuses(ids)` — статусы вывода гифтов

### Users
- `checkUserExists(userId)` — проверить существование пользователя

### Wallets
- `getWalletInfo()` — баланс кошелька
- `withdrawTon(body)` — вывод TON
- `getWalletWithdrawalStatuses(ids)` — статусы вывода TON

### Market
- `getMarketConfig()` — конфиг маркета
- `getMarketActions(params?)` — активность маркета
- `getUserActions(params?)` — действия пользователя
- `generateDepositId()` — deposit ID для TON

## Тесты

Интеграционные тесты работают с реальным API:

```bash
PORTALS_TOKEN=your_token npm run test:integration
```

## Сборка

```bash
npm run build       # ESM + CJS + .d.ts
npm run typecheck   # проверка типов
```
