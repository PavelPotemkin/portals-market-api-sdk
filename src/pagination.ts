import { PortalsError } from "./errors";
import { SortByNfts } from "./generated";
import { err, ok, type Result } from "./result";
import type { RequestOptions } from "./transport";
import type {
  CollectionsPreviewParams,
  CollectionsPreviewResponse,
  Nft,
  NftSearchParams,
  OwnedNftsParams,
  OwnedNftsResponse,
  SearchNftsResponse,
} from "./types";

/** Максимальный `limit` поиска и owned на бэкенде (service/nft/search.go normalizeSearchLimit). */
export const MAX_PAGE_SIZE = 50;

/** Методы клиента, которые нужны помощникам пагинации. */
export interface PaginationClient {
  getOwnedNfts(
    params?: OwnedNftsParams,
    options?: RequestOptions,
  ): Promise<Result<OwnedNftsResponse, PortalsError>>;
  searchNfts(
    params?: NftSearchParams,
    options?: RequestOptions,
  ): Promise<Result<SearchNftsResponse, PortalsError>>;
  getCollectionsPreview(
    params?: CollectionsPreviewParams,
    options?: RequestOptions,
  ): Promise<Result<CollectionsPreviewResponse, PortalsError>>;
}

export interface PageOptions extends RequestOptions {
  /** Размер страницы, 1..50 (default: `params.limit` или 50). */
  pageSize?: number;
  /** Остановиться после стольких страниц. */
  maxPages?: number;
}

export interface NftPage {
  /** NFT этой страницы, которых не было на предыдущих (дедупликация по `id`). */
  items: Nft[];
  /** Offset запроса этой страницы. */
  offset: number;
  /** `total_count` из ответа, если бэкенд его прислал. */
  totalCount: number | null;
  /** Сколько строк пришло в ответе до дедупликации. */
  received: number;
  /** Сколько строк уже встречались на предыдущих страницах. */
  duplicates: number;
}

function pageSize(options: PageOptions, limit: number | null | undefined): number {
  const size = options.pageSize ?? limit ?? MAX_PAGE_SIZE;
  return Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(size)));
}

function singleCollection(params: {
  collection_id?: string | null;
  collection_ids?: string[] | null;
}) {
  if (params.collection_id) return !params.collection_ids?.length;
  return params.collection_ids?.length === 1;
}

/**
 * Сортировка по умолчанию для постраничного обхода. Детерминированный порядок у маркета есть
 * только по `external_collection_number` внутри одной коллекции (номер уникален в коллекции).
 * Для нескольких коллекций и без коллекции стабильной сортировки нет: страницы по offset
 * могут перекрываться — дубликаты отсекаются, но пропуски возможны.
 */
function defaultSort<P extends OwnedNftsParams | NftSearchParams>(params: P): P {
  if (params.sort_by || !singleCollection(params)) return params;
  return { ...params, sort_by: SortByNfts.ExternalCollectionNumberAsc };
}

async function* iteratePages(
  fetchPage: (
    offset: number,
    limit: number,
  ) => Promise<Result<{ rows: Nft[]; totalCount: number | null }, PortalsError>>,
  startOffset: number,
  limit: number,
  maxPages: number | undefined,
): AsyncGenerator<Result<NftPage, PortalsError>, void, undefined> {
  const seen = new Set<string>();
  let offset = startOffset;
  let pages = 0;
  for (;;) {
    const res = await fetchPage(offset, limit);
    if (!res.ok) {
      yield res;
      return;
    }
    const { rows, totalCount } = res.value;
    const items: Nft[] = [];
    for (const nft of rows) {
      if (seen.has(nft.id)) continue;
      seen.add(nft.id);
      items.push(nft);
    }
    yield ok({
      items,
      offset,
      totalCount,
      received: rows.length,
      duplicates: rows.length - items.length,
    });
    pages++;
    if (rows.length < limit) return;
    if (maxPages !== undefined && pages >= maxPages) return;
    offset += limit;
    if (totalCount !== null && offset >= totalCount) return;
  }
}

/**
 * Постраничный обход `getOwnedNfts`. Каждая страница — `Result`; после ошибки обход
 * заканчивается. Для полного портфеля используйте `getAllOwnedNfts`: offset-страницы маркета
 * без стабильной сортировки перекрываются.
 */
export function iterateOwnedNfts(
  client: PaginationClient,
  params: OwnedNftsParams = {},
  options: PageOptions = {},
): AsyncGenerator<Result<NftPage, PortalsError>, void, undefined> {
  const { pageSize: _size, maxPages, ...request } = options;
  const query = defaultSort(params);
  const limit = pageSize(options, params.limit);
  return iteratePages(
    async (offset, size) => {
      const res = await client.getOwnedNfts({ ...query, limit: size, offset }, request);
      if (!res.ok) return res;
      return ok({ rows: res.value.nfts, totalCount: res.value.total_count ?? null });
    },
    params.offset ?? 0,
    limit,
    maxPages,
  );
}

/** Постраничный обход `searchNfts`; те же правила, что у `iterateOwnedNfts`. */
export function iterateSearchNfts(
  client: PaginationClient,
  params: NftSearchParams = {},
  options: PageOptions = {},
): AsyncGenerator<Result<NftPage, PortalsError>, void, undefined> {
  const { pageSize: _size, maxPages, ...request } = options;
  const query = defaultSort(params);
  const limit = pageSize(options, params.limit);
  return iteratePages(
    async (offset, size) => {
      const res = await client.searchNfts({ ...query, limit: size, offset }, request);
      if (!res.ok) return res;
      return ok({ rows: res.value.results ?? [], totalCount: res.value.total_count ?? null });
    },
    params.offset ?? 0,
    limit,
    maxPages,
  );
}

// ── Полный портфель ──

/** Фильтры полного портфеля: всё, кроме коллекций, пагинации и сортировки. */
export type OwnedPortfolioParams = Omit<
  OwnedNftsParams,
  "collection_id" | "collection_ids" | "limit" | "offset" | "sort_by"
>;

export interface PortfolioLogEntry {
  level: "info" | "error";
  message: string;
  error?: PortalsError;
}

export interface OwnedPortfolioOptions extends RequestOptions {
  /** Журнал обхода; SDK сам ничего не пишет в консоль. */
  log?: (entry: PortfolioLogEntry) => void;
}

export interface OwnedPortfolio {
  /**
   * NFT портфеля без дубликатов. Если `complete` — ровно портфель; иначе точная часть
   * дополнена NFT быстрого прохода (лучше показать найденный NFT, чем потерять его).
   */
  items: Nft[];
  /** `total_count` до выгрузки. */
  totalCount: number;
  /** Все запросы к маркету прошли без ошибок. */
  fetched: boolean;
  /** `fetched`, и число NFT совпало с `total_count` до и после выгрузки. */
  complete: boolean;
  /** Сколько запросов `getOwnedNfts` сделано. */
  requests: number;
  /** Ошибки отдельных запросов (при них `fetched` = false). */
  errors: PortalsError[];
}

/** Не больше 5 коллекций в запросе: дальше маркет переключается на другой путь поиска. */
const MAX_COLLECTIONS_PER_REQUEST = 5;
/** Запас до размера страницы: оценка числа NFT коллекции по быстрому проходу может быть занижена. */
const GROUP_TARGET_SIZE = 40;
/** Защита от бесконечного листания одной коллекции. */
const MAX_PAGES_PER_COLLECTION = 1000;

class Aborted {
  constructor(readonly error: PortalsError) {}
}

/** Группы коллекций, которые по оценке помещаются в одну страницу. */
export function groupCollections(counts: Map<string, number>): string[][] {
  const groups: { ids: string[]; size: number }[] = [];
  const sorted = [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  for (const [id, count] of sorted) {
    const group = groups.find(
      (g) => g.ids.length < MAX_COLLECTIONS_PER_REQUEST && g.size + count <= GROUP_TARGET_SIZE,
    );
    if (group) {
      group.ids.push(id);
      group.size += count;
    } else {
      groups.push({ ids: [id], size: count });
    }
  }
  return groups.map((g) => g.ids);
}

/**
 * Полный список своих NFT с проверкой `total_count`.
 *
 * Без `sort_by` маркет сортирует по `listed_at`, у unlisted он NULL, и страницы по offset
 * перекрываются: часть NFT приходит дважды, часть не приходит вовсе. Глобально стабильной
 * сортировки нет (`external_collection_number` уникален только внутри коллекции), поэтому:
 * 1. Быстрый проход без `sort_by`. Если уникальных NFT столько же, сколько `total_count`,
 *    и портфель не менялся — готово.
 * 2. Иначе коллекции из быстрого прохода добираются группами (≤5 коллекций, оценка ≤40 NFT),
 *    каждая группа — одной страницей, где порядок не важен. Группа больше страницы делится
 *    пополам; одна большая коллекция листается по `external_collection_number asc`.
 * 3. Если сумма по группам меньше `total_count`, какая-то коллекция целиком выпала из быстрого
 *    прохода: остальные коллекции из `getCollectionsPreview` проверяются теми же группами.
 *
 * `Err` — только если не удалось получить исходный `total_count` или вызов отменён `signal`;
 * сбои отдельных запросов дают `fetched: false` и попадают в `errors`.
 */
export async function getAllOwnedNfts(
  client: PaginationClient,
  params: OwnedPortfolioParams = {},
  options: OwnedPortfolioOptions = {},
): Promise<Result<OwnedPortfolio, PortalsError>> {
  const { log, ...request } = options;
  const label = params.status ?? "all";
  const { with_attributes, with_attribute_floors: _floors, ...countFilters } = params;
  const dataFilters: OwnedNftsParams = { ...params, with_attributes: with_attributes ?? true };
  const errors: PortalsError[] = [];
  let requests = 0;

  const fail = (message: string, error: PortalsError) => {
    errors.push(error);
    log?.({ level: "error", message: `${message}: ${error.message}`, error });
    if (error.kind === "aborted") throw new Aborted(error);
  };

  const owned = async (query: OwnedNftsParams) => {
    requests++;
    return client.getOwnedNfts(query, request);
  };

  type Count = { ok: true; total: number } | { ok: false; error: PortalsError };
  const countOwned = async (): Promise<Count> => {
    const res = await owned({ ...countFilters, limit: 1 });
    if (!res.ok) {
      fail(`failed to count ${label} nfts`, res.error);
      return { ok: false, error: res.error };
    }
    const total = res.value.total_count;
    if (total == null) {
      const error = new PortalsError({
        kind: "validation",
        method: "GET",
        endpoint: "/partners/nfts/owned",
        message: "GET /partners/nfts/owned: total_count missing",
        data: res.value,
        attempts: 1,
      });
      fail(`${label} nfts`, error);
      return { ok: false, error };
    }
    return { ok: true, total };
  };

  // Обход без sort_by: может пропустить NFT или вернуть его дважды.
  const scanUnsorted = async (byId: Map<string, Nft>, total: number): Promise<boolean> => {
    const maxPages = Math.ceil(total / MAX_PAGE_SIZE) * 2 + 2;
    let offset = 0;
    for (let page = 0; page < maxPages; page++) {
      const res = await owned({ ...dataFilters, limit: MAX_PAGE_SIZE, offset });
      if (!res.ok) {
        fail(`failed to fetch ${label} nfts`, res.error);
        return false;
      }
      for (const nft of res.value.nfts) byId.set(nft.id, nft);
      if (res.value.nfts.length < MAX_PAGE_SIZE) return true;
      offset += MAX_PAGE_SIZE;
    }
    log?.({ level: "error", message: `${label} nfts: unsorted scan exceeded ${maxPages} pages` });
    return false;
  };

  type Part = { nfts: Nft[]; complete: boolean };

  const fetchCollection = async (collectionId: string): Promise<Part> => {
    const nfts: Nft[] = [];
    let offset = 0;
    for (let page = 0; page < MAX_PAGES_PER_COLLECTION; page++) {
      const res = await owned({
        ...dataFilters,
        collection_id: collectionId,
        sort_by: SortByNfts.ExternalCollectionNumberAsc,
        limit: MAX_PAGE_SIZE,
        offset,
      });
      if (!res.ok) {
        fail(`failed to fetch ${label} nfts of collection ${collectionId}`, res.error);
        return { nfts, complete: false };
      }
      nfts.push(...res.value.nfts);
      if (res.value.nfts.length < MAX_PAGE_SIZE) return { nfts, complete: true };
      offset += MAX_PAGE_SIZE;
    }
    return { nfts, complete: false };
  };

  // Все NFT группы коллекций. Ответ точный, только если вся группа пришла одной страницей.
  const fetchCollections = async (collectionIds: string[]): Promise<Part> => {
    const res = await owned({
      ...dataFilters,
      collection_ids: collectionIds,
      limit: MAX_PAGE_SIZE,
    });
    if (!res.ok) {
      fail(`failed to fetch ${label} nfts of collections ${collectionIds.join(",")}`, res.error);
      return { nfts: [], complete: false };
    }
    const { nfts, total_count: total } = res.value;
    if (total != null && total <= MAX_PAGE_SIZE) {
      // Расхождение — портфель изменился между выборкой и подсчётом.
      return { nfts, complete: nfts.length === total };
    }
    if (collectionIds.length === 1) return fetchCollection(collectionIds[0]);
    const mid = Math.ceil(collectionIds.length / 2);
    const left = await fetchCollections(collectionIds.slice(0, mid));
    const right = await fetchCollections(collectionIds.slice(mid));
    return { nfts: [...left.nfts, ...right.nfts], complete: left.complete && right.complete };
  };

  try {
    const before = await countOwned();
    if (!before.ok) return err(before.error);
    const totalBefore = before.total;
    const result = (items: Nft[], fetched: boolean, complete: boolean) =>
      ok({ items, totalCount: totalBefore, fetched, complete, requests, errors });
    if (totalBefore === 0) return result([], true, true);

    const scanned = new Map<string, Nft>();
    const scanOk = await scanUnsorted(scanned, totalBefore);

    if (scanOk && scanned.size === totalBefore) {
      const after = await countOwned();
      if (after.ok && after.total === totalBefore) {
        log?.({
          level: "info",
          message: `${label} nfts: scan ${scanned.size}/${totalBefore} by ${requests} requests`,
        });
        return result([...scanned.values()], true, true);
      }
    }

    const counts = new Map<string, number>();
    for (const nft of scanned.values()) {
      counts.set(nft.collection_id, (counts.get(nft.collection_id) ?? 0) + 1);
    }

    const exact = new Map<string, Nft>();
    let fetched = scanOk;
    let rows = 0;
    const fetchGroups = async (groups: string[][]) => {
      for (const group of groups) {
        const part = await fetchCollections(group);
        if (!part.complete) fetched = false;
        rows += part.nfts.length;
        for (const nft of part.nfts) exact.set(nft.id, nft);
      }
    };

    await fetchGroups(groupCollections(counts));

    let after = await countOwned();
    if (!after.ok) fetched = false;

    if (fetched && after.ok && after.total === totalBefore && rows < totalBefore) {
      const preview = await client.getCollectionsPreview(undefined, request);
      if (!preview.ok) {
        fail("failed to fetch collections", preview.error);
        fetched = false;
      } else {
        const unseen = new Map<string, number>();
        for (const col of preview.value.collections ?? []) {
          if (col.id && !counts.has(col.id)) unseen.set(col.id, 0);
        }
        await fetchGroups(groupCollections(unseen));
        after = await countOwned();
        if (!after.ok) fetched = false;
      }
    }

    const totalAfter = after.ok ? after.total : null;
    const complete = fetched && rows === totalBefore && rows === totalAfter;
    log?.({
      level: complete ? "info" : "error",
      message: `${label} nfts: scan ${scanned.size}/${totalBefore}, exact ${rows} by ${requests} requests${complete ? "" : `, incomplete (total -> ${totalAfter})`}`,
    });

    if (complete) return result([...exact.values()], fetched, complete);

    // Неполный список дополняется NFT быстрого прохода.
    for (const nft of scanned.values()) {
      if (!exact.has(nft.id)) exact.set(nft.id, nft);
    }
    return result([...exact.values()], fetched, complete);
  } catch (cause) {
    if (cause instanceof Aborted) return err(cause.error);
    return err(
      new PortalsError({
        kind: "network",
        method: "GET",
        endpoint: "/partners/nfts/owned",
        message: `getAllOwnedNfts: unexpected error: ${String(cause)}`,
        cause,
      }),
    );
  }
}
