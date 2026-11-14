/**
 * Error thrown when the JSON-RPC node answers a request with an error object.
 *
 * @example
 * ```ts
 * try {
 *   await client.erc20.getName('0xCONTRACT_ADDRESS');
 * } catch (e) {
 *   if (e instanceof RpcError) {
 *     console.error(e.code, e.message);
 *   }
 * }
 * ```
 */
export class RpcError extends Error {
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
    super(`[${context}] error: ${message}`);
    this.name = 'RpcError';
    this.code = code;
    this.data = data;
  }
}
