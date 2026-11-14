import { create } from 'axios';
import type { AxiosInstance } from 'axios';

import { RpcError } from '../errors.js';
import { EthMethod } from '../interfaces/ethMethods.js';
import type { RpcParams } from '../interfaces/jsonRpcRequest.js';
import type { JsonRpcResponse } from '../interfaces/jsonRpcResponse.js';
import { constructEthMethodPayload } from '../../utils/ethCall.js';
import { format } from '../../utils/formatting.js';

/**
 * Default time limit of one JSON-RPC request, in milliseconds.
 */
const DEFAULT_TIMEOUT = 30_000;

/**
 * Configuration parameters for creating a blockchain client instance.
 *
 * @interface
 * @property {string} endpoint - The base URL for the RPC server.
 * @property {string} [apiKey] - Optional. API key for accessing the RPC server, sent as a bearer token.
 * @property {Record<string, string>} [additionalHeaders] - Optional. Additional headers sent with every request.
 * @property {number} [timeout] - Optional. Time limit of one request in milliseconds. Defaults to 30000.
 */
export interface ClientConfig {
  endpoint: string;
  apiKey?: string;
  additionalHeaders?: Record<string, string>;
  timeout?: number;
}

/**
 * Sends JSON-RPC requests to one endpoint. The token clients use it for every request.
 *
 * @fileoverview This file provides the JSON-RPC transport shared by the token clients.
 * @class
 *
 * @example
 * const rpc = new JsonRpcClient({ endpoint: 'RPC_ENDPOINT' });
 * const result = await rpc.call('0xCONTRACT_ADDRESS', Erc20.Name, 'erc20/getName');
 */
export class JsonRpcClient {
  /**
   * The HTTP client bound to the endpoint, with the headers and timeout of the configuration.
   */
  readonly #http: AxiosInstance;

  /**
   * Creates a JSON-RPC client for one endpoint.
   *
   * @param {ClientConfig} config - The endpoint, api key, headers and timeout.
   */
  constructor({
    endpoint,
    apiKey,
    additionalHeaders = {},
    timeout = DEFAULT_TIMEOUT,
  }: ClientConfig) {
    this.#http = create({
      baseURL: endpoint,
      timeout,
      headers: {
        'Content-Type': 'application/json',
        ...additionalHeaders,
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
    });
  }

  /**
   * Sends one JSON-RPC request and returns its result.
   *
   * @param {string} method - The JSON-RPC method, such as `eth_getBalance`.
   * @param {RpcParams} params - The call object or account address.
   * @param {string} context - The method sending the request, such as `erc20/getBalance`. Every error message starts with it.
   * @returns {Promise<string>} The result of the request.
   * @throws {RpcError} When the node answers with a JSON-RPC error.
   * @throws {Error} When the request fails, or the node returns no result (`0x` for a call to an address without code).
   *
   * @example
   * const result = await rpc.request(EthMethod.GetBalance, '0xACCOUNT_ADDRESS', 'erc20/getBalance');
   */
  async request(
    method: string,
    params: RpcParams,
    context: string
  ): Promise<string> {
    let response: JsonRpcResponse<string>;

    try {
      ({ data: response } = await this.#http.post<JsonRpcResponse<string>>(
        '',
        constructEthMethodPayload(params, method)
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
  }

  /**
   * Calls a contract with `eth_call` at the latest block and returns the ABI encoded result.
   *
   * @param {string} contractAddress - The contract address.
   * @param {string} data - The call data: the function selector followed by the ABI encoded arguments.
   * @param {string} context - The method sending the request, such as `erc20/getName`. Every error message starts with it.
   * @returns {Promise<string>} The ABI encoded result of the call.
   * @throws {RpcError} When the node answers with a JSON-RPC error, such as a revert.
   * @throws {Error} When the contract address is invalid, the request fails, or the call returns no data.
   *
   * @example
   * const result = await rpc.call('0xCONTRACT_ADDRESS', Erc20.Name, 'erc20/getName');
   */
  call(
    contractAddress: string,
    data: string,
    context: string
  ): Promise<string> {
    return this.request(
      EthMethod.Call,
      { to: format.checkAddress(contractAddress), data },
      context
    );
  }
}
