/**
 * The payload of a JSON-RPC request.
 */
export interface JsonRpcRequestPayload {
  /** Version of the JSON-RPC protocol, `2.0`. */
  jsonrpc: string;

  /** The method invoked on the node, such as `eth_call`. */
  method: string;

  /** The call object or account address, then the block tag. */
  params: [RpcParams, string];

  /** Identifier that matches the response to this request. */
  id: number;
}

/**
 * The first parameter of a JSON-RPC call: a call object, with the contract address and the call data, or an account
 * address.
 */
export type RpcParams = { to: string; data: string } | string;
