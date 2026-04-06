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
