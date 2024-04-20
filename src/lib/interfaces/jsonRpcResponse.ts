/**
 * Interface representing the structure of a JSON-RPC response.
 *
 * @interface
 * @template T The type of the result contained in the response.
 * @property {string} jsonrpc - The version of the JSON-RPC protocol used (e.g., "2.0").
 * @property {number} id - A unique identifier matching the original request ID.
 * @property {T} result - Optional. The result of the RPC call if successful. The type of the result is generic and depends on the specific RPC method called.
 * @property {JsonRpcError} error - Optional. An error object containing details about the error if the RPC call failed.
 */
export interface JsonRpcResponse<T> {
  jsonrpc: string;
  id: number;
  result?: T;
  error?: JsonRpcError;
}

/**
 * Interface defining the structure of an error in a JSON-RPC response.
 *
 * @interface
 * @property {number} code - Numeric error code indicating the type of error that occurred.
 * @property {string} message - Human-readable string describing the error.
 * @property {any} data - Optional. Additional data related to the error. This can be any type and contains context-specific error information.
 */
export interface JsonRpcError {
  code: number;
  message: string;
  data?: any;
}
