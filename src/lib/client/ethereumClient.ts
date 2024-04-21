import axios, { AxiosInstance } from 'axios';

import { erc1155 } from '../../integrations/erc1155';
import { erc20 } from '../../integrations/erc20';
import { erc721 } from '../../integrations/erc721';

/**
 * Configuration parameters for creating a blockchain client instance.
 *
 * @interface
 * @property {string} endpoint - The base URL for the RPC server.
 * @property {string} [apiKey] - Optional. API key for accessing the RPC server if required.
 * @property {Record<string, string>} [additionalHeaders] - Optional. Additional header options if required.
 */
interface ClientConfig {
  endpoint: string;
  apiKey?: string;
  additionalHeaders?: Record<string, string>;
}

/**
 * Interface for interacting with erc20 token methods.
 *
 * @interface
 * @property {Function} getBalance - Fetches the balance of the main token.
 * @property {Function} getBalanceOf - Fetches the balance of a specified erc20 token.
 * @property {Function} getName - Fetches the name of the erc20 token.
 * @property {Function} getSymbol - Fetches the symbol of the erc20 token.
 * @property {Function} getTotalSupply - Fetches the total supply of the erc20 token.
 */
interface Erc20 {
  /**
   * Fetches the balance of an account.
   *
   * @param {string} accountAddress - The account address to fetch the balance from.
   * @returns {Promise<string>} A promise that resolves to the main token balance of the account in Ether.
   */
  getBalance: (accountAddress: string) => Promise<string>;
  /**
   * Fetches the token balance of an account for a specified erc20 contract.
   *
   * @param {string} accountAddress - The account address to fetch the balance from.
   * @param {string} contractAddress - The contract address of the erc20 token.
   * @returns {Promise<string>} A promise that resolves to the erc20 token balance of the account in Ether.
   */

  getBalanceOf: (
    accountAddress: string,
    contractAddress: string
  ) => Promise<string>;
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
   * Fetches the total supply of a erc20 token.
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
interface Erc721 {
  /**
   * Fetches the token balance of an account for a specified erc721 contract.
   *
   * @param {string} accountAddress - The account address to fetch the balance from.
   * @param {string} contractAddress - The contract address of the erc721 token.
   * @returns {Promise<string>} A promise that resolves to the erc721 token balance of the account.
   */
  getBalanceOf: (
    accountAddress: string,
    contractAddress: string
  ) => Promise<string>;

  /**
   * Fetches the owner address of a specific erc721 token from a specified contract.
   *
   * @param {string} contractAddress - The contract address of the erc721 token.
   * @param {string} tokenId - The token id of the erc721 token.
   * @returns {Promise<string>} The owner address of the specified erc721 token.
   */
  getOwnerOf: (contractAddress: string, tokenId: string) => Promise<string>;

  /**
   * Fetches the URI (often a URL) that points to the metadata of the specified erc721 token.
   *
   * @param {string} contractAddress - The contract address of the erc721 token.
   * @param {string} tokenId - The token id of the erc721 token.
   * @returns {Promise<string>} The URI of the specified erc721 token.
   */
  getTokenUri: (contractAddress: string, tokenId: string) => Promise<string>;
}

interface Erc1155 {
  /**
   * Fetches the token balance of an account for a specified erc1155 contract.
   *
   * @param {string} accountAddress - The account address to fetch the balance from.
   * @param {string} contractAddress - The contract address of the erc1155 token.
   * @returns {Promise<string>} A promise that resolves to the erc1155 token balance of the account.
   */
  getBalanceOf: (
    accountAddress: string,
    contractAddress: string,
    tokenId: string
  ) => Promise<string>;

  /**
   * Fetches the token balance of an account for a specified erc1155 contract.
   *
   * @param {string[]} accountAddresses - The account address to fetch the balance from.
   * @param {string} contractAddress - The contract address of the erc1155 token.
   * @param {string[]} tokenIds - The token ids of the erc1155 token.
   * @returns {Promise<string>} The owner address of the specified erc1155 token.
   */
  getBalanceOfBatch: (
    accountAddresses: string[],
    contractAddress: string,
    tokenIds: string[]
  ) => Promise<string>;
}

/**
 * Interface for a blockchain client that holds methods for interacting with both erc20, erc721 and erc1155 tokens.
 *
 * @interface
 * @property {Erc20} erc20 - Methods for interacting with erc20 tokens.
 * @property {Erc721} erc721 - Methods for interacting with erc721 tokens.
 * @property {Erc721} erc1155 - Methods for interacting with erc1155 tokens.
 */
interface BlockchainClient {
  erc20: Erc20;
  erc721: Erc721;
  erc1155: Erc1155;
}

/**
 * Creates a new client for interacting with the EVM compatible blockchains.
 *
 * @param {ClientConfig} config - The configuration for setting up the client.
 * @returns {Object} Returns an object with methods to interact with the blockchain.
 *
 * @example
 * const ethereumClient = createClient({
 *   endpoint: 'RPC_ENDPOINT',
 *   apiKey: 'RPC_API_KEY'
 * });
 */
export const createClient = ({
  endpoint,
  apiKey,
  additionalHeaders = {},
}: ClientConfig): BlockchainClient => {
  const instance: AxiosInstance = axios.create({
    baseURL: endpoint,
    headers: {
      ...additionalHeaders,
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
  });

  return {
    erc20: {
      /**
       * Fetches the balance of an account.
       *
       * @param {string} accountAddress - The account address to fetch the balance from.
       * @returns {Promise<string>} A promise that resolves to the main token balance of the account in Ether.
       *
       * @example
       * const client = createClient({
       *   endpoint: 'RPC_ENDPOINT',
       *   apiKey: 'RPC_API_KEY'
       * });
       *
       * async function getBalance() {
       *   try {
       *     const balance = await client.erc20.getBalance('0xACCOUNT_ADDRESS');
       *     console.log('Balance in Ether:', balance);
       *   } catch (e) {
       *     console.error('Error fetching main balance:', e);
       *   }
       * }
       *
       * getBalance();
       */
      getBalance: (accountAddress: string): Promise<string> =>
        erc20.getBalance(accountAddress, instance),

      /**
       * Fetches the token balance of an account for a specified erc20 contract.
       *
       * @param {string} accountAddress - The account address to fetch the balance from.
       * @param {string} contractAddress - The contract address of the erc20 token.
       * @returns {Promise<string>} A promise that resolves to the erc20 token balance of the account in Ether.
       *
       * @example
       * const client = createClient({
       *   endpoint: 'RPC_ENDPOINT',
       *   apiKey: 'RPC_API_KEY'
       * });
       *
       * async function getBalanceOf() {
       *   try {
       *     const balanceOf = await client.erc20.getBalanceOf('0xACCOUNT_ADDRESS', '0xCONTRACT_ADDRESS');
       *     console.log('Balance of erc20 token:', balanceOf);
       *   } catch (e) {
       *     console.error('Error fetching balance of token:', e);
       *   }
       * }
       *
       * getBalanceOf();
       */
      getBalanceOf: (
        accountAddress: string,
        contractAddress: string
      ): Promise<string> =>
        erc20.getBalanceOf(accountAddress, contractAddress, instance),

      /**
       * Fetches the name of a erc20 token.
       *
       * @param {string} contractAddress - The contract address of the erc20 token.
       * @returns {Promise<string>} A promise that resolves to the name of the erc20 token.
       *
       * @example
       * const client = createClient({
       *   endpoint: 'RPC_ENDPOINT',
       *   apiKey: 'RPC_API_KEY'
       * });
       *
       * async function getName() {
       *   try {
       *     const name = await client.erc20.getName('0xCONTRACT_ADDRESS');
       *     console.log('Name of erc20 token:', name);
       *   } catch (e) {
       *     console.error('Error fetching name of token:', e);
       *   }
       * }
       *
       * getName();
       */
      getName: (contractAddress: string): Promise<string> =>
        erc20.getName(contractAddress, instance),

      /**
       * Fetches the symbol of a erc20 token.
       *
       * @param {string} contractAddress - The contract address of the erc20 token.
       * @returns {Promise<string>} A promise that resolves to the symbol of the erc20 token.
       *
       * @example
       * const client = createClient({
       *   endpoint: 'RPC_ENDPOINT',
       *   apiKey: 'RPC_API_KEY'
       * });
       *
       * async function getSymbol() {
       *   try {
       *     const symbol = await client.erc20.getSymbol('0xCONTRACT_ADDRESS');
       *     console.log('Symbol of erc20 token:', symbol);
       *   } catch (e) {
       *     console.error('Error fetching symbol of token:', e);
       *   }
       * }
       *
       * getSymbol();
       */
      getSymbol: (contractAddress: string): Promise<string> =>
        erc20.getSymbol(contractAddress, instance),

      /**
       * Fetches the total supply of a erc20 token.
       *
       * @param {string} contractAddress - The contract address of the erc20 token.
       * @returns {Promise<string>} A promise that resolves to the total supply of the erc20 token.
       *
       * @example
       * const client = createClient({
       *   endpoint: 'RPC_ENDPOINT',
       *   apiKey: 'RPC_API_KEY'
       * });
       *
       * async function getTotalSupply() {
       *   try {
       *     const totalSupply = await client.erc20.getTotalSupply('0xCONTRACT_ADDRESS');
       *     console.log('Total supply of erc20 token:', log);
       *   } catch (e) {
       *     console.error('Error fetching total supply of token:', e);
       *   }
       * }
       *
       * getTotalSupply();
       */
      getTotalSupply: (contractAddress: string): Promise<string> =>
        erc20.getTotalSupply(contractAddress, instance),
    },
    erc721: {
      /**
       * Fetches the token balance of an account for a specified erc721 contract.
       *
       * @param {string} accountAddress - The account address to fetch the balance from.
       * @param {string} contractAddress - The contract address of the erc721 token.
       * @returns {Promise<string>} A promise that resolves to the erc721 token balance of the account.
       *
       * @example
       * const client = createClient({
       *   endpoint: 'RPC_ENDPOINT',
       *   apiKey: 'RPC_API_KEY'
       * });
       *
       * async function getBalanceOf() {
       *   try {
       *     const balanceOf = await client.erc721.getBalanceOf('0xACCOUNT_ADDRESS', '0xCONTRACT_ADDRESS');
       *     console.log('Balance of erc721 token:', balanceOf);
       *   } catch (e) {
       *     console.error('Error fetching balance of token:', e);
       *   }
       * }
       *
       * getBalanceOf();
       */
      getBalanceOf: (
        accountAddress: string,
        contractAddress: string
      ): Promise<string> =>
        erc721.getBalanceOf(accountAddress, contractAddress, instance),

      /**
       * Fetches the owner address of a specific erc721 token from a specified contract.
       *
       * @param {string} contractAddress - The contract address of the erc721 token.
       * @param {string} tokenId - The token id of the erc721 token.
       * @returns {Promise<string>} The owner address of the specified erc721 token.
       *
       * @example
       * const client = createClient({
       *   endpoint: 'RPC_ENDPOINT',
       *   apiKey: 'RPC_API_KEY'
       * });
       *
       * async function getOwnerOf() {
       *   try {
       *     const ownerOf = await client.erc721.getOwnerOf('0xCONTRACT_ADDRESS', 'TOKEN_ID');
       *     console.log('Owner of erc721 token:', ownerOf);
       *   } catch (e) {
       *     console.error('Error fetching owner of token:', e);
       *   }
       * }
       *
       * getOwnerOf();
       */
      getOwnerOf: async (
        contractAddress: string,
        tokenId: string
      ): Promise<string> =>
        erc721.getOwnerOf(contractAddress, tokenId, instance),

      /**
       * Fetches the URI (often a URL) that points to the metadata of the specified erc721 token.
       *
       * @param {string} contractAddress - The contract address of the erc721 token.
       * @param {string} tokenId - The token id of the erc721 token.
       * @returns {Promise<string>} The URI of the specified erc721 token.
       *
       * @example
       * const client = createClient({
       *   endpoint: 'RPC_ENDPOINT',
       *   apiKey: 'RPC_API_KEY'
       * });
       *
       * async function getTokenUri() {
       *   try {
       *     const uri = await client.erc721.getTokenUri('0xCONTRACT_ADDRESS', 'TOKEN_ID);
       *     console.log('Uri of erc721 token:', uri);
       *   } catch (e) {
       *     console.error('Error fetching uri of token:', e);
       *   }
       * }
       *
       * getTokenUri();
       */
      getTokenUri: async (
        contractAddress: string,
        tokenId: string
      ): Promise<string> =>
        erc721.getTokenUri(contractAddress, tokenId, instance),
    },
    erc1155: {
      /**
       * Fetches the token balance of an account for a specified erc1155 contract.
       *
       * @param {string} accountAddress - The account address to fetch the balance from.
       * @param {string} contractAddress - The contract address of the erc1155 token.
       * @param {string} tokenId - The token id of the erc1155 token.
       * @returns {Promise<string>} A promise that resolves to the erc1155 token balance of the account.
       *
       * @example
       * const client = createClient({
       *   endpoint: 'RPC_ENDPOINT',
       *   apiKey: 'RPC_API_KEY'
       * });
       *
       * async function getBalanceOf() {
       *   try {
       *     const balanceOf = await client.erc1155.getBalanceOf('0xACCOUNT_ADDRESS', '0xCONTRACT_ADDRESS', 'TOKEN_ID');
       *     console.log('Balance of erc1155 token:', balanceOf);
       *   } catch (e) {
       *     console.error('Error fetching balance of token:', e);
       *   }
       * }
       *
       * getBalanceOf();
       */
      getBalanceOf: (
        accountAddress: string,
        contractAddress: string,
        tokenId: string
      ): Promise<string> =>
        erc1155.getBalanceOf(
          accountAddress,
          contractAddress,
          tokenId,
          instance
        ),

      /**
       * Fetches the balance of an account for a specified erc1155 contract.
       *
       * @param {string} accountAddresses - The account addresses to fetch the balance from.
       * @param {string} contractAddress - The contract address of the erc1155 token.
       * @param {string[]} tokenIds - The token ids of the erc1155 token.
       * @returns {Promise<string>} A promise that resolves to the erc1155 token balance of the account.
       *
       * @example
       * const client = createClient({
       *   endpoint: 'RPC_ENDPOINT',
       *   apiKey: 'RPC_API_KEY'
       * });
       *
       * async function getBalanceOfBatch() {
       *   try {
       *     const balanceOfBatch = await client.erc1155.getBalanceOfBatch('0xACCOUNT_ADDRESS', '0xCONTRACT_ADDRESS', ['TOKEN_ID_1', 'TOKEN_ID_2']);
       *     console.log('Balance of batch of erc1155 token:', balanceOfBatch);
       *   } catch (e) {
       *     console.error('Error fetching balanceOfBatch of tokens:', e);
       *   }
       * }
       *
       * getBalanceOfBatch();
       */
      getBalanceOfBatch: (
        accountAddresses: string[],
        contractAddress: string,
        tokenIds: string[]
      ): Promise<string> =>
        erc1155.getBalanceOfBatch(
          accountAddresses,
          contractAddress,
          tokenIds,
          instance
        ),
    },
  };
};
