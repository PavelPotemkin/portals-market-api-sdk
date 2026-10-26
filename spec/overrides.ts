/**
 * Поправки к `spec/partners.swagger.json`, которые применяет `scripts/generate.ts`.
 *
 * Спека генерируется swag из Go-аннотаций бэкенда и местами расходится с тем, что бэкенд
 * реально принимает и отдаёт. Каждая поправка — JSON Pointer в спеке, новое значение и причина.
 * Генератор падает, если поправка ничего не меняет (спеку уже исправили — поправку нужно
 * удалить) или если `where` не совпал (спека сдвинулась — поправку нужно пересмотреть).
 */

export interface SpecPatch {
  /** JSON Pointer (RFC 6901) на изменяемое значение. */
  pointer: string;
  /** Новое значение. `undefined` вместе с `remove: true` удаляет ключ. */
  value?: unknown;
  remove?: boolean;
  /** Защита от сдвига индексов: значение по `pointer` должно совпасть с `equals`. */
  where?: { pointer: string; equals: unknown };
  /** Почему спека здесь неверна или неполна. */
  reason: string;
}

export interface SpecOverrides {
  patches: SpecPatch[];
  /**
   * Имена inline-enum'ов. Ключ — место в спеке:
   * - `<definition>.<property>` для полей определений;
   * - `<METHOD> <path> query:<param>` для query-параметра конкретной операции;
   * - `query:<param>` для query-параметра во всех операциях.
   * Значения одного имени должны совпадать везде, иначе генератор падает.
   */
  inlineEnums: Record<string, string>;
  /** Имена членов enum'а, если имя из значения нечитаемо: enum → значение → имя члена. */
  enumMembers: Record<string, Record<string, string>>;
}

const p = (path: string) => `/paths/${path.replaceAll("~", "~0").replaceAll("/", "~1")}`;
const d = (name: string) => `/definitions/${name}`;

/**
 * Ответы Arena — зеркала Go-структур бэкенда игр, которые маркет отдаёт как есть
 * (games-backend handler/model/partner_arena_model.go, InventoryItemResponse): поля без
 * `omitempty` приходят всегда, nullable-поля — `null`. swag не пишет `required`.
 */
function arenaRequired(defs: Record<string, string[]>): SpecPatch[] {
  return Object.entries(defs).map(([name, fields]) => ({
    pointer: `${d(name)}/required`,
    value: fields,
    reason: `Поля ${name} без omitempty в Go-структуре бэкенда игр всегда есть в ответе.`,
  }));
}

export const overrides: SpecOverrides = {
  patches: [
    {
      pointer: `${p("/partners/collection-offers/{collection_id}/all")}/get/responses/200/schema`,
      value: { $ref: "#/definitions/dtocollectionoffers.FetchTopOut" },
      reason:
        "Бэкенд отдаёт объект FetchTopOut {offers, total_count}, а не массив: " +
        "collection_offers.go fetchTopCollectionOffers → ctx.JSON(out), аннотация {array} ошибочна.",
    },
    {
      pointer: `${p("/partners/collection-offers/{collection_id}/top")}/get/responses/200/schema/x-nullable`,
      value: true,
      reason:
        "Без активных офферов бэкенд отвечает 200 с телом null: collection_offers.go " +
        "fetchTopCollectionOffer → `if len(out.Offers) == 0 { JSON(nil) }`.",
    },
    {
      pointer: `${d("httptrustedapps.generalOut")}/properties/cooldown`,
      value: { type: "integer", description: "Кулдаун в наносекундах (Go time.Duration)." },
      reason:
        'Бэкенд market_general.go: `Cooldown time.Duration` с swaggertype:"string", ' +
        "но encoding/json сериализует time.Duration числом наносекунд.",
    },
    {
      pointer: `${d("httptrustedapps.CreateOfferRequest")}/required`,
      value: ["amount", "collection_id", "max_nfts"],
      reason: "Описание операции: «Required fields: collection_id, amount, max_nfts (1..50)».",
    },
    {
      pointer: `${d("httptrustedapps.AcceptOfferRequest")}/required`,
      value: ["amount", "nft_ids"],
      reason: "Описание операции: «Required fields: amount, nft_ids (1..50 unique ids)».",
    },
    {
      pointer: `${d("httptrustedapps.AcceptOfferRequest")}/properties/nft_ids/minItems`,
      value: 1,
      reason: "Описание операции: nft_ids 1..50.",
    },
    {
      pointer: `${d("httptrustedapps.AcceptOfferRequest")}/properties/nft_ids/maxItems`,
      value: 50,
      reason: "Описание операции: nft_ids 1..50.",
    },
    {
      pointer: `${d("httptrustedapps.CancelOfferRequest")}/required`,
      value: ["id"],
      reason: "Описание операции: «Required fields: id».",
    },
    {
      pointer: `${d("httptrustedapps.BulkUpdateOffersRequest")}/required`,
      value: ["offers"],
      reason: "Описание операции: пустой список даёт 422.",
    },
    {
      pointer: `${d("httptrustedapps.BulkUpdateOffersRequest")}/properties/offers/minItems`,
      value: 1,
      reason: "Описание операции: пустой список даёт 422.",
    },
    {
      pointer: `${d("httptrustedapps.BulkUpdateOffersRequest")}/properties/offers/maxItems`,
      value: 50,
      reason: "Описание операции: «Update up to 50 own collection offers», больше 50 даёт 422.",
    },
    {
      pointer: `${d("httptrustedapps.BulkUpdateOfferItem")}/required`,
      value: ["amount", "id"],
      reason: "Описание операции: «Required per item: id, amount (>= 0.5)».",
    },
    {
      pointer: `${d("nft.BulkListForSaleIn")}/required`,
      value: ["nft_prices"],
      reason:
        'Бэкенд: service/nft/listing.go BulkListForSaleIn.NftPrices `validate:"required|min:1"`.',
    },
    {
      pointer: `${d("nft.BulkListForSaleIn")}/properties/nft_prices/minItems`,
      value: 1,
      reason:
        'Бэкенд: service/nft/listing.go BulkListForSaleIn.NftPrices `validate:"required|min:1"`.',
    },
    {
      pointer: `${d("nft.NftPriceDetail")}/required`,
      value: ["nft_id", "price"],
      reason:
        'Бэкенд: NftPriceDetail.Price `validate:"drange:0.5,99999"`, ' +
        "отсутствующая цена (0) не проходит проверку.",
    },
    {
      pointer: `${d("nft.ListForSaleIn")}/required`,
      value: ["price"],
      reason: "Цена — единственное поле запроса листинга, без неё листинг не имеет смысла.",
    },
    {
      pointer: `${d("nft.TransferGiftsIn")}/x-exactly-one-of`,
      value: ["recipient", "recipient_token"],
      reason:
        "Получатель задаётся ровно одним полем: recipient (username или Telegram ID) " +
        "или recipient_token из /nfts/transfer-gifts/recipients.",
    },
    {
      pointer: `${p("/partners/collections/preview")}/get/parameters/0/enum`,
      where: {
        pointer: `${p("/partners/collections/preview")}/get/parameters/0/name`,
        equals: "sort_by",
      },
      value: ["name", "floor_price"],
      reason:
        "Бэкенд collection_preview.go: «sort field (name, floor_price)», остальное игнорирует.",
    },
    {
      pointer: `${p("/partners/collections/preview")}/get/parameters/1/enum`,
      where: {
        pointer: `${p("/partners/collections/preview")}/get/parameters/1/name`,
        equals: "sort_order",
      },
      value: ["asc", "desc"],
      reason:
        "Бэкенд collection_preview.go: «sort order (asc|desc)», иначе сортировка сбрасывается.",
    },
    {
      pointer: `${d("httptrustedapps.arenaBetRequest")}/required`,
      value: ["room_id", "bet_type"],
      reason:
        "Бэкенд partners_api/arena.go toGames: без room_id и bet_type ставка отклоняется 422.",
    },
    {
      pointer: `${d("httptrustedapps.arenaBetRequest")}/x-exactly-one-of`,
      value: ["amount", "gift_ids"],
      reason:
        "Ставка TON задаётся amount, ставка гифтами — gift_ids (arena.go toGames); " +
        "второе поле бэкенд игнорирует, поэтому SDK требует ровно одно.",
    },
    {
      pointer: `${d("httptrustedapps.arenaBetRequest")}/properties/gift_ids/minItems`,
      value: 1,
      reason: "Бэкенд arena.go toGames: gift_ids — от 1 до 50 id, иначе 422.",
    },
    {
      pointer: `${d("httptrustedapps.arenaBetRequest")}/properties/gift_ids/maxItems`,
      value: 50,
      reason: "Бэкенд arena.go toGames: gift_ids — от 1 до 50 id (maxArenaBetGifts), иначе 422.",
    },
    ...arenaRequired({
      "httptrustedapps.arenaStateResponse": ["serverTime", "rooms"],
      "httptrustedapps.arenaRoom": [
        "roomId",
        "mode",
        "minBetAmount",
        "maxBetAmount",
        "allowGiftBets",
        "maxPlayersCount",
        "countdownDurationSeconds",
        "game",
      ],
      "httptrustedapps.arenaGame": ["id", "status", "playerCount", "prizePool", "bets"],
      "httptrustedapps.arenaBet": [
        "playerId",
        "playerName",
        "mine",
        "betType",
        "amount",
        "createdAt",
      ],
      "httptrustedapps.arenaBetResponse": [
        "betId",
        "gameId",
        "acceptedAmount",
        "serverTime",
        "room",
      ],
      "httptrustedapps.arenaInventoryResponse": ["items", "totalCount"],
      "httptrustedapps.arenaInventoryItem": [
        "id",
        "name",
        "collection",
        "collectionId",
        "externalCollectionNumber",
        "photoUrl",
        "price",
        "attributes",
        "status",
        "hasAnimation",
        "importSource",
        "isCrafted",
      ],
      "httptrustedapps.arenaInventoryAttr": ["type", "value", "rarityPerMille"],
    }),
  ],

  inlineEnums: {
    "httptrustedapps.arenaBet.betType": "ArenaBetType",
    "httptrustedapps.arenaBetRequest.bet_type": "ArenaBetType",
    "httptrustedapps.arenaGame.status": "ArenaGameStatus",
    "httptrustedapps.arenaRoom.mode": "ArenaRoomMode",
    "query:action_types": "MarketActionType",
    "query:period": "Period",
    "query:status": "ListingStatus",
    "query:is_crafted_status": "CraftedStatus",
    "query:mint_status": "MintStatus",
    "query:premarket_status": "PremarketFilterStatus",
    "query:scope": "CollectionOfferScopeType",
    "query:sort_order": "SortOrder",
    "GET /partners/nfts/search query:sort_by": "SortByNfts",
    "GET /partners/nfts/owned query:sort_by": "SortByNfts",
    "GET /partners/market/actions/ query:sort_by": "SortByActions",
    "GET /partners/users/actions query:sort_by": "SortByActions",
    "GET /partners/collections/preview query:sort_by": "CollectionSortBy",
    "httpcollectionoffer.CreateOfferAttribute.type": "NftAttributeType",
    "nft.WithdrawalStatus.status": "WithdrawalStatusValue",
    "nft.WithdrawalStatus.details": "WithdrawalStatusDetails",
  },

  enumMembers: {
    WithdrawalStatusDetails: {
      "failed to determine withdrawal status": "Undetermined",
      "gift transferred successfully": "Transferred",
      "gift could not be sent inside app; recipient not registered; gift returned to sender; commission returned to sender":
        "ReturnedToSender",
      "GiftID is nil": "GiftIdIsNil",
      "gift could not be sent inside app; recipient registered; gift returned to recipient; commission returned to recipient":
        "ReturnedToRecipient",
      "gift is not on relayer; cannot transfer; write to tech support": "NotOnRelayer",
    },
  },
};
