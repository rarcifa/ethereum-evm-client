/**
 * The response to a JSON-RPC request.
 *
 * @typeParam T - The type of the result, which depends on the method called.
 */
export interface JsonRpcResponse<T> {
  /** Version of the JSON-RPC protocol, `2.0`. */
  jsonrpc: string;

  /** Identifier of the request this response answers. */
  id: number;

  /** The result of the request, when it succeeded. */
  result?: T;

  /** The error of the request, when it failed. */
  error?: JsonRpcError;
}

/**
 * The error member of a failed JSON-RPC response.
 */
export interface JsonRpcError {
  /** Numeric code of the error, such as `-32000`. */
  code: number;

  /** Readable description of the error. */
  message: string;

  /** Additional data about the error, such as revert data. */
  data?: unknown;
}
