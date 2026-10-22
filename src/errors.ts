import type { z } from "zod";

/**
 * Вид ошибки:
 * - `http` — бэкенд ответил не-2xx (`status`, `code`, `body`, `data`);
 * - `network` — fetch упал или оборвалось чтение тела;
 * - `timeout` — истёк `timeoutMs` попытки;
 * - `aborted` — сработал `signal` вызывающего;
 * - `parse` — 2xx с телом, которое не JSON (`body`);
 * - `validation` — 2xx JSON, не прошедший схему ответа (`data`, `issues`);
 * - `request` — аргументы не прошли схему запроса, запрос не отправлялся (`issues`).
 */
export type PortalsErrorKind =
  | "http"
  | "network"
  | "timeout"
  | "aborted"
  | "parse"
  | "validation"
  | "request";

export type HttpMethod = "GET" | "POST";

export interface PortalsErrorInit {
  kind: PortalsErrorKind;
  message: string;
  method: HttpMethod;
  endpoint: string;
  status?: number;
  code?: string;
  body?: string;
  data?: unknown;
  issues?: z.core.$ZodIssue[];
  retryable?: boolean;
  attempts?: number;
  cause?: unknown;
}

/** Единственный класс ошибок SDK. */
export class PortalsError extends Error {
  override readonly name = "PortalsError";
  readonly kind: PortalsErrorKind;
  /** HTTP-метод запроса. */
  readonly method: HttpMethod;
  /** Путь запроса без base URL и query, с подставленными параметрами. */
  readonly endpoint: string;
  /** HTTP-статус (для `http`, `parse`, `validation`). */
  readonly status?: number;
  /** `code` из тела ошибки бэкенда (`exerr.HttpError`). */
  readonly code?: string;
  /** Сырое тело ответа, если его удалось прочитать. */
  readonly body?: string;
  /** Тело ответа, разобранное как JSON. Для `validation` — данные, не прошедшие схему. */
  readonly data?: unknown;
  /** Ошибки схемы для `validation` и `request`. */
  readonly issues?: z.core.$ZodIssue[];
  /**
   * Повтор того же вызова безопасен и может пройти. Всегда `false` для необратимых операций
   * (покупка, вывод, передача, офферы): их исход нужно сверять, а не повторять вслепую.
   */
  readonly retryable: boolean;
  /** Сколько HTTP-попыток было сделано (0 — запрос не отправлялся). */
  readonly attempts: number;

  constructor(init: PortalsErrorInit) {
    super(init.message, init.cause === undefined ? undefined : { cause: init.cause });
    this.kind = init.kind;
    this.method = init.method;
    this.endpoint = init.endpoint;
    this.status = init.status;
    this.code = init.code;
    this.body = init.body;
    this.data = init.data;
    this.issues = init.issues;
    this.retryable = init.retryable ?? false;
    this.attempts = init.attempts ?? 0;
  }

  get isRateLimited(): boolean {
    return this.kind === "http" && this.status === 429;
  }

  get isNotFound(): boolean {
    return this.kind === "http" && this.status === 404;
  }

  get isUnauthorized(): boolean {
    return this.kind === "http" && this.status === 401;
  }
}
