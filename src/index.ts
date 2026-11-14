/**
 * Client for reading ERC20, ERC721 and ERC1155 token data from Ethereum and other EVM compatible chains over
 * JSON-RPC.
 *
 * @packageDocumentation
 */
export { EthereumClient, createClient } from './lib/client/ethereumClient.js';
export type { ClientConfig } from './lib/client/jsonRpcClient.js';
export type { Erc20Client } from './integrations/erc20.js';
export type { Erc721Client } from './integrations/erc721.js';
export type { Erc1155Client } from './integrations/erc1155.js';
export type { TokenId } from './lib/interfaces/tokenId.js';
export {
  EvmClientError,
  InvalidArgumentError,
  InvalidResponseError,
  RequestError,
  RpcError,
} from './lib/errors.js';
