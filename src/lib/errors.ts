/**
 * Base class of every error the client throws. Its message is `[context] error: description`.
 *
 * @example
 * ```ts
 * try {
 *   await client.erc20.getName('0xCONTRACT_ADDRESS');
 * } catch (error) {
 *   if (error instanceof EvmClientError) {
 *     console.error(error.context, error.message);
 *   }
 * }
 * ```
 */
export class EvmClientError extends Error {
  /** The method that detected the problem, such as `erc20/getName` or `format/encodeAddress`. */
  readonly context: string;

  /**
   * Creates an error for the method that detected the problem.
   *
   * @param context - The method that detected the problem, such as `erc20/getName`.
   * @param description - What went wrong.
   * @param options - Optional. The `cause` of the error, when it wraps another error.
   */
  constructor(context: string, description: string, options?: ErrorOptions) {
    super(`[${context}] error: ${description}`, options);
    this.name = 'EvmClientError';
    this.context = context;
  }
}

/**
 * Error thrown when an argument is invalid, before any request is sent.
 *
 * @example
 * ```ts
 * await client.erc20.getName('0x123'); // InvalidArgumentError: [format/checkAddress] error: Invalid address: 0x123
 * ```
 */
export class InvalidArgumentError extends EvmClientError {
  /**
   * Creates an error for an invalid argument.
   *
   * @param context - The method that rejected the argument, such as `format/encodeAddress`.
   * @param description - What is wrong with the argument.
   */
  constructor(context: string, description: string) {
    super(context, description);
    this.name = 'InvalidArgumentError';
  }
}

/**
 * Error thrown when a request gets no usable answer: a network failure, a timeout, or an HTTP error status without a
 * JSON-RPC error.
 *
 * @example
 * ```ts
 * if (error instanceof RequestError) {
 *   // retry later: the node could not be reached
 * }
 * ```
 */
export class RequestError extends EvmClientError {
  /**
   * Creates an error for a failed request.
   *
   * @param context - The method that sent the request, such as `erc20/getName`.
   * @param description - Why the request failed.
   * @param options - Optional. The `cause` of the error, such as the HTTP client error.
   */
  constructor(context: string, description: string, options?: ErrorOptions) {
    super(context, description, options);
    this.name = 'RequestError';
  }
}

/**
 * Error thrown when the JSON-RPC node answers a request with an error object, whatever the HTTP status.
 *
 * @example
 * ```ts
 * if (error instanceof RpcError && error.code === -32000) {
 *   // the call reverted
 * }
 * ```
 */
export class RpcError extends EvmClientError {
  /** The JSON-RPC error code returned by the node. */
  readonly code: number;

  /** Additional error data returned by the node, such as revert data. */
  readonly data?: unknown;

  /**
   * Creates an error from the JSON-RPC error of a response.
   *
   * @param context - The method that sent the request, such as `erc20/getName`.
   * @param code - The JSON-RPC error code.
   * @param message - The JSON-RPC error message.
   * @param data - Optional. Additional error data.
   */
  constructor(context: string, code: number, message: string, data?: unknown) {
    super(context, message);
    this.name = 'RpcError';
    this.code = code;
    this.data = data;
  }
}

/**
 * Error thrown when the node answers, but the answer is not valid: not JSON-RPC, no result, or a result that does not
 * decode to the expected value.
 *
 * @example
 * ```ts
 * if (error instanceof InvalidResponseError) {
 *   // the address is not a contract of the expected standard, or the endpoint is not a JSON-RPC node
 * }
 * ```
 */
export class InvalidResponseError extends EvmClientError {
  /**
   * Creates an error for an invalid answer.
   *
   * @param context - The method that rejected the answer, such as `format/decodeAddress`.
   * @param description - What is wrong with the answer.
   * @param options - Optional. The `cause` of the error, when it wraps another error.
   */
  constructor(context: string, description: string, options?: ErrorOptions) {
    super(context, description, options);
    this.name = 'InvalidResponseError';
  }
}
