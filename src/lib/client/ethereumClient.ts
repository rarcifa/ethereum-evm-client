import { Erc1155Client } from '../../integrations/erc1155.js';
import { Erc20Client } from '../../integrations/erc20.js';
import { Erc721Client } from '../../integrations/erc721.js';
import { JsonRpcClient } from './jsonRpcClient.js';
import type { ClientConfig } from './jsonRpcClient.js';

/**
 * Client for EVM compatible blockchains, with one client per token standard. Every client sends its requests to the
 * endpoint of the configuration.
 *
 * @example
 * ```ts
 * const client = new EthereumClient({
 *   endpoint: 'RPC_ENDPOINT',
 *   apiKey: 'RPC_API_KEY',
 * });
 *
 * const symbol = await client.erc20.getSymbol('0xCONTRACT_ADDRESS');
 * ```
 */
export class EthereumClient {
  /** Methods for interacting with erc20 tokens. */
  readonly erc20: Erc20Client;

  /** Methods for interacting with erc721 tokens. */
  readonly erc721: Erc721Client;

  /** Methods for interacting with erc1155 tokens. */
  readonly erc1155: Erc1155Client;

  /**
   * Creates a client for one JSON-RPC endpoint.
   *
   * @param config - The endpoint, api key, headers and timeout.
   */
  constructor(config: ClientConfig) {
    const rpc = new JsonRpcClient(config);

    this.erc20 = new Erc20Client(rpc);
    this.erc721 = new Erc721Client(rpc);
    this.erc1155 = new Erc1155Client(rpc);
  }
}

/**
 * Creates a new client for interacting with EVM compatible blockchains. Same as `new EthereumClient(config)`.
 *
 * @param config - The endpoint, api key, headers and timeout.
 * @returns A client with methods to interact with the blockchain.
 *
 * @example
 * ```ts
 * const client = createClient({
 *   endpoint: 'RPC_ENDPOINT',
 *   apiKey: 'RPC_API_KEY',
 * });
 *
 * const symbol = await client.erc20.getSymbol('0xCONTRACT_ADDRESS');
 * ```
 */
export const createClient = (config: ClientConfig): EthereumClient =>
  new EthereumClient(config);
