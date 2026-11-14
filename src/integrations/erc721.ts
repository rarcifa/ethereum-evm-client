import type { JsonRpcClient } from '../lib/client/jsonRpcClient.js';
import { Erc721 } from '../lib/interfaces/ethMethods.js';
import type { TokenId } from '../lib/interfaces/tokenId.js';

import { format } from '../utils/formatting.js';

/**
 * Client for erc721 token data, read over JSON-RPC.
 *
 * @example
 * ```ts
 * const client = createClient({ endpoint: 'RPC_ENDPOINT' });
 * const owner = await client.erc721.getOwnerOf('0xCONTRACT_ADDRESS', 'TOKEN_ID');
 * ```
 */
export class Erc721Client {
  /** The JSON-RPC client that sends every request. */
  readonly #rpc: JsonRpcClient;

  /**
   * Creates an erc721 client.
   *
   * @param rpc - The JSON-RPC client that sends every request.
   */
  constructor(rpc: JsonRpcClient) {
    this.#rpc = rpc;
  }

  /**
   * Fetches the number of erc721 tokens an account owns.
   *
   * @param accountAddress - The account address to fetch the balance from.
   * @param contractAddress - The contract address of the erc721 token.
   * @returns The number of tokens the account owns.
   * @throws {@link InvalidArgumentError} When an address is invalid.
   * @throws {@link RpcError} When the node answers with a JSON-RPC error.
   * @throws {@link RequestError} When the request fails or times out.
   * @throws {@link InvalidResponseError} When the contract returns no data or an invalid answer.
   *
   * @example
   * ```ts
   * const balance = await client.erc721.getBalanceOf('0xACCOUNT_ADDRESS', '0xCONTRACT_ADDRESS');
   * ```
   */
  async getBalanceOf(
    accountAddress: string,
    contractAddress: string
  ): Promise<string> {
    const result = await this.#rpc.call(
      contractAddress,
      `${Erc721.BalanceOf}${format.encodeAddress(accountAddress)}`,
      'erc721/getBalanceOf'
    );

    return format.formatTokenAmount(result, 0);
  }

  /**
   * Fetches the owner address of the erc721 token.
   *
   * @param contractAddress - The contract address of the erc721 token.
   * @param tokenId - The token id.
   * @returns The owner address of the token, lowercase.
   * @throws {@link InvalidArgumentError} When the address or token id is invalid.
   * @throws {@link RpcError} When the node answers with a JSON-RPC error, such as a revert for a token that does not exist.
   * @throws {@link RequestError} When the request fails or times out.
   * @throws {@link InvalidResponseError} When the contract returns no data or an invalid answer.
   *
   * @example
   * ```ts
   * const owner = await client.erc721.getOwnerOf('0xCONTRACT_ADDRESS', 'TOKEN_ID');
   * ```
   */
  async getOwnerOf(contractAddress: string, tokenId: TokenId): Promise<string> {
    const result = await this.#rpc.call(
      contractAddress,
      `${Erc721.OwnerOf}${format.encodeUint256(tokenId)}`,
      'erc721/getOwnerOf'
    );

    return format.decodeAddress(result);
  }

  /**
   * Fetches the metadata uri of the erc721 token.
   *
   * @param contractAddress - The contract address of the erc721 token.
   * @param tokenId - The token id.
   * @returns The uri of the token metadata, as the contract returns it.
   * @throws {@link InvalidArgumentError} When the address or token id is invalid.
   * @throws {@link RpcError} When the node answers with a JSON-RPC error, such as a revert for a token that does not exist.
   * @throws {@link RequestError} When the request fails or times out.
   * @throws {@link InvalidResponseError} When the contract returns no data or an invalid answer.
   *
   * @example
   * ```ts
   * const uri = await client.erc721.getTokenUri('0xCONTRACT_ADDRESS', 'TOKEN_ID');
   * ```
   */
  async getTokenUri(
    contractAddress: string,
    tokenId: TokenId
  ): Promise<string> {
    const result = await this.#rpc.call(
      contractAddress,
      `${Erc721.TokenURI}${format.encodeUint256(tokenId)}`,
      'erc721/getTokenUri'
    );

    return format.decodeHexString(result);
  }
}
