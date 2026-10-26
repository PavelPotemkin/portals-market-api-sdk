import type { z } from "zod";
import { type HttpMethod, PortalsError, type PortalsErrorKind } from "./errors";
import { GLOBAL_RATE_LIMIT, type OperationId, operations } from "./generated";
import { RateLimiter, sleep } from "./rate-limiter";
import { err, ok, type Result } from "./result";

export const DEFAULT_BASE_URL = "https://portal-market.com";
export const DEFAULT_TIMEOUT_MS = 30_000;
export const DEFAULT_RETRY = { maxRetries: 3, baseDelayMs: 1_000, maxDelayMs: 30_000 } as const;
/**
 * Общий лимит req/s на ключ, пока он неизвестен: нет `maxRps` в конфиге и ещё не было ответа
 * с ним в заголовке. Прежний глобальный лимит Partner API.
 */
export const DEFAULT_MAX_RPS = 25;

/**
 * Эндпоинты, у которых до подписок был свой лимитер поверх общего: их `X-RateLimit-Limit` —
 * лимит самого эндпоинта (market-backend partners_api/handler.go). У остальных заголовок
 * ставит общий лимитер `/partners`, это лимит ключа.
 */
const ENDPOINT_LIMITED_OPERATIONS: ReadonlySet<OperationId> = new Set<OperationId>([
  "getMarketActions",
  "getNftsSearch",
  "getNftsOwned",
  "getCollectionsBackdropsFloors",
  "getCollectionsModelsBackgroundsFloors",
  "getCollectionsFloors",
  "getCollectionsAttributeFloors",
  "getCollectionsMetrics",
  "getCollectionOffersTop",
  "getCollectionOffersAll",
  "postCollectionOffersBulkUpdate",
]);

/**
 * Необратимые операции с деньгами или гифтами. На 429 они не повторяются, а `retryable`
 * у их ошибок всегда `false`: исход нужно сверять (`getUserActions`, `getOwnedNfts`, баланс).
 */
export const IRREVERSIBLE_OPERATIONS: ReadonlySet<OperationId> = new Set<OperationId>([
  "postNfts", // buyNfts
  "postNftsWithdraw", // withdrawGifts
  "postUsersWalletsWithdraw", // withdrawTon
  "postNftsTransfer", // transferGifts
  "postCollectionOffersAccept", // acceptCollectionOffer
  "postCollectionOffers", // createCollectionOffer
  "postArenaBet", // placeArenaBet
]);

export interface RetryConfig {
  /** Сколько раз повторить запрос после 429 (default: 3). */
  maxRetries?: number;
  /** База экспоненциальной паузы без `Retry-After`, мс (default: 1000). */
  baseDelayMs?: number;
  /** Верхняя граница одной паузы, мс (default: 30000). */
  maxDelayMs?: number;
}

export interface PortalsClientConfig {
  /** Партнёрский токен; уходит заголовком `Authorization: partners <token>`. */
  token: string;
  /** Base URL, path-префикс сохраняется (default: `https://portal-market.com`). */
  baseUrl?: string;
  /** Реализация fetch (default: `globalThis.fetch`). */
  fetch?: typeof globalThis.fetch;
  /** Таймаут одной HTTP-попытки, включая чтение тела, мс; `0` — без таймаута (default: 30000). */
  timeoutMs?: number;
  /**
   * In-memory лимиты из заголовков `X-RateLimit-Limit` (default: true): общий на ключ и свой у
   * эндпоинтов, где бэкенд держит отдельный лимит.
   */
  rateLimiting?: boolean;
  /**
   * Общий лимит req/s на ключ, целое: `max_rps` тарифа подписки, лучше чуть ниже. Без него — из
   * заголовка ответов, а до первого такого ответа — `DEFAULT_MAX_RPS`.
   */
  maxRps?: number;
  /** Повторы на 429. */
  retry?: RetryConfig;
}

export interface RequestOptions {
  /** Отмена всего вызова, включая ожидание лимитера и паузы между повторами. */
  signal?: AbortSignal;
  /** Таймаут одной попытки для этого вызова, мс; `0` — без таймаута. */
  timeoutMs?: number;
}

export interface CallArgs {
  pathParams?: Record<string, string | number>;
  query?: object;
  body?: unknown;
}

type Operations = typeof operations;

/** Тип успешного результата операции: вывод схемы ответа или `undefined` для 204. */
export type OperationOutput<Id extends OperationId> =
  Operations[Id]["response"] extends z.ZodType<infer T> ? T : undefined;

class AbortedByCaller {}
class AttemptTimeout {}

function raceAbort<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) return Promise.reject(signal.reason);
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(signal.reason);
    signal.addEventListener("abort", onAbort, { once: true });
    promise.then(
      (value) => {
        signal.removeEventListener("abort", onAbort);
        resolve(value);
      },
      (error) => {
        signal.removeEventListener("abort", onAbort);
        reject(error);
      },
    );
  });
}

/** Сериализация query: массивы через запятую; undefined, null, "" и пустые массивы пропускаются. */
export function serializeQuery(params: object | undefined): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [name, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      search.set(name, value.map(String).join(","));
    } else {
      search.set(name, String(value));
    }
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}

/** Пауза перед повтором после 429: `Retry-After` (секунды или HTTP-date) или экспонента с джиттером. */
export function retryDelayMs(
  retryAfter: string | null,
  attempt: number,
  retry: Required<RetryConfig>,
  now = Date.now(),
  random = Math.random,
): number {
  let delay: number | undefined;
  const header = retryAfter?.trim();
  if (header) {
    if (/^\d+(\.\d+)?$/.test(header)) {
      delay = Number(header) * 1000;
    } else {
      const date = Date.parse(header);
      if (!Number.isNaN(date)) delay = Math.max(0, date - now);
    }
  }
  if (delay === undefined) {
    const exp = retry.baseDelayMs * 2 ** (attempt - 1);
    delay = exp / 2 + random() * (exp / 2);
  } else {
    delay += random() * Math.min(100, retry.baseDelayMs);
  }
  return Math.min(Math.max(0, delay), retry.maxDelayMs);
}

function messageOf(data: unknown): string | undefined {
  if (data && typeof data === "object" && "message" in data) {
    const message = (data as { message: unknown }).message;
    if (typeof message === "string" && message) return message;
  }
  return undefined;
}

function codeOf(data: unknown): string | undefined {
  if (data && typeof data === "object" && "code" in data) {
    const code = (data as { code: unknown }).code;
    if (typeof code === "string" && code) return code;
  }
  return undefined;
}

function issuesText(issues: z.core.$ZodIssue[]): string {
  const shown = issues
    .slice(0, 3)
    .map((i) => `${i.path.length ? i.path.join(".") : "(root)"}: ${i.message}`);
  if (issues.length > 3) shown.push(`… +${issues.length - 3}`);
  return shown.join("; ");
}

export class Transport {
  private readonly token: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof globalThis.fetch;
  private readonly timeoutMs: number;
  private readonly rateLimiting: boolean;
  private readonly maxRps: number | undefined;
  private observedKeyLimit: number | undefined;
  private readonly endpointLimits = new Map<OperationId, number>();
  private readonly retry: Required<RetryConfig>;
  readonly rateLimiter = new RateLimiter();

  constructor(config: PortalsClientConfig) {
    if (!config || typeof config.token !== "string" || !config.token) {
      throw new TypeError("PortalsMarketClient: token is required");
    }
    const fetchImpl = config.fetch ?? globalThis.fetch?.bind(globalThis);
    if (typeof fetchImpl !== "function") {
      throw new TypeError("PortalsMarketClient: fetch is not available, pass config.fetch");
    }
    const baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    if (!/^https?:\/\/[^/]/i.test(baseUrl)) {
      throw new TypeError(`PortalsMarketClient: invalid baseUrl ${config.baseUrl}`);
    }
    this.token = config.token;
    this.baseUrl = baseUrl;
    this.fetchImpl = fetchImpl;
    this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.rateLimiting = config.rateLimiting ?? true;
    if (config.maxRps !== undefined && !(Number.isInteger(config.maxRps) && config.maxRps > 0)) {
      throw new TypeError(
        `PortalsMarketClient: maxRps must be a positive integer, got ${config.maxRps}`,
      );
    }
    this.maxRps = config.maxRps;
    this.retry = { ...DEFAULT_RETRY, ...stripUndefined(config.retry ?? {}) };
  }

  /** Выполнить операцию спеки. Никогда не бросает: любая ошибка — `Err<PortalsError>`. */
  async call<Id extends OperationId>(
    id: Id,
    args: CallArgs = {},
    options: RequestOptions = {},
  ): Promise<Result<OperationOutput<Id>, PortalsError>> {
    const op = operations[id];
    const method = op.method as HttpMethod;
    const irreversible = IRREVERSIBLE_OPERATIONS.has(id);
    let endpoint: string = op.path;
    let attempts = 0;

    const fail = (
      kind: PortalsErrorKind,
      message: string,
      extra: Partial<ConstructorParameters<typeof PortalsError>[0]> = {},
    ) =>
      err(
        new PortalsError({
          kind,
          method,
          endpoint,
          message: `${method} ${endpoint}: ${message}`,
          attempts,
          ...extra,
          retryable: irreversible ? false : (extra.retryable ?? false),
        }),
      );

    try {
      // Путь.
      for (const name of op.pathParams as readonly string[]) {
        const value = args.pathParams?.[name];
        if (value === undefined || value === null || String(value) === "") {
          return fail("request", `path parameter ${name} is required`);
        }
        endpoint = endpoint.replace(`{${name}}`, encodeURIComponent(String(value)));
      }

      // Валидация входа: до сети.
      let query: object | undefined;
      if (op.query) {
        const parsed = (op.query as z.ZodType).safeParse(args.query ?? {});
        if (!parsed.success) {
          return fail("request", `invalid query: ${issuesText(parsed.error.issues)}`, {
            issues: parsed.error.issues,
          });
        }
        query = parsed.data as object;
      }
      let body: string | undefined;
      if (op.body) {
        const parsed = (op.body as z.ZodType).safeParse(args.body);
        if (!parsed.success) {
          return fail("request", `invalid body: ${issuesText(parsed.error.issues)}`, {
            issues: parsed.error.issues,
          });
        }
        body = JSON.stringify(parsed.data);
      }

      const url = `${this.baseUrl}${endpoint}${serializeQuery(query)}`;
      const headers: Record<string, string> = {
        Accept: "application/json",
        Authorization: `partners ${this.token}`,
      };
      if (body !== undefined) headers["Content-Type"] = "application/json";

      const userSignal = options.signal;
      const timeoutMs = options.timeoutMs ?? this.timeoutMs;
      const maxAttempts = irreversible ? 1 : 1 + Math.max(0, this.retry.maxRetries);

      for (;;) {
        if (userSignal?.aborted) return fail("aborted", "aborted by caller");
        if (this.rateLimiting) {
          try {
            const endpointLimit = this.endpointLimits.get(id) ?? op.rateLimit;
            if (endpointLimit !== undefined) {
              await this.rateLimiter.wait(id, endpointLimit, userSignal);
            }
            await this.rateLimiter.wait("__global__", this.keyRateLimit(), userSignal);
          } catch (cause) {
            return fail("aborted", "aborted by caller while waiting for rate limiter", { cause });
          }
        }

        attempts++;
        const attemptController = new AbortController();
        const timer =
          timeoutMs > 0 && Number.isFinite(timeoutMs)
            ? setTimeout(() => attemptController.abort(new AttemptTimeout()), timeoutMs)
            : undefined;
        const onUserAbort = () => attemptController.abort(new AbortedByCaller());
        userSignal?.addEventListener("abort", onUserAbort, { once: true });
        const signal = attemptController.signal;

        let res: Response;
        let text: string;
        try {
          res = await raceAbort(this.fetchImpl(url, { method, headers, body, signal }), signal);
          try {
            text = await raceAbort(res.text(), signal);
          } catch (cause) {
            return this.transportFailure(
              fail,
              cause,
              userSignal,
              signal,
              res.status,
              "reading body",
            );
          }
        } catch (cause) {
          return this.transportFailure(fail, cause, userSignal, signal, undefined, "request");
        } finally {
          if (timer !== undefined) clearTimeout(timer);
          userSignal?.removeEventListener("abort", onUserAbort);
        }

        this.observeRateLimit(id, res.headers);

        if (res.status === 429 && attempts < maxAttempts) {
          const delay = retryDelayMs(res.headers.get("retry-after"), attempts, this.retry);
          try {
            await sleep(delay, userSignal);
          } catch (cause) {
            return fail("aborted", "aborted by caller while waiting to retry after 429", {
              cause,
              status: 429,
            });
          }
          continue;
        }

        return this.handleResponse(id, res, text, fail);
      }
    } catch (cause) {
      return fail("network", `unexpected error: ${String(cause)}`, { cause });
    }
  }

  private keyRateLimit(): number {
    return this.maxRps ?? this.observedKeyLimit ?? GLOBAL_RATE_LIMIT ?? DEFAULT_MAX_RPS;
  }

  /**
   * Заголовок пишет последний лимитер, через который прошёл запрос: у эндпоинта со своим
   * лимитером это его лимит, у остальных — лимит ключа.
   */
  private observeRateLimit(id: OperationId, headers: Headers): void {
    const value = Number(headers.get("x-ratelimit-limit"));
    if (!Number.isInteger(value) || value <= 0) return;
    if (ENDPOINT_LIMITED_OPERATIONS.has(id)) this.endpointLimits.set(id, value);
    else this.observedKeyLimit = value;
  }

  private transportFailure(
    fail: (
      kind: PortalsErrorKind,
      message: string,
      extra?: Partial<ConstructorParameters<typeof PortalsError>[0]>,
    ) => Result<never, PortalsError>,
    cause: unknown,
    userSignal: AbortSignal | undefined,
    attemptSignal: AbortSignal,
    status: number | undefined,
    stage: string,
  ): Result<never, PortalsError> {
    if (userSignal?.aborted) return fail("aborted", `aborted by caller (${stage})`, { status });
    if (attemptSignal.reason instanceof AttemptTimeout) {
      return fail("timeout", `timed out (${stage})`, { status, retryable: true });
    }
    const reason = cause instanceof Error ? cause.message : String(cause);
    return fail("network", `network error (${stage}): ${reason}`, {
      cause,
      status,
      retryable: true,
    });
  }

  private handleResponse<Id extends OperationId>(
    id: Id,
    res: Response,
    text: string,
    fail: (
      kind: PortalsErrorKind,
      message: string,
      extra?: Partial<ConstructorParameters<typeof PortalsError>[0]>,
    ) => Result<never, PortalsError>,
  ): Result<OperationOutput<Id>, PortalsError> {
    const op = operations[id];
    let data: unknown;
    let parsedJson = false;
    try {
      data = JSON.parse(text);
      parsedJson = true;
    } catch {
      data = undefined;
    }

    if (!res.ok) {
      const status = res.status;
      const detail = messageOf(data) ?? (res.statusText || "request failed");
      return fail("http", `HTTP ${status}: ${detail}`, {
        status,
        code: codeOf(data),
        body: text,
        data,
        retryable:
          status === 429 ||
          status === 408 ||
          status === 502 ||
          status === 503 ||
          status === 504 ||
          status === 500,
      });
    }

    if (op.response === null) {
      return ok(undefined as OperationOutput<Id>);
    }

    if (!parsedJson) {
      return fail("parse", `HTTP ${res.status}: response is not JSON`, {
        status: res.status,
        body: text,
      });
    }

    const parsed = (op.response as z.ZodType).safeParse(data);
    if (!parsed.success) {
      return fail(
        "validation",
        `response does not match schema: ${issuesText(parsed.error.issues)}`,
        { status: res.status, body: text, data, issues: parsed.error.issues },
      );
    }
    return ok(parsed.data as OperationOutput<Id>);
  }
}

function stripUndefined<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as Partial<T>;
}
