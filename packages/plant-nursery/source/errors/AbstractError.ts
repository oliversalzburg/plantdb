import { Maybe } from "../tools/Maybe";

/**
 * Base class for all errors.
 */
export class AbstractError extends Error {
  /**
   * A user-friendly error message that may be transported to the client.
   */
  info: Maybe<string>;

  /**
   * An application-unique, readable error code.
   */
  code: string;

  /**
   * Another optional error that should be transported with this error.
   */
  inner: Maybe<Error>;

  /**
   * Constructs a new AbstractError.
   *
   * @param code The main identification code for the error.
   * @param message The main error message.
   * @param userFriendlyErrorMessage An optional user-friendly message that will be attached to the Error and which is allowed to be propagated to the frontend.
   */
  constructor(code: string, message = "Unknown error", userFriendlyErrorMessage?: Maybe<string>) {
    super(message);
    this.name = "AbstractError";
    this.stack = new Error().stack;

    this.info = userFriendlyErrorMessage;
    this.code = code;
  }

  static isAbstractError(error: unknown, allowForeignModule = true): error is AbstractError {
    if (error instanceof AbstractError) {
      return true;
    }

    // When multiple versions of the module containing `AbstractError` are loaded at runtime, the
    // prototypes of errors don't align. In that case, we just analyze the error code.
    if (allowForeignModule) {
      const errorRecord = error as Record<string, unknown>;
      if (
        Object(error) === error &&
        "code" in errorRecord &&
        typeof errorRecord.code === "string"
      ) {
        const codedError = error as { code: string };
        if (codedError.code.match(/^ERR_PN_/)) {
          return true;
        }
      }
    }

    return false;
  }
}
