import { createServer } from 'node:http';
import type { IncomingHttpHeaders, Server } from 'node:http';
import type { AddressInfo } from 'node:net';

import type { JsonRpcRequestPayload } from '../../lib/interfaces/jsonRpcRequest.js';

/**
 * A request received by the test server.
 */
export interface ReceivedRequest {
  /** The JSON-RPC payload of the request. */
  body: JsonRpcRequestPayload;

  /** The HTTP headers of the request. */
  headers: IncomingHttpHeaders;
}

/**
 * An HTTP answer sent as it is, to test answers that are not a JSON-RPC response.
 */
export interface RawAnswer {
  /** The HTTP status code. */
  status: number;

  /** The `Content-Type` header. */
  contentType: string;

  /** The body, sent unchanged. */
  body: string;
}

/**
 * Function that builds the answer to one JSON-RPC request: the `result` or `error` member of a JSON-RPC response, a
 * raw HTTP answer, or no answer at all.
 */
export type RpcHandler = (
  body: JsonRpcRequestPayload
) =>
  | { result: unknown }
  | { error: { code: number; message: string } }
  | { raw: RawAnswer }
  | { hang: true };

/**
 * A JSON-RPC server on the loopback interface, for tests that need no network.
 */
export interface RpcServer {
  /** The URL of the server, such as `http://127.0.0.1:50123`. */
  url: string;

  /** The requests the server received, in order. */
  requests: ReceivedRequest[];

  /** Stops the server. */
  close: () => Promise<void>;
}

/**
 * Starts a JSON-RPC server on 127.0.0.1 that answers every request with the handler.
 *
 * @param handler - Builds the answer of each request.
 * @returns The server, its url and the requests it received.
 * @throws {@link Error} When the server does not listen on a TCP address.
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
      const answer = handler(body);

      if ('hang' in answer) {
        return;
      }

      if ('raw' in answer) {
        res.statusCode = answer.raw.status;
        res.setHeader('Content-Type', answer.raw.contentType);
        res.end(answer.raw.body);
        return;
      }

      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ jsonrpc: '2.0', id: body.id, ...answer }));
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
        server.closeAllConnections();
        server.close((error) => (error ? reject(error) : resolve()));
      }),
  };
};

/**
 * Encodes a number as one ABI word.
 *
 * @param value - The number.
 * @returns The `0x` prefixed word.
 */
export const word = (value: bigint): string =>
  `0x${value.toString(16).padStart(64, '0')}`;

/**
 * Encodes a string as the ABI result of a call that returns `string`.
 *
 * @param value - The string.
 * @returns The `0x` prefixed ABI data.
 */
export const abiString = (value: string): string => {
  const hex = Buffer.from(value, 'utf8').toString('hex');
  const padded = hex.padEnd(Math.ceil(hex.length / 64) * 64, '0');
  return `${word(32n)}${word(BigInt(hex.length / 2)).slice(2)}${padded}`;
};

/**
 * Returns the call data of a request sent with `eth_call`.
 *
 * @param request - The request.
 * @returns The call data.
 */
export const callData = (request: ReceivedRequest): string => {
  const [params] = request.body.params;
  return typeof params === 'string' ? params : params.data;
};

/**
 * Returns the contract address of a request sent with `eth_call`.
 *
 * @param request - The request.
 * @returns The contract address.
 */
export const callTarget = (request: ReceivedRequest): string => {
  const [params] = request.body.params;
  return typeof params === 'string' ? params : params.to;
};
