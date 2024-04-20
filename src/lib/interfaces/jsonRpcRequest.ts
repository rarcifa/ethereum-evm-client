import { HttpMessages } from './httpEnums.js';

/**
 * Interface representing the structure of a JSON-RPC request payload.
 *
 * @interface
 * @property {string} jsonrpc - Version of the JSON-RPC protocol used (e.g., "2.0").
 * @property {string} method - Method being invoked on the JSON-RPC server.
 * @property {[{}, string]} params - Parameters to be passed to the method, usually an array containing a mixture of objects and strings.
 * @property {number} id - Unique identifier for the request, which can be used to match the response with this request.
 */
export interface JsonRpcRequestPayload {
  jsonrpc: string;
  method: string;
  params: [{}, string];
  id: number;
}

/**
 * Type representing the parameters that can be passed to an RPC call.
 *
 *
 * @type Parameters when targeting a specific contract or account with data.
 *
 */
export type RpcParams = { to: string; data: string } | string;

/**
 * Interface representing the params used in queries within blockchain-related API requests.
 *
 * @interface
 * @property {string} accountAddress - Optional. The Ethereum address of the account being queried.
 * @property {string} contractAddress - Optional. The address of the smart contract involved in the query.
 */
export interface QueryParams {
  accountAddress?: string;
  actAddress?: string;
}

/**
 * Interface representing a health check response in a system.
 *
 * @interface
 * @property {number} uptime - Total uptime of the system since the last reset, measured in seconds.
 * @property {[number, number]} contractAddress - Array containing average and peak response times, respectively.
 * @property {HttpMessages} message - Message from the HttpMessages enumeration that describes the health status of the system.
 * @property {number} timestamp - UNIX timestamp at which the health check data was recorded.
 */
export interface HealthCheck {
  uptime: number;
  responsetime: [number, number];
  message: HttpMessages;
  timestamp: number;
}
