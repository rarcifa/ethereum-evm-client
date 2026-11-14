import { createServer } from 'node:http';
import type { IncomingHttpHeaders, Server } from 'node:http';
import type { AddressInfo } from 'node:net';

import type { JsonRpcRequestPayload } from '../../lib/interfaces/jsonRpcRequest.js';

/**
 * One request received by the test server.
 */
export interface ReceivedRequest {
  body: JsonRpcRequestPayload;
  headers: IncomingHttpHeaders;
}

/**
 * Answers one JSON-RPC request with the `result` or `error` member of the response.
 */
export type RpcHandler = (
  body: JsonRpcRequestPayload
) => { result: unknown } | { error: { code: number; message: string } };

/**
 * A JSON-RPC server on the loopback interface, for tests that need no network.
 */
export interface RpcServer {
  url: string;
  requests: ReceivedRequest[];
  close: () => Promise<void>;
}

/**
 * Starts a JSON-RPC server on 127.0.0.1 that answers every request with the handler.
 *
 * @param {RpcHandler} handler - Builds the answer of each request.
 * @returns {Promise<RpcServer>} The server, its url and the requests it received.
 */
export const startRpcServer = async (
  handler: RpcHandler
): Promise<RpcServer> => {
  const requests: ReceivedRequest[] = [];

  const server: Server = createServer((req, res) => {
    let raw = '';
    req.on('data', (chunk: Buffer) => {
      raw += chunk.toString();
    });
    req.on('end', () => {
      const body: JsonRpcRequestPayload = JSON.parse(raw);
      requests.push({ body, headers: req.headers });
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({ jsonrpc: '2.0', id: body.id, ...handler(body) })
      );
    });
  });

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });
  const address: string | AddressInfo | null = server.address();
  if (address === null || typeof address === 'string') {
    throw new Error('[rpcServer] error: Server has no TCP address');
  }
  const { port } = address;

  return {
    url: `http://127.0.0.1:${port}`,
    requests,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((e) => (e ? reject(e) : resolve()));
      }),
  };
};

/**
 * Encodes a number as one ABI word.
 *
 * @param {bigint} value - The number.
 * @returns {string} The `0x` prefixed word.
 */
export const word = (value: bigint): string =>
  `0x${value.toString(16).padStart(64, '0')}`;

/**
 * Encodes a string as the ABI result of a call that returns `string`.
 *
 * @param {string} value - The string.
 * @returns {string} The `0x` prefixed ABI data.
 */
export const abiString = (value: string): string => {
  const hex = Buffer.from(value, 'utf8').toString('hex');
  const padded = hex.padEnd(Math.ceil(hex.length / 64) * 64, '0');
  return `${word(32n)}${word(BigInt(hex.length / 2)).slice(2)}${padded}`;
};

/**
 * Returns the call data of a request sent with `eth_call`.
 *
 * @param {ReceivedRequest} request - The request.
 * @returns {string} The call data.
 */
export const callData = (request: ReceivedRequest): string => {
  const [params] = request.body.params;
  return typeof params === 'string' ? params : params.data;
};

/**
 * Returns the contract address of a request sent with `eth_call`.
 *
 * @param {ReceivedRequest} request - The request.
 * @returns {string} The contract address.
 */
export const callTarget = (request: ReceivedRequest): string => {
  const [params] = request.body.params;
  return typeof params === 'string' ? params : params.to;
};
