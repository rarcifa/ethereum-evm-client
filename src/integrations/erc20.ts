import type { JsonRpcClient } from '../lib/client/jsonRpcClient.js';
import { InvalidResponseError } from '../lib/errors.js';
import { Erc20, EthMethod } from '../lib/interfaces/ethMethods.js';

import { format } from '../utils/formatting.js';

/** Largest number of decimals a token can use: `decimals()` returns a `uint8`. */
const MAX_DECIMALS = 255n;

/**
 * Client for erc20 token data, and native token balances, read over JSON-RPC.
 *
 * @example
 * ```ts
 * const client = createClient({ endpoint: 'RPC_ENDPOINT' });
 * const symbol = await client.erc20.getSymbol('0xCONTRACT_ADDRESS');
 * ```
 */
export class Erc20Client {
  /** The JSON-RPC client that sends every request. */
  readonly #rpc: JsonRpcClient;

  /**
   * Creates an erc20 client.
   *
   * @param rpc - The JSON-RPC client that sends every request.
   */
  constructor(rpc: JsonRpcClient) {
    this.#rpc = rpc;
  }

  /**
   * Fetches the native token balance of an account.
   *
   * @param accountAddress - The account address to fetch the balance from.
   * @returns The native token balance of the account, in Ether.
   * @throws {@link InvalidArgumentError} When the address is invalid.
   * @throws {@link RpcError} When the node answers with a JSON-RPC error.
   * @throws {@link RequestError} When the request fails or times out.
   * @throws {@link InvalidResponseError} When the node returns no result or an invalid answer.
   *
   * @example
   * ```ts
   * const balance = await client.erc20.getBalance('0xACCOUNT_ADDRESS');
   * ```
   */
  async getBalance(accountAddress: string): Promise<string> {
    const result = await this.#rpc.request(
      EthMethod.GetBalance,
      format.checkAddress(accountAddress),
      'erc20/getBalance'
    );

    return format.weiToEther(result);
  }

  /**
   * Fetches the number of decimals of the erc20 token.
   *
   * @param contractAddress - The contract address of the erc20 token.
   * @returns The number of decimals the token uses.
   * @throws {@link InvalidArgumentError} When the address is invalid.
   * @throws {@link RpcError} When the node answers with a JSON-RPC error.
   * @throws {@link RequestError} When the request fails or times out.
   * @throws {@link InvalidResponseError} When the contract returns no data, an invalid answer, or more than 255
   * decimals.
   *
   * @example
   * ```ts
   * const decimals = await client.erc20.getDecimals('0xCONTRACT_ADDRESS');
   * ```
   */
  async getDecimals(contractAddress: string): Promise<number> {
    const result = await this.#rpc.call(
      contractAddress,
      Erc20.Decimals,
      'erc20/getDecimals'
    );

    const decimals = BigInt(result);

    if (decimals > MAX_DECIMALS) {
      throw new InvalidResponseError(
        'erc20/getDecimals',
        `Invalid decimals: ${decimals}`
      );
    }

    return Number(decimals);
  }

  /**
   * Fetches the token balance of an account, using the decimals of the token.
   *
   * @param accountAddress - The account address to fetch the balance from.
   * @param contractAddress - The contract address of the erc20 token.
   * @returns The erc20 token balance of the account.
   * @throws {@link InvalidArgumentError} When an address is invalid.
   * @throws {@link RpcError} When the node answers with a JSON-RPC error.
   * @throws {@link RequestError} When the request fails or times out.
   * @throws {@link InvalidResponseError} When the contract returns no data or an invalid answer.
   *
   * @example
   * ```ts
   * const balance = await client.erc20.getBalanceOf('0xACCOUNT_ADDRESS', '0xCONTRACT_ADDRESS');
   * ```
   */
  async getBalanceOf(
    accountAddress: string,
    contractAddress: string
  ): Promise<string> {
    const [result, decimals] = await Promise.all([
      this.#rpc.call(
        contractAddress,
        `${Erc20.BalanceOf}${format.encodeAddress(accountAddress)}`,
        'erc20/getBalanceOf'
      ),
      this.getDecimals(contractAddress),
    ]);

    return format.formatTokenAmount(result, decimals);
  }

  /**
   * Fetches the name of the erc20 token.
   *
   * @param contractAddress - The contract address of the erc20 token.
   * @returns The name of the token.
   * @throws {@link InvalidArgumentError} When the address is invalid.
   * @throws {@link RpcError} When the node answers with a JSON-RPC error.
   * @throws {@link RequestError} When the request fails or times out.
   * @throws {@link InvalidResponseError} When the contract returns no data or an invalid answer.
   *
   * @example
   * ```ts
   * const name = await client.erc20.getName('0xCONTRACT_ADDRESS');
   * ```
   */
  async getName(contractAddress: string): Promise<string> {
    const result = await this.#rpc.call(
      contractAddress,
      Erc20.Name,
      'erc20/getName'
    );

    return format.decodeHexString(result);
  }

  /**
   * Fetches the symbol of the erc20 token.
   *
   * @param contractAddress - The contract address of the erc20 token.
   * @returns The symbol of the token.
   * @throws {@link InvalidArgumentError} When the address is invalid.
   * @throws {@link RpcError} When the node answers with a JSON-RPC error.
   * @throws {@link RequestError} When the request fails or times out.
   * @throws {@link InvalidResponseError} When the contract returns no data or an invalid answer.
   *
   * @example
   * ```ts
   * const symbol = await client.erc20.getSymbol('0xCONTRACT_ADDRESS');
   * ```
   */
  async getSymbol(contractAddress: string): Promise<string> {
    const result = await this.#rpc.call(
      contractAddress,
      Erc20.Symbol,
      'erc20/getSymbol'
    );

    return format.decodeHexString(result);
  }

  /**
   * Fetches the total supply of the erc20 token, using the decimals of the token.
   *
   * @param contractAddress - The contract address of the erc20 token.
   * @returns The total supply of the token.
   * @throws {@link InvalidArgumentError} When the address is invalid.
   * @throws {@link RpcError} When the node answers with a JSON-RPC error.
   * @throws {@link RequestError} When the request fails or times out.
   * @throws {@link InvalidResponseError} When the contract returns no data or an invalid answer.
   *
   * @example
   * ```ts
   * const totalSupply = await client.erc20.getTotalSupply('0xCONTRACT_ADDRESS');
   * ```
   */
  async getTotalSupply(contractAddress: string): Promise<string> {
    const [result, decimals] = await Promise.all([
      this.#rpc.call(
        contractAddress,
        Erc20.TotalSupply,
        'erc20/getTotalSupply'
      ),
      this.getDecimals(contractAddress),
    ]);

    return format.formatTokenAmount(result, decimals);
  }
}
