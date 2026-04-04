import {
  ApiError,
  HttpError,
  NetworkError as PortalsNetworkError,
  ResponseValidationError as PortalsValidationError,
} from "@pavelpotemkin/utils";

export { HttpError as PortalsError, PortalsNetworkError, PortalsValidationError };

export class PortalsApiError extends ApiError {
  get isValidationError() {
    return this.status === 422;
  }
}

export class PortalsRateLimitError extends HttpError {
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
