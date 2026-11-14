import { create } from 'axios';
import type { AxiosInstance } from 'axios';

import { InvalidResponseError, RequestError, RpcError } from '../errors.js';
import { EthMethod } from '../interfaces/ethMethods.js';
import type { RpcParams } from '../interfaces/jsonRpcRequest.js';
import type {
  JsonRpcError,
  JsonRpcResponse,
} from '../interfaces/jsonRpcResponse.js';
import { constructEthMethodPayload } from '../../utils/ethCall.js';
import { format } from '../../utils/formatting.js';

/** Default time limit of one JSON-RPC request, in milliseconds. */
const DEFAULT_TIMEOUT = 30_000;

/**
 * Checks that a value is a JSON-RPC response: an object with a `result` or an `error` member.
 *
 * @param body - The parsed body of an HTTP response.
 * @returns Whether the body is a JSON-RPC response.
 *
 * @example
 * ```ts
 * if (isJsonRpcResponse(body)) {
 *   return body.result;
 * }
 * ```
 */
const isJsonRpcResponse = (body: unknown): body is JsonRpcResponse<unknown> =>
  typeof body === 'object' &&
  body !== null &&
  !Array.isArray(body) &&
  ('result' in body || 'error' in body);

/**
 * Checks that a value is a JSON-RPC error object, with a numeric `code` and a string `message`.
 *
 * @param error - The `error` member of a response.
 * @returns Whether the value is a JSON-RPC error object.
 *
 * @example
 * ```ts
 * if (isJsonRpcError(body.error)) {
 *   throw new RpcError(context, body.error.code, body.error.message);
 * }
 * ```
 */
const isJsonRpcError = (error: unknown): error is JsonRpcError =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  typeof error.code === 'number' &&
  'message' in error &&
  typeof error.message === 'string';

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
      // Every status is read: nodes send JSON-RPC errors with 4xx and 5xx statuses too.
      validateStatus: () => true,
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
   * @returns The result of the request, a `0x` prefixed hex string.
   * @throws {@link RpcError} When the node answers with a JSON-RPC error, whatever the HTTP status.
   * @throws {@link RequestError} When the request fails, times out, or gets an HTTP error status without a JSON-RPC
   * error.
   * @throws {@link InvalidResponseError} When the answer is not a JSON-RPC response, has no result (`0x` for a call to
   * an address without code), or the result is not a hex string.
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
    let status: number;
    let body: unknown;

    try {
      ({ status, data: body } = await this.#http.post<unknown>(
        '',
        constructEthMethodPayload(params, method)
      ));
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new RequestError(context, reason, { cause: error });
    }

    if (isJsonRpcResponse(body) && isJsonRpcError(body.error)) {
      throw new RpcError(
        context,
        body.error.code,
        body.error.message,
        body.error.data
      );
    }

    if (status < 200 || status >= 300) {
      throw new RequestError(
        context,
        `Request failed with HTTP status ${status}`
      );
    }

    if (!isJsonRpcResponse(body)) {
      throw new InvalidResponseError(
        context,
        'The answer is not a JSON-RPC response'
      );
    }

    const { result } = body;

    if (result === undefined || result === null || result === '0x') {
      throw new InvalidResponseError(context, 'No result returned');
    }

    if (!format.isHex(result)) {
      throw new InvalidResponseError(context, 'The result is not a hex string');
    }

    return result;
  }

  /**
   * Calls a contract with `eth_call` at the latest block and returns the ABI encoded result.
   *
   * @param contractAddress - The contract address.
   * @param data - The call data: the function selector followed by the ABI encoded arguments.
   * @param context - The method sending the request, such as `erc20/getName`. Every error message starts with it.
   * @returns The ABI encoded result of the call.
   * @throws {@link InvalidArgumentError} When the contract address is invalid.
   * @throws {@link RpcError} When the node answers with a JSON-RPC error, such as a revert.
   * @throws {@link RequestError} When the request fails or times out.
   * @throws {@link InvalidResponseError} When the call returns no data or an invalid answer.
   *
   * @example
   * ```ts
   * const result = await rpc.call('0xCONTRACT_ADDRESS', Erc20.Name, 'erc20/getName');
   * ```
   */
  async call(
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
