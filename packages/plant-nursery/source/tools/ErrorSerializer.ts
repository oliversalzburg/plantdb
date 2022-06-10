import { AbstractError, InternalError, UnknownError } from "../errors";

export type SerializedError = Record<string, Record<string, string> | string | undefined>;

/**
 * Given any object, turns it into an `Error` instance.
 * Ideally, the passed object is already an `Error`.
 *
 * @param subject The object to turn into an `Error`.
 */
export function unknownToError(subject: unknown): AbstractError {
  if (AbstractError.isAbstractError(subject)) {
    return subject;
  }

  if (isError(subject)) {
    return InternalError.fromError(subject);
  }

  return new UnknownError(String(subject));
}

/**
 * Determine if the passed object is an `Error`.
 *
 * @param subject The object to evaluate.
 */
export function isError(subject: unknown): subject is Error {
  return subject instanceof Error;
}

export class ErrorSerializer {
  static toJSON(error: Error): string {
    return JSON.stringify(error, Object.getOwnPropertyNames(error));
  }

  static toRecord(error: Error): Record<string, unknown> {
    const record: Record<string, unknown> = {};
    for (const propertyName of Object.getOwnPropertyNames(error)) {
      record[propertyName] = error[propertyName as keyof typeof error];
    }
    return record;
  }

  static toSimpleSerializable<TError extends AbstractError = AbstractError>(
    error: TError
  ): SerializedError {
    const serialized: SerializedError = {
      code: error.code,
      message: error.message,
      name: error.name,
      stack: error.stack,
    };

    return serialized;
  }
}
