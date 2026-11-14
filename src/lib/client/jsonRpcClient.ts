import { create } from 'axios';
import type { AxiosInstance } from 'axios';

import { RpcError } from '../errors.js';
import { EthMethod } from '../interfaces/ethMethods.js';
import type { RpcParams } from '../interfaces/jsonRpcRequest.js';
import type { JsonRpcResponse } from '../interfaces/jsonRpcResponse.js';
import { constructEthMethodPayload } from '../../utils/ethCall.js';
import { format } from '../../utils/formatting.js';

/** Default time limit of one JSON-RPC request, in milliseconds. */
const DEFAULT_TIMEOUT = 30_000;

/**
 * Configuration of a client: the endpoint and how to reach it.
 */
export interface ClientConfig {
  /** The base URL of the JSON-RPC endpoint. */
  endpoint: string;

  /** API key of the endpoint, sent as a bearer token. */
  apiKey?: string;

  /**
   * Additional headers sent with every request.
   *
   * @defaultValue `{}`
   */
  additionalHeaders?: Record<string, string>;

  /**
   * Time limit of one request, in milliseconds.
   *
   * @defaultValue `30000`
   */
  timeout?: number;
}

/**
 * Client that sends JSON-RPC requests to one endpoint. The token clients use it for every request.
 *
 * @example
 * ```ts
 * const rpc = new JsonRpcClient({ endpoint: 'RPC_ENDPOINT' });
 * const result = await rpc.call('0xCONTRACT_ADDRESS', Erc20.Name, 'erc20/getName');
 * ```
 */
export class JsonRpcClient {
  /** The HTTP client bound to the endpoint, with the headers and timeout of the configuration. */
  readonly #http: AxiosInstance;

  /**
   * Creates a JSON-RPC client for one endpoint.
   *
   * @param config - The endpoint, api key, headers and timeout.
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
   * @param method - The JSON-RPC method, such as `eth_getBalance`.
   * @param params - The call object or account address.
   * @param context - The method sending the request, such as `erc20/getBalance`. Every error message starts with it.
   * @returns The result of the request.
   * @throws {@link RpcError} When the node answers with a JSON-RPC error.
   * @throws {@link Error} When the request fails, or the node returns no result (`0x` for a call to an address
   * without code).
   *
   * @example
   * ```ts
   * const result = await rpc.request(EthMethod.GetBalance, '0xACCOUNT_ADDRESS', 'erc20/getBalance');
   * ```
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
   * @param contractAddress - The contract address.
   * @param data - The call data: the function selector followed by the ABI encoded arguments.
   * @param context - The method sending the request, such as `erc20/getName`. Every error message starts with it.
   * @returns The ABI encoded result of the call.
   * @throws {@link RpcError} When the node answers with a JSON-RPC error, such as a revert.
   * @throws {@link Error} When the contract address is invalid, the request fails, or the call returns no data.
   *
   * @example
   * ```ts
   * const result = await rpc.call('0xCONTRACT_ADDRESS', Erc20.Name, 'erc20/getName');
   * ```
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
