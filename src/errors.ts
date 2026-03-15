import {
  HttpError,
  ApiError,
  ResponseValidationError as PortalsValidationError,
  NetworkError as PortalsNetworkError,
} from "@pavelpotemkin/utils";

export { HttpError as PortalsError };
export { PortalsValidationError };
export { PortalsNetworkError };

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
