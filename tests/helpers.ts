import { type PortalsClientConfig, PortalsMarketClient } from "../src";

export interface RecordedCall {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string | undefined;
  signal: AbortSignal | undefined;
}

export type Handler = (call: RecordedCall, index: number) => Response | Promise<Response>;

export function recordingFetch(handler: Handler) {
  const calls: RecordedCall[] = [];
  const fetch = async (input: string | URL | Request, init: RequestInit = {}) => {
    const call: RecordedCall = {
      url: String(input),
      method: init.method ?? "GET",
      headers: { ...(init.headers as Record<string, string>) },
      body: typeof init.body === "string" ? init.body : undefined,
      signal: init.signal ?? undefined,
    };
    calls.push(call);
    return handler(call, calls.length - 1);
  };
  return { fetch: fetch as typeof globalThis.fetch, calls };
}

export function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

export function noContent(): Response {
  return new Response(null, { status: 204 });
}

export function makeClient(handler: Handler, config: Partial<PortalsClientConfig> = {}) {
  const { fetch, calls } = recordingFetch(handler);
  const client = new PortalsMarketClient({
    token: "test-token",
    rateLimiting: false,
    fetch,
    ...config,
  });
  return { client, calls };
}

export const nft = {
  id: "n1",
  name: "Plush Pepe",
  photo_url: "https://example.com/p.png",
  collection_id: "c1",
  external_collection_number: 1,
  status: "listed",
  attributes: [{ type: "model", value: "Cool", rarity_per_mille: 10 }],
  is_owned: true,
};

export const offerItem = {
  id: "o1",
  amount: "3.5",
  collection_id: "c1",
  current_nfts: 0,
  max_nfts: 2,
  status: "pending",
  scope: { models: ["Cool"], backdrops: [], symbols: [] },
};

/** Путь и разобранный query из URL запроса. */
export function parseUrl(url: string) {
  const u = new URL(url);
  return {
    origin: u.origin,
    path: u.pathname,
    query: Object.fromEntries(u.searchParams),
    search: u.search,
  };
}
