import { describe, expect, it } from "vitest";
import { groupCollections, type PortfolioLogEntry, type schemas } from "../src";
import { json, makeClient, type RecordedCall } from "./helpers";

interface Gift {
  id: string;
  collection_id: string;
  ecn: number;
  status: "listed" | "unlisted";
}

interface ServerOptions {
  /** Без sort_by каждый запрос видит свою перестановку — страницы по offset перекрываются. */
  unstable?: boolean;
  /** Коллекции, которые без фильтра по коллекции не приходят (но входят в total_count). */
  hiddenWithoutCollectionFilter?: string[];
  /** Коллекции из preview. */
  collections?: string[];
  /** Ответить ошибкой на запрос, если вернуть true. */
  fail?: (query: Record<string, string>, index: number) => Response | undefined;
  /** Изменить портфель перед ответом на запрос с этим номером. */
  mutate?: (gifts: Gift[], index: number) => void;
}

function hash(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) h = Math.imul(h ^ value.charCodeAt(i), 16777619);
  return h >>> 0;
}

function gifts(spec: Record<string, number>, status: Gift["status"] = "unlisted"): Gift[] {
  return Object.entries(spec).flatMap(([collection, count]) =>
    Array.from({ length: count }, (_, i) => ({
      id: `${collection}-${i + 1}`,
      collection_id: collection,
      ecn: i + 1,
      status,
    })),
  );
}

function ownedServer(portfolio: Gift[], options: ServerOptions = {}) {
  let ownedRequests = 0;
  return (call: RecordedCall, index: number) => {
    const url = new URL(call.url);
    const q = Object.fromEntries(url.searchParams);
    const failure = options.fail?.(q, index);
    if (failure) return failure;
    if (url.pathname === "/partners/collections/preview") {
      return json({ collections: (options.collections ?? []).map((id) => ({ id, name: id })) });
    }
    if (url.pathname !== "/partners/nfts/owned") return json({ message: "not found" }, 404);
    options.mutate?.(portfolio, ownedRequests);
    const requestNo = ownedRequests++;

    let rows = portfolio.filter((g) => !q.status || g.status === q.status);
    if (q.collection_id) rows = rows.filter((g) => g.collection_id === q.collection_id);
    if (q.collection_ids) {
      const ids = q.collection_ids.split(",");
      rows = rows.filter((g) => ids.includes(g.collection_id));
    }
    const total = rows.length;
    const hidden = options.hiddenWithoutCollectionFilter ?? [];
    if (!q.collection_id && !q.collection_ids && hidden.length) {
      rows = rows.filter((g) => !hidden.includes(g.collection_id));
    }

    if (q.sort_by === "external_collection_number asc") {
      rows = [...rows].sort((a, b) => a.ecn - b.ecn || a.id.localeCompare(b.id));
    } else if (q.sort_by) {
      throw new Error(`unexpected sort ${q.sort_by}`);
    } else if (options.unstable) {
      rows = [...rows].sort((a, b) => hash(a.id + requestNo) - hash(b.id + requestNo));
    } else {
      rows = [...rows].sort((a, b) => a.id.localeCompare(b.id));
    }

    const limit = Math.min(50, Number(q.limit ?? 20));
    const offset = Number(q.offset ?? 0);
    const page = rows.slice(offset, offset + limit).map((g) => ({
      id: g.id,
      name: g.collection_id,
      photo_url: "p",
      collection_id: g.collection_id,
      external_collection_number: g.ecn,
      status: g.status,
      attributes: [],
      is_owned: true,
    }));
    return json({ nfts: page, total_count: total });
  };
}

function ownedQueries(calls: RecordedCall[]) {
  return calls
    .map((c) => new URL(c.url))
    .filter((u) => u.pathname === "/partners/nfts/owned")
    .map((u) => Object.fromEntries(u.searchParams));
}

describe("getAllOwnedNfts", () => {
  it("быстрый проход, если страницы не перекрываются", async () => {
    const portfolio = gifts({ a: 70, b: 30, c: 20 });
    const { client, calls } = makeClient(ownedServer(portfolio));
    const res = await client.getAllOwnedNfts({ status: "unlisted" });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.value.complete).toBe(true);
    expect(res.value.fetched).toBe(true);
    expect(res.value.totalCount).toBe(120);
    expect(new Set(res.value.items.map((n) => n.id)).size).toBe(120);
    expect(res.value.requests).toBe(5); // count + 3 страницы + count
    const queries = ownedQueries(calls);
    expect(queries[0]).toEqual({ status: "unlisted", limit: "1" });
    expect(queries[1]).toEqual({
      status: "unlisted",
      with_attributes: "true",
      limit: "50",
      offset: "0",
    });
  });

  it("перекрытие страниц без sort_by: добор группами и листание большой коллекции", async () => {
    const portfolio = gifts({ big: 120, b: 30, c: 15, d: 5, e: 3 });
    const { client, calls } = makeClient(ownedServer(portfolio, { unstable: true }));

    // Простой обход нестабильной выдачи теряет NFT — ровно то, что чинит getAllOwnedNfts.
    let naive = 0;
    for await (const page of client.iterateOwnedNfts({ status: "unlisted" })) {
      if (page.ok) naive += page.value.items.length;
    }
    expect(naive).toBeLessThan(173);
    calls.length = 0;

    const res = await client.getAllOwnedNfts({ status: "unlisted" });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.value.complete).toBe(true);
    expect(res.value.items).toHaveLength(173);
    expect(new Set(res.value.items.map((n) => n.id)).size).toBe(173);

    const queries = ownedQueries(calls);
    // Группы ≤ 5 коллекций.
    for (const q of queries.filter((x) => x.collection_ids)) {
      expect(q.collection_ids.split(",").length).toBeLessThanOrEqual(5);
    }
    // Большая коллекция листается по номеру внутри одной коллекции.
    const paged = queries.filter((x) => x.collection_id === "big");
    expect(paged.length).toBe(3);
    for (const q of paged) expect(q.sort_by).toBe("external_collection_number asc");
  });

  it("коллекция, целиком пропавшая из быстрого прохода, добирается по preview", async () => {
    const portfolio = gifts({ a: 40, hidden: 7 });
    const { client, calls } = makeClient(
      ownedServer(portfolio, {
        hiddenWithoutCollectionFilter: ["hidden"],
        collections: ["a", "hidden", "empty"],
      }),
    );
    const res = await client.getAllOwnedNfts({ status: "unlisted" });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.value.complete).toBe(true);
    expect(res.value.items).toHaveLength(47);
    expect(calls.some((c) => c.url.includes("/partners/collections/preview"))).toBe(true);
  });

  it("портфель изменился во время выгрузки: complete=false", async () => {
    const portfolio = gifts({ a: 60, b: 10 });
    const { client } = makeClient(
      ownedServer(portfolio, {
        unstable: true,
        mutate: (list, i) => {
          if (i === 3) list.push({ id: "b-new", collection_id: "b", ecn: 99, status: "unlisted" });
        },
      }),
    );
    const res = await client.getAllOwnedNfts({ status: "unlisted" });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.value.complete).toBe(false);
    expect(res.value.fetched).toBe(true);
    expect(res.value.totalCount).toBe(70);
  });

  it("ошибка запроса группы: fetched=false, найденное дополнено быстрым проходом", async () => {
    const portfolio = gifts({ a: 60, b: 10 });
    const log: PortfolioLogEntry[] = [];
    const { client } = makeClient(
      ownedServer(portfolio, {
        unstable: true,
        fail: (q) => (q.collection_ids === "b" ? json({ message: "boom" }, 500) : undefined),
      }),
    );
    const res = await client.getAllOwnedNfts({ status: "unlisted" }, { log: (e) => log.push(e) });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.value.fetched).toBe(false);
    expect(res.value.complete).toBe(false);
    expect(res.value.errors).toHaveLength(1);
    expect(res.value.errors[0].status).toBe(500);
    expect(res.value.items.length).toBeGreaterThan(0);
    expect(log.some((e) => e.level === "error" && e.error?.status === 500)).toBe(true);
  });

  it("первый подсчёт не удался → Err", async () => {
    const { client } = makeClient(() => json({ message: "down" }, 503), {
      retry: { maxRetries: 0 },
    });
    const res = await client.getAllOwnedNfts({ status: "listed" });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.status).toBe(503);
  });

  it("нет total_count → Err validation", async () => {
    const { client } = makeClient(() => json({ nfts: [] }));
    const res = await client.getAllOwnedNfts();
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.kind).toBe("validation");
  });

  it("пустой портфель", async () => {
    const { client, calls } = makeClient(ownedServer([]));
    const res = await client.getAllOwnedNfts({ status: "listed" });
    expect(res).toMatchObject({ ok: true, value: { items: [], complete: true, totalCount: 0 } });
    expect(calls).toHaveLength(1);
  });

  it("отмена signal → Err aborted", async () => {
    const controller = new AbortController();
    const portfolio = gifts({ a: 60, b: 10 });
    const server = ownedServer(portfolio, { unstable: true });
    const { client } = makeClient((call, i) => {
      if (i === 2) controller.abort();
      return server(call, i);
    });
    const res = await client.getAllOwnedNfts({}, { signal: controller.signal });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.kind).toBe("aborted");
  });

  it("фильтры передаются во все запросы", async () => {
    const { client, calls } = makeClient(ownedServer(gifts({ a: 3 }, "listed")));
    await client.getAllOwnedNfts({
      status: "listed",
      exclude_bundled: true,
      with_attributes: false,
    });
    const queries = ownedQueries(calls);
    for (const q of queries) expect(q.exclude_bundled).toBe("true");
    expect(queries[0].with_attributes).toBeUndefined();
    expect(queries[1].with_attributes).toBe("false");
  });
});

describe("groupCollections", () => {
  it("≤5 коллекций и ≤40 NFT в группе, крупные первыми", () => {
    const counts = new Map([
      ["a", 45],
      ["b", 30],
      ["c", 10],
      ["d", 5],
      ["e", 1],
      ["f", 1],
      ["g", 1],
      ["h", 1],
      ["i", 1],
    ]);
    expect(groupCollections(counts)).toEqual([["a"], ["b", "c"], ["d", "e", "f", "g", "h"], ["i"]]);
  });
});

describe("постраничные итераторы", () => {
  it("дедупликация по id между перекрывающимися страницами", async () => {
    const pages = [["a", "b"], ["b", "c"], ["d"]];
    const { client } = makeClient((_, i) =>
      json({
        nfts: pages[i].map((id) => ({
          id,
          name: id,
          photo_url: "p",
          collection_id: "c",
          external_collection_number: 1,
          status: "listed",
          attributes: [],
          is_owned: true,
        })),
        total_count: 5,
      }),
    );
    const seen: string[] = [];
    const dups: number[] = [];
    for await (const page of client.iterateOwnedNfts({}, { pageSize: 2 })) {
      expect(page.ok).toBe(true);
      if (!page.ok) return;
      seen.push(...page.value.items.map((n) => n.id));
      dups.push(page.value.duplicates);
    }
    expect(seen).toEqual(["a", "b", "c", "d"]);
    expect(dups).toEqual([0, 1, 0]);
  });

  it("одна коллекция без sort_by → external_collection_number asc", async () => {
    const { client, calls } = makeClient(() => json({ nfts: [], total_count: 0 }));
    for await (const _ of client.iterateOwnedNfts({ collection_id: "c1" })) {
      // одна страница
    }
    for await (const _ of client.iterateOwnedNfts({ collection_ids: ["a", "b"] })) {
      // одна страница
    }
    for await (const _ of client.iterateOwnedNfts({ collection_id: "c1", sort_by: "price asc" })) {
      // одна страница
    }
    const q = ownedQueries(calls);
    expect(q[0].sort_by).toBe("external_collection_number asc");
    expect(q[0].limit).toBe("50");
    expect(q[1].sort_by).toBeUndefined();
    expect(q[2].sort_by).toBe("price asc");
  });

  it("ошибка страницы отдаётся как Err и заканчивает обход", async () => {
    const { client } = makeClient((_, i) =>
      i === 0
        ? json({ results: Array.from({ length: 2 }, (_, k) => nftRow(`x${k}`)), total_count: 9 })
        : json({ message: "boom" }, 500),
    );
    const results: boolean[] = [];
    for await (const page of client.iterateSearchNfts({ collection_id: "c" }, { pageSize: 2 })) {
      results.push(page.ok);
    }
    expect(results).toEqual([true, false]);
  });

  it("maxPages и offset из params", async () => {
    const { client, calls } = makeClient(() =>
      json({ results: [nftRow("a"), nftRow("b")], total_count: 100 }),
    );
    let pages = 0;
    for await (const _ of client.iterateSearchNfts({ offset: 10 }, { pageSize: 2, maxPages: 3 })) {
      pages++;
    }
    expect(pages).toBe(3);
    const offsets = calls.map((c) => new URL(c.url).searchParams.get("offset"));
    expect(offsets).toEqual(["10", "12", "14"]);
  });
});

function nftRow(id: string): schemas.HttpmodelNft {
  return {
    id,
    name: id,
    photo_url: "p",
    collection_id: "c",
    external_collection_number: 1,
    status: "listed",
    attributes: [],
    is_owned: false,
  };
}
