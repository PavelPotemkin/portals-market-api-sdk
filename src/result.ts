import type { PortalsError } from "./errors";

/** Успешный результат. */
export interface Ok<T> {
  readonly ok: true;
  readonly value: T;
}

/** Ошибка. */
export interface Err<E> {
  readonly ok: false;
  readonly error: E;
}

/** Результат операции: методы SDK не бросают исключений, а возвращают `Result`. */
export type Result<T, E = PortalsError> = Ok<T> | Err<E>;

export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}

export function err<E>(error: E): Err<E> {
  return { ok: false, error };
}

export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.ok;
}

export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return !result.ok;
}

/**
 * Значение успешного результата. Для ошибки бросает её саму, если это `Error`,
 * иначе `Error` с её текстом в `cause`.
 */
export function unwrap<T, E>(result: Result<T, E>): T {
  if (result.ok) return result.value;
  if (result.error instanceof Error) throw result.error;
  throw new Error(`unwrap() on Err: ${String(result.error)}`, { cause: result.error });
}
