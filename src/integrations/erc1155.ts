import type { JsonRpcClient } from '../lib/client/jsonRpcClient.js';
import { Erc1155 } from '../lib/interfaces/ethMethods.js';
import type { TokenId } from '../lib/interfaces/tokenId.js';

import { format } from '../utils/formatting.js';

/**
 * Client for erc1155 token data, read over JSON-RPC.
 *
 * @example
 * ```ts
 * const client = createClient({ endpoint: 'RPC_ENDPOINT' });
 * const balance = await client.erc1155.getBalanceOf('0xACCOUNT_ADDRESS', '0xCONTRACT_ADDRESS', 'TOKEN_ID');
 * ```
 */
export class Erc1155Client {
  /** The JSON-RPC client that sends every request. */
  readonly #rpc: JsonRpcClient;

  /**
   * Creates an erc1155 client.
   *
   * @param rpc - The JSON-RPC client that sends every request.
   */
  constructor(rpc: JsonRpcClient) {
    this.#rpc = rpc;
  }

  /**
   * Fetches the balance of one token id at one account address.
   *
   * @param accountAddress - The account address to fetch the token balance from.
   * @param contractAddress - The contract address of the erc1155 token.
   * @param tokenId - The token id.
   * @returns The balance of the token id at the account address.
   * @throws {@link InvalidArgumentError} When an address or the token id is invalid.
   * @throws {@link RpcError} When the node answers with a JSON-RPC error.
   * @throws {@link RequestError} When the request fails or times out.
   * @throws {@link InvalidResponseError} When the contract returns no data or an invalid answer.
   *
   * @example
   * ```ts
   * const balance = await client.erc1155.getBalanceOf('0xACCOUNT_ADDRESS', '0xCONTRACT_ADDRESS', 'TOKEN_ID');
   * ```
   */
  async getBalanceOf(
    accountAddress: string,
    contractAddress: string,
    tokenId: TokenId
  ): Promise<string> {
    const result = await this.#rpc.call(
      contractAddress,
      `${Erc1155.BalanceOf}${format.encodeAddress(accountAddress)}${format.encodeUint256(tokenId)}`,
      'erc1155/getBalanceOf'
    );

    return format.formatTokenAmount(result, 0);
  }

  /**
   * Fetches the balances of pairs of account address and token id.
   *
   * @param accountAddresses - The account addresses to fetch the token balances from.
   * @param contractAddress - The contract address of the erc1155 token.
   * @param tokenIds - The token ids, one per account address.
   * @returns The balance of each pair, in the order of the arguments.
   * @throws {@link InvalidArgumentError} When the arrays differ in length, or an address or token id is invalid.
   * @throws {@link RpcError} When the node answers with a JSON-RPC error.
   * @throws {@link RequestError} When the request fails or times out.
   * @throws {@link InvalidResponseError} When the contract returns no data or an invalid answer.
   *
   * @example
   * ```ts
   * const balances = await client.erc1155.getBalanceOfBatch(['0xACCOUNT_ADDRESS_1', '0xACCOUNT_ADDRESS_2'], '0xCONTRACT_ADDRESS', ['TOKEN_ID_1', 'TOKEN_ID_2']);
   * ```
   */
  async getBalanceOfBatch(
    accountAddresses: string[],
    contractAddress: string,
    tokenIds: TokenId[]
  ): Promise<string[]> {
    const result = await this.#rpc.call(
      contractAddress,
      `${Erc1155.BalanceOfBatch}${format.encodeBalanceOfBatchArgs(accountAddresses, tokenIds)}`,
      'erc1155/getBalanceOfBatch'
    );

    return format
      .decodeUint256Array(result)
      .map((balance) => balance.toString());
  }
}
