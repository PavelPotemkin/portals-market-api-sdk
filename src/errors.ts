import type { ZodError } from "zod";

export class PortalsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PortalsError";
  }
}

export class PortalsApiError extends PortalsError {
  readonly status: number;
  readonly statusText: string;
  readonly body: unknown;
  readonly endpoint: string;

  constructor(params: {
    status: number;
    statusText: string;
    body: unknown;
    endpoint: string;
  }) {
    const apiMessage =
      params.body &&
      typeof params.body === "object" &&
      "message" in params.body &&
      typeof (params.body as Record<string, unknown>).message === "string"
        ? (params.body as Record<string, string>).message
        : params.statusText;

    super(`[${params.status}] ${params.endpoint}: ${apiMessage}`);
    this.name = "PortalsApiError";
    this.status = params.status;
    this.statusText = params.statusText;
    this.body = params.body;
    this.endpoint = params.endpoint;
  }

  get isBadRequest() {
    return this.status === 400;
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isNotFound() {
    return this.status === 404;
  }

  get isValidationError() {
    return this.status === 422;
  }

  get isServerError() {
    return this.status >= 500;
  }

  get isRateLimited() {
    return this.status === 429;
  }
}

export class PortalsValidationError extends PortalsError {
  readonly zodError: ZodError;
  readonly endpoint: string;
  readonly rawData: unknown;

  constructor(params: {
    zodError: ZodError;
    endpoint: string;
    rawData: unknown;
  }) {
    super(
      `Response validation failed for ${params.endpoint}: ${params.zodError.message}`,
    );
    this.name = "PortalsValidationError";
    this.zodError = params.zodError;
    this.endpoint = params.endpoint;
    this.rawData = params.rawData;
  }
}

export class PortalsRateLimitError extends PortalsError {
  readonly endpoint: string;
  readonly limit: number;
  readonly retryAfterMs: number;

  constructor(params: {
    endpoint: string;
    limit: number;
    retryAfterMs: number;
  }) {
    super(
      `Rate limit exceeded for ${params.endpoint}: ${params.limit} req/s, retry after ${params.retryAfterMs}ms`,
    );
    this.name = "PortalsRateLimitError";
    this.endpoint = params.endpoint;
    this.limit = params.limit;
    this.retryAfterMs = params.retryAfterMs;
  }
}

export class PortalsNetworkError extends PortalsError {
  readonly cause: Error;
  readonly endpoint: string;

  constructor(params: { cause: Error; endpoint: string }) {
    super(`Network error for ${params.endpoint}: ${params.cause.message}`);
    this.name = "PortalsNetworkError";
    this.cause = params.cause;
    this.endpoint = params.endpoint;
  }
}
