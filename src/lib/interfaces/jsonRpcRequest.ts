/**
 * Interface representing the structure of a JSON-RPC request payload.
 *
 * @interface
 * @property {string} jsonrpc - Version of the JSON-RPC protocol used (e.g., "2.0").
 * @property {string} method - Method being invoked on the JSON-RPC server.
 * @property {[RpcParams, string]} params - Parameters to be passed to the method: the call object or account address, and the block tag.
 * @property {number} id - Unique identifier for the request, which can be used to match the response with this request.
 */
export interface JsonRpcRequestPayload {
  jsonrpc: string;
  method: string;
  params: [RpcParams, string];
  id: number;
}

/**
 * Type representing the parameters that can be passed to an RPC call.
 *
 * @type Parameters when targeting a specific contract with call data, or an account address.
 */
export type RpcParams = { to: string; data: string } | string;
