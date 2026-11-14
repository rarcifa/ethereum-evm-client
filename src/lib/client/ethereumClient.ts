import { create } from 'axios';
import type { AxiosInstance } from 'axios';

import { erc1155 } from '../../integrations/erc1155.js';
import { erc20 } from '../../integrations/erc20.js';
import { erc721 } from '../../integrations/erc721.js';

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
 * A token id, as a decimal string, a `0x` prefixed hex string, a safe integer or a bigint.
 */
export type TokenId = string | number | bigint;

/**
 * Interface for interacting with erc20 token methods.
 *
 * @interface
 * @property {Function} getBalance - Fetches the native token balance of an account.
 * @property {Function} getBalanceOf - Fetches the balance of a specified erc20 token.
 * @property {Function} getDecimals - Fetches the decimals of the erc20 token.
 * @property {Function} getName - Fetches the name of the erc20 token.
 * @property {Function} getSymbol - Fetches the symbol of the erc20 token.
 * @property {Function} getTotalSupply - Fetches the total supply of the erc20 token.
 */
export interface Erc20Client {
  /**
   * Fetches the native token balance of an account.
   *
   * @param {string} accountAddress - The account address to fetch the balance from.
   * @returns {Promise<string>} A promise that resolves to the native token balance of the account in Ether.
   */
  getBalance: (accountAddress: string) => Promise<string>;

  /**
   * Fetches the token balance of an account for a specified erc20 contract, using the decimals of the token.
   *
   * @param {string} accountAddress - The account address to fetch the balance from.
   * @param {string} contractAddress - The contract address of the erc20 token.
   * @returns {Promise<string>} A promise that resolves to the erc20 token balance of the account.
   */
  getBalanceOf: (
    accountAddress: string,
    contractAddress: string
  ) => Promise<string>;

  /**
   * Fetches the number of decimals of a erc20 token.
   *
   * @param {string} contractAddress - The contract address of the erc20 token.
   * @returns {Promise<number>} A promise that resolves to the number of decimals the token uses.
   */
  getDecimals: (contractAddress: string) => Promise<number>;

  /**
   * Fetches the name of a erc20 token.
   *
   * @param {string} contractAddress - The contract address of the erc20 token.
   * @returns {Promise<string>} A promise that resolves to the name of the erc20 token.
   */
  getName: (contractAddress: string) => Promise<string>;

  /**
   * Fetches the symbol of a erc20 token.
   *
   * @param {string} contractAddress - The contract address of the erc20 token.
   * @returns {Promise<string>} A promise that resolves to the symbol of the erc20 token.
   */
  getSymbol: (contractAddress: string) => Promise<string>;

  /**
   * Fetches the total supply of a erc20 token, using the decimals of the token.
   *
   * @param {string} contractAddress - The contract address of the erc20 token.
   * @returns {Promise<string>} A promise that resolves to the total supply of the erc20 token.
   */
  getTotalSupply: (contractAddress: string) => Promise<string>;
}

/**
 * Interface for interacting with erc721 token methods.
 *
 * @interface
 * @property {Function} getBalanceOf - Fetches the balance of a specified erc721 token.
 * @property {Function} getOwnerOf - Fetches the owner address of a specific erc721 token.
 * @property {Function} getTokenUri - Fetches the URI pointing to the metadata of the erc721 token.
 */
export interface Erc721Client {
  /**
   * Fetches the token balance of an account for a specified erc721 contract.
   *
   * @param {string} accountAddress - The account address to fetch the balance from.
   * @param {string} contractAddress - The contract address of the erc721 token.
   * @returns {Promise<string>} A promise that resolves to the number of tokens the account owns.
   */
  getBalanceOf: (
    accountAddress: string,
    contractAddress: string
  ) => Promise<string>;

  /**
   * Fetches the owner address of a specific erc721 token from a specified contract.
   *
   * @param {string} contractAddress - The contract address of the erc721 token.
   * @param {TokenId} tokenId - The token id of the erc721 token.
   * @returns {Promise<string>} The owner address of the specified erc721 token, lowercase.
   */
  getOwnerOf: (contractAddress: string, tokenId: TokenId) => Promise<string>;

  /**
   * Fetches the URI (often a URL) that points to the metadata of the specified erc721 token.
   *
   * @param {string} contractAddress - The contract address of the erc721 token.
   * @param {TokenId} tokenId - The token id of the erc721 token.
   * @returns {Promise<string>} The URI of the specified erc721 token.
   */
  getTokenUri: (contractAddress: string, tokenId: TokenId) => Promise<string>;
}

/**
 * Interface for interacting with erc1155 token methods.
 *
 * @interface
 * @property {Function} getBalanceOf - Fetches the balance of one token id for one account.
 * @property {Function} getBalanceOfBatch - Fetches the balances of several pairs of account and token id.
 */
export interface Erc1155Client {
  /**
   * Fetches the token balance of an account for a specified erc1155 contract.
   *
   * @param {string} accountAddress - The account address to fetch the balance from.
   * @param {string} contractAddress - The contract address of the erc1155 token.
   * @param {TokenId} tokenId - The token id of the erc1155 token.
   * @returns {Promise<string>} A promise that resolves to the erc1155 token balance of the account.
   */
  getBalanceOf: (
    accountAddress: string,
    contractAddress: string,
    tokenId: TokenId
  ) => Promise<string>;

  /**
   * Fetches the token balances of pairs of account address and token id for a specified erc1155 contract.
   *
   * @param {string[]} accountAddresses - The account addresses to fetch the balances from.
   * @param {string} contractAddress - The contract address of the erc1155 token.
   * @param {TokenId[]} tokenIds - The token ids, one per account address.
   * @returns {Promise<string[]>} A promise that resolves to the balance of each pair, in order.
   */
  getBalanceOfBatch: (
    accountAddresses: string[],
    contractAddress: string,
    tokenIds: TokenId[]
  ) => Promise<string[]>;
}

/**
 * Interface for a blockchain client that holds methods for interacting with erc20, erc721 and erc1155 tokens.
 *
 * @interface
 * @property {Erc20Client} erc20 - Methods for interacting with erc20 tokens.
 * @property {Erc721Client} erc721 - Methods for interacting with erc721 tokens.
 * @property {Erc1155Client} erc1155 - Methods for interacting with erc1155 tokens.
 */
export interface BlockchainClient {
  erc20: Erc20Client;
  erc721: Erc721Client;
  erc1155: Erc1155Client;
}

/**
 * Creates a new client for interacting with the EVM compatible blockchains.
 *
 * @param {ClientConfig} config - The configuration for setting up the client.
 * @returns {BlockchainClient} Returns an object with methods to interact with the blockchain.
 *
 * @example
 * const client = createClient({
 *   endpoint: 'RPC_ENDPOINT',
 *   apiKey: 'RPC_API_KEY'
 * });
 *
 * const symbol = await client.erc20.getSymbol('0xCONTRACT_ADDRESS');
 */
export const createClient = ({
  endpoint,
  apiKey,
  additionalHeaders = {},
  timeout = DEFAULT_TIMEOUT,
}: ClientConfig): BlockchainClient => {
  const instance: AxiosInstance = create({
    baseURL: endpoint,
    timeout,
    headers: {
      'Content-Type': 'application/json',
      ...additionalHeaders,
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
  });

  return {
    erc20: {
      getBalance: (accountAddress) =>
        erc20.getBalance(accountAddress, instance),
      getBalanceOf: (accountAddress, contractAddress) =>
        erc20.getBalanceOf(accountAddress, contractAddress, instance),
      getDecimals: (contractAddress) =>
        erc20.getDecimals(contractAddress, instance),
      getName: (contractAddress) => erc20.getName(contractAddress, instance),
      getSymbol: (contractAddress) =>
        erc20.getSymbol(contractAddress, instance),
      getTotalSupply: (contractAddress) =>
        erc20.getTotalSupply(contractAddress, instance),
    },
    erc721: {
      getBalanceOf: (accountAddress, contractAddress) =>
        erc721.getBalanceOf(accountAddress, contractAddress, instance),
      getOwnerOf: (contractAddress, tokenId) =>
        erc721.getOwnerOf(contractAddress, tokenId, instance),
      getTokenUri: (contractAddress, tokenId) =>
        erc721.getTokenUri(contractAddress, tokenId, instance),
    },
    erc1155: {
      getBalanceOf: (accountAddress, contractAddress, tokenId) =>
        erc1155.getBalanceOf(
          accountAddress,
          contractAddress,
          tokenId,
          instance
        ),
      getBalanceOfBatch: (accountAddresses, contractAddress, tokenIds) =>
        erc1155.getBalanceOfBatch(
          accountAddresses,
          contractAddress,
          tokenIds,
          instance
        ),
    },
  };
};
