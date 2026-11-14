import type { AxiosInstance } from 'axios';

import { RpcError } from '../lib/errors.js';
import type {
  JsonRpcRequestPayload,
  RpcParams,
} from '../lib/interfaces/jsonRpcRequest.js';
import type { JsonRpcResponse } from '../lib/interfaces/jsonRpcResponse.js';

/**
 * This function creates the payload necessary for making JSON-RPC calls such as `eth_call`.
 *
 * @param {RpcParams} params - An object containing the 'to' and 'data' properties for the RPC call, or an account address.
 * @param {string} method - The JSON-RPC method to be invoked (e.g., 'eth_call', 'eth_getBalance').
 * @param {string} [tag='latest'] - The block number tag specifying the state to query. Common values are 'latest', 'earliest', or 'pending'.
 * @param {number} [id=1] - A unique identifier for the JSON-RPC request, used to match responses with requests.
 * @returns {JsonRpcRequestPayload} The JSON-RPC payload formatted as an object.
 *
 * @example
 * const data = constructEthMethodPayload(
 *  {
 *   to: '0xCONTRACT_ADDRESS',
 *   data: '0x6352211e',
 *  },
 *  'eth_call'
 * );
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

/**
 * Sends a JSON-RPC request and returns its result.
 *
 * @param {AxiosInstance} ethereumInstance - The ethereum client used to send the request.
 * @param {JsonRpcRequestPayload} data - The JSON-RPC payload, built with `constructEthMethodPayload`.
 * @param {string} context - The method sending the request, such as `erc20/getName`. Every error message starts with it.
 * @returns {Promise<string>} The result of the request.
 * @throws {RpcError} When the node answers with a JSON-RPC error.
 * @throws {Error} When the request fails, or the node returns no result (`0x` for a call to an address without code).
 *
 * @example
 * const result = await sendEthRequest(ethereumInstance, data, 'erc20/getName');
 */
export const sendEthRequest = async (
  ethereumInstance: AxiosInstance,
  data: JsonRpcRequestPayload,
  context: string
): Promise<string> => {
  let response: JsonRpcResponse<string>;

  try {
    ({ data: response } = await ethereumInstance.post<JsonRpcResponse<string>>(
      '',
      data
    ));
  } catch (e) {
    const reason = e instanceof Error ? e.message : String(e);
    throw new Error(`[${context}] error: ${reason}`, { cause: e });
  }

  if (response.error) {
    throw new RpcError(
      context,
      response.error.code,
      response.error.message,
      response.error.data
    );
  }

  if (
    response.result === undefined ||
    response.result === null ||
    response.result === '0x'
  ) {
    throw new Error(`[${context}] error: No result returned`);
  }

  return response.result;
};
