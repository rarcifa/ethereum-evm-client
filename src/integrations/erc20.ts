import type { JsonRpcClient } from '../lib/client/jsonRpcClient.js';
import { Erc20, EthMethod } from '../lib/interfaces/ethMethods.js';

import { format } from '../utils/formatting.js';

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
   * @throws {@link RpcError} When the node answers with a JSON-RPC error.
   * @throws {@link Error} When the address is invalid, the request fails or the node returns no result.
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
   * @throws {@link RpcError} When the node answers with a JSON-RPC error.
   * @throws {@link Error} When the address is invalid, the request fails or the contract returns no data.
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

    return Number(format.formatTokenAmount(result, 0));
  }

  /**
   * Fetches the token balance of an account, using the decimals of the token.
   *
   * @param accountAddress - The account address to fetch the balance from.
   * @param contractAddress - The contract address of the erc20 token.
   * @returns The erc20 token balance of the account.
   * @throws {@link RpcError} When the node answers with a JSON-RPC error.
   * @throws {@link Error} When an address is invalid, the request fails or the contract returns no data.
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
   * @throws {@link RpcError} When the node answers with a JSON-RPC error.
   * @throws {@link Error} When the address is invalid, the request fails or the contract returns no data.
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
   * @throws {@link RpcError} When the node answers with a JSON-RPC error.
   * @throws {@link Error} When the address is invalid, the request fails or the contract returns no data.
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
   * @throws {@link RpcError} When the node answers with a JSON-RPC error.
   * @throws {@link Error} When the address is invalid, the request fails or the contract returns no data.
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
