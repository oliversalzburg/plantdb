import { Maybe } from "../tools/Maybe";
import { AbstractError } from "./AbstractError";

/**
 * Used when an unknown, non-`Error`-like object was caught and converted into a
 * real `Error` instance.
 * Like when you catch a `throw "boom"`, we will convert the caught `"boom"`
 * into an `UnknownError`.
 * To enrich an `Error`-like object that was caught, use the `InternalError`.
 */
export class UnknownError extends AbstractError {
  /**
   * Constructs a new `UnknownError`.
   *
   * @param message The main error message.
   * @param userFriendlyErrorMessage An optional user-friendly message that will
   * be attached to the Error and which is allowed to be propagated to the
   * frontend.
   */
  constructor(message: string, userFriendlyErrorMessage: Maybe<string> = undefined) {
    super("ERR_PN_UNKNOWN", message, userFriendlyErrorMessage);

    this.name = "UnknownError";
    this.stack = new Error().stack;
  }
}
