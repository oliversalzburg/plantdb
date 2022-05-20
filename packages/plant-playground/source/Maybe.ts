import { ConstructorOf } from "./Mixins";

export type Nil = null | undefined;

/**
 * A type that may exist. Usually, this would be a nullable.
 */
export type Maybe<T> = T | Nil;

/**
 * Check if something is a concrete value of the given type.
 * Can be used as a typeguard.
 *
 * @param nilable The subject that could be nil.
 * @param InstanceType The constructor of the type to check for.
 */
export function is<T>(nilable: Maybe<T>, InstanceType: ConstructorOf<T>): nilable is T {
  return !isNil(nilable) && nilable instanceof InstanceType;
}

/**
 * Check if something is Nil.
 * Can be used as a typeguard.
 *
 * @param nilable The subject that could be nil.
 */
export function isNil<T>(nilable: Maybe<T>): nilable is Nil {
  return nilable === null || nilable === undefined;
}

/**
 * Convert a nilable into an optional argument.
 * This means `null` is normalized to `undefined`.
 *
 * @param nilable The subject to convert to an optional.
 */
export function toOptional<T>(nilable: Maybe<T>): T | undefined {
  if (isNil(nilable)) {
    return undefined;
  }
  return nilable;
}

/**
 * Convert a nilable into a real value, if it is nil.
 *
 * @param nilable The subject to convert to an optional.
 * @param to The type to coalesce to.
 */
export function coalesce<T>(nilable: Maybe<T>, to: T): T {
  if (isNil(nilable)) {
    return to;
  }
  return nilable;
}

/**
 * Drop all nil values from an array.
 *
 * @param nilables The subject to convert.
 * @param to The type to coalesce to.
 */
export function coalesceArray<T>(nilables: Array<Maybe<T>>, to?: Maybe<T>): Array<T> {
  const result = new Array<T>();
  for (const nilable of nilables) {
    if (!isNil(nilable)) {
      result.push(nilable);
    } else if (!isNil(to)) {
      result.push(to);
    }
  }
  return result;
}

export class UnexpectedNilError extends Error {
  constructor(message = "unexpected nil value") {
    super(message);
  }
}

/**
 * Ensure that the passed subject is not nil; throw otherwise.
 *
 * @param subject A subject that is possible nil.
 */
export function mustExist<T>(subject: Maybe<T>): T {
  if (isNil(subject)) {
    throw new UnexpectedNilError();
  }
  return subject;
}

/**
 * Ensure that the passed subject is not nil; throw otherwise.
 *
 * @param subject A subject that is possible nil.
 */
export function assertExists<T>(subject: Maybe<T>): asserts subject is T {
  if (isNil(subject)) {
    throw new UnexpectedNilError();
  }
}
