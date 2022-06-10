import { Maybe } from "../tools/Maybe";
import { AbstractError } from "./AbstractError";

/**
 * Used when an `Error`-like object was caught and converted into an
 * implementation of `AbstractError` for further processing.
 */
export class InternalError extends AbstractError {
  /**
   * Constructs a new `InternalError`.
   *
   * @param message The main error message.
   * @param userFriendlyErrorMessage An optional user-friendly message that will
   * be attached to the Error and which is allowed to be propagated to the
   * frontend.
   */
  constructor(message: string, userFriendlyErrorMessage: Maybe<string> = undefined) {
    super("ERR_PN_INTERNAL", message, userFriendlyErrorMessage);

    this.name = "InternalError";
    this.stack = new Error().stack;
  }

  static fromError(error: Error): InternalError {
    // Create a _real_ `InternalError` instance, which we will return later.
    const internalError = new InternalError(error.message);
    // Assign the error to it, to inherit all the fields in the error.
    // Then assign another `InternalError` to replace key fields, like:
    // name, code, status, ...
    Object.assign(internalError, error, new InternalError(error.message));
    // Set the inner error.
    internalError.inner = error;
    // Inherit the original error stack again.
    internalError.stack = error.stack;

    return internalError;
  }
}
