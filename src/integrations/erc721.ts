import type { JsonRpcClient } from '../lib/client/jsonRpcClient.js';
import { Erc721 } from '../lib/interfaces/ethMethods.js';
import type { TokenId } from '../lib/interfaces/tokenId.js';

import { format } from '../utils/formatting.js';

/**
 * Reads erc721 token data over JSON-RPC.
 *
 * @fileoverview This file provides the client for Ethereum JSON-RPC interactions for erc721 tokens.
 * @class
 *
 * @example
 * const client = createClient({ endpoint: 'RPC_ENDPOINT' });
 * const owner = await client.erc721.getOwnerOf('0xCONTRACT_ADDRESS', 'TOKEN_ID');
 */
export class Erc721Client {
  /**
   * The JSON-RPC client that sends every request.
   */
  readonly #rpc: JsonRpcClient;

  /**
   * Creates an erc721 client.
   *
   * @param {JsonRpcClient} rpc - The JSON-RPC client that sends every request.
   */
  constructor(rpc: JsonRpcClient) {
    this.#rpc = rpc;
  }

  /**
   * Fetches the number of erc721 tokens an account owns.
   *
   * @param {string} accountAddress - The account address to fetch the balance from.
   * @param {string} contractAddress - The contract address of the erc721 token.
   * @returns {Promise<string>} The number of tokens the account owns.
   * @throws {RpcError} When the node answers with a JSON-RPC error.
   * @throws {Error} When an address is invalid, the request fails or the contract returns no data.
   *
   * @example
   * const balance = await client.erc721.getBalanceOf('0xACCOUNT_ADDRESS', '0xCONTRACT_ADDRESS');
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
   * @param {string} contractAddress - The contract address of the erc721 token.
   * @param {TokenId} tokenId - The token id.
   * @returns {Promise<string>} The owner address of the token, lowercase.
   * @throws {RpcError} When the node answers with a JSON-RPC error, such as a revert for a token that does not exist.
   * @throws {Error} When the address or token id is invalid, the request fails or the contract returns no data.
   *
   * @example
   * const owner = await client.erc721.getOwnerOf('0xCONTRACT_ADDRESS', 'TOKEN_ID');
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
   * @param {string} contractAddress - The contract address of the erc721 token.
   * @param {TokenId} tokenId - The token id.
   * @returns {Promise<string>} The uri of the token metadata, as the contract returns it.
   * @throws {RpcError} When the node answers with a JSON-RPC error, such as a revert for a token that does not exist.
   * @throws {Error} When the address or token id is invalid, the request fails or the contract returns no data.
   *
   * @example
   * const uri = await client.erc721.getTokenUri('0xCONTRACT_ADDRESS', 'TOKEN_ID');
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
