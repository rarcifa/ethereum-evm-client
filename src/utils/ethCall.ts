import type {
  JsonRpcRequestPayload,
  RpcParams,
} from '../lib/interfaces/jsonRpcRequest.js';

/**
 * Creates the payload of a JSON-RPC request, such as `eth_call`.
 *
 * @param params - The call object, with the `to` and `data` properties, or an account address.
 * @param method - The JSON-RPC method to invoke, such as `eth_call` or `eth_getBalance`.
 * @param tag - Optional. The block tag of the state to query, such as `latest`, `earliest` or `pending`. Defaults to
 * `latest`.
 * @param id - Optional. The identifier that matches the response to the request. Defaults to `1`.
 * @returns The JSON-RPC payload.
 *
 * @example
 * ```ts
 * const data = constructEthMethodPayload(
 *   {
 *     to: '0xCONTRACT_ADDRESS',
 *     data: '0x6352211e',
 *   },
 *   'eth_call'
 * );
 * ```
 */
export const constructEthMethodPayload = (
  params: RpcParams,
  method: string,
  tag: string = 'latest',
  id: number = 1
): JsonRpcRequestPayload => {
  return {
    jsonrpc: '2.0',
    method,
    params: [params, tag],
    id,
  };
};
