import { afterEach, describe, expect, it } from '@jest/globals';

import {
  EthereumClient,
  EvmClientError,
  InvalidArgumentError,
  InvalidResponseError,
  RequestError,
  RpcError,
  createClient,
} from '../../index.js';
import {
  abiString,
  callData,
  callTarget,
  startRpcServer,
  word,
} from '../helpers/rpcServer.js';
import type { RpcHandler, RpcServer } from '../helpers/rpcServer.js';

/** An account address with mixed letter case. */
const ACCOUNT = '0x18cF36D6925026f00A57754757Ecd480B92cBefC';

/** An account address with leading zeros. */
const OTHER_ACCOUNT = '0x0000000000000000000000000000000000c0ffee';

/** A token contract address. */
const TOKEN = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

/** The call data of `decimals()`. */
const DECIMALS = '0x313ce567';

/** The server of the running test, closed after each test. */
let activeServer: RpcServer | undefined;

/**
 * Starts a JSON-RPC server with the handler and returns a client for it.
 *
 * @param handler - Builds the answer of each request.
 * @param apiKey - Optional. The api key of the client.
 * @returns The client and the server.
 */
const setup = async (handler: RpcHandler, apiKey?: string) => {
  activeServer = await startRpcServer(handler);
  return {
    client: createClient({ endpoint: activeServer.url, apiKey }),
    server: activeServer,
  };
};

/**
 * Answers `decimals()` with the given decimals and every other call with the result.
 *
 * @param decimals - The decimals of the token.
 * @param result - The result of every other call.
 * @returns The handler.
 */
const tokenHandler =
  (decimals: number, result: string): RpcHandler =>
  (body) => {
    const [params] = body.params;
    const data = typeof params === 'string' ? '' : params.data;
    return { result: data === DECIMALS ? word(BigInt(decimals)) : result };
  };

/**
 * Returns the error a promise rejects with.
 *
 * @param promise - The promise.
 * @returns The rejection reason, or `undefined` when the promise resolves.
 */
const rejection = async (promise: Promise<unknown>): Promise<unknown> => {
  try {
    await promise;
    return undefined;
  } catch (error) {
    return error;
  }
};

afterEach(async () => {
  await activeServer?.close();
  activeServer = undefined;
});

describe('erc20', () => {
  it('fetches the native balance of an account in Ether, exactly', async () => {
    const { client, server } = await setup(() => ({
      result: `0x${123456789123456789123n.toString(16)}`,
    }));

    await expect(client.erc20.getBalance(ACCOUNT)).resolves.toBe(
      '123.456789123456789123'
    );
    expect(server.requests[0].body).toMatchObject({
      method: 'eth_getBalance',
      params: [ACCOUNT, 'latest'],
    });
  });

  it('formats a token balance with the decimals of the token', async () => {
    const { client, server } = await setup(tokenHandler(6, word(1234567n)));

    await expect(client.erc20.getBalanceOf(ACCOUNT, TOKEN)).resolves.toBe(
      '1.234567'
    );
    const balanceCall = server.requests.find((r) => callData(r) !== DECIMALS);
    expect(balanceCall && callTarget(balanceCall)).toBe(TOKEN);
    expect(balanceCall && callData(balanceCall)).toBe(
      `0x70a08231${ACCOUNT.slice(2).toLowerCase().padStart(64, '0')}`
    );
  });

  it('keeps every digit of large 18-decimal balances', async () => {
    const { client } = await setup(
      tokenHandler(18, word(123456789012345678901234567890n))
    );

    await expect(client.erc20.getBalanceOf(ACCOUNT, TOKEN)).resolves.toBe(
      '123456789012.34567890123456789'
    );
  });

  it('fetches the decimals of a token', async () => {
    const { client } = await setup(tokenHandler(6, word(0n)));

    await expect(client.erc20.getDecimals(TOKEN)).resolves.toBe(6);
  });

  it('decodes the name and symbol of a token', async () => {
    const { client } = await setup((body) => {
      const [params] = body.params;
      const data = typeof params === 'string' ? '' : params.data;
      return {
        result: abiString(data === '0x06fdde03' ? 'Tether USD' : 'USDT'),
      };
    });

    await expect(client.erc20.getName(TOKEN)).resolves.toBe('Tether USD');
    await expect(client.erc20.getSymbol(TOKEN)).resolves.toBe('USDT');
  });

  it('decodes a bytes32 symbol', async () => {
    const { client } = await setup(() => ({
      result: `0x${Buffer.from('MKR').toString('hex').padEnd(64, '0')}`,
    }));

    await expect(client.erc20.getSymbol(TOKEN)).resolves.toBe('MKR');
  });

  it('formats the total supply with the decimals of the token', async () => {
    const { client } = await setup(tokenHandler(2, word(1234567n)));

    await expect(client.erc20.getTotalSupply(TOKEN)).resolves.toBe('12345.67');
  });
});

describe('erc721', () => {
  it('fetches the number of tokens an account owns', async () => {
    const { client, server } = await setup(() => ({ result: word(3n) }));

    await expect(client.erc721.getBalanceOf(ACCOUNT, TOKEN)).resolves.toBe('3');
    expect(callData(server.requests[0]).slice(0, 10)).toBe('0x70a08231');
  });

  it('encodes a decimal token id as a number', async () => {
    const { client, server } = await setup(() => ({
      result: word(BigInt(OTHER_ACCOUNT)),
    }));

    await expect(client.erc721.getOwnerOf(TOKEN, '6522')).resolves.toBe(
      OTHER_ACCOUNT
    );
    expect(callData(server.requests[0])).toBe(
      `0x6352211e${(6522).toString(16).padStart(64, '0')}`
    );
  });

  it('accepts hex, number and bigint token ids', async () => {
    const { client, server } = await setup(() => ({
      result: word(BigInt(ACCOUNT)),
    }));

    await client.erc721.getOwnerOf(TOKEN, '0x197a');
    await client.erc721.getOwnerOf(TOKEN, 6522);
    await client.erc721.getOwnerOf(TOKEN, 6522n);

    const encoded = (6522).toString(16).padStart(64, '0');
    expect(server.requests.map((r) => callData(r).slice(10))).toEqual([
      encoded,
      encoded,
      encoded,
    ]);
  });

  it('returns the token uri without fetching it', async () => {
    const { client, server } = await setup(() => ({
      result: abiString('ipfs://bafy/6522.json'),
    }));

    await expect(client.erc721.getTokenUri(TOKEN, '6522')).resolves.toBe(
      'ipfs://bafy/6522.json'
    );
    expect(server.requests).toHaveLength(1);
  });
});

describe('erc1155', () => {
  it('fetches the balance of one token id', async () => {
    const { client, server } = await setup(() => ({ result: word(5n) }));

    await expect(
      client.erc1155.getBalanceOf(ACCOUNT, TOKEN, '4')
    ).resolves.toBe('5');
    expect(callData(server.requests[0])).toBe(
      `0x00fdd58e${ACCOUNT.slice(2).toLowerCase().padStart(64, '0')}${word(4n).slice(2)}`
    );
  });

  it('ABI encodes balanceOfBatch and returns one balance per pair', async () => {
    const { client, server } = await setup(() => ({
      result: `${word(32n)}${word(2n).slice(2)}${word(7n).slice(2)}${word(9n).slice(2)}`,
    }));

    await expect(
      client.erc1155.getBalanceOfBatch([ACCOUNT, OTHER_ACCOUNT], TOKEN, [
        '1',
        '2',
      ])
    ).resolves.toEqual(['7', '9']);

    const args = callData(server.requests[0]).slice(10);
    const words = args.match(/.{64}/g)?.map((w) => BigInt(`0x${w}`));
    expect(words).toEqual([
      64n,
      160n,
      2n,
      BigInt(ACCOUNT),
      BigInt(OTHER_ACCOUNT),
      2n,
      1n,
      2n,
    ]);
  });

  it('rejects arrays of different lengths before sending', async () => {
    const { client, server } = await setup(() => ({ result: word(0n) }));

    await expect(
      client.erc1155.getBalanceOfBatch([ACCOUNT], TOKEN, ['1', '2'])
    ).rejects.toThrow(
      '[format/encodeBalanceOfBatchArgs] error: Address and Token IDs arrays must be of the same length'
    );
    expect(server.requests).toHaveLength(0);
  });
});

describe('client', () => {
  it('creates the same client with createClient and new EthereumClient', async () => {
    const { server } = await setup(() => ({ result: abiString('USDT') }));
    const client = new EthereumClient({ endpoint: server.url });

    expect(createClient({ endpoint: server.url })).toBeInstanceOf(
      EthereumClient
    );
    await expect(client.erc20.getSymbol(TOKEN)).resolves.toBe('USDT');
  });

  it('sends the api key as a bearer token', async () => {
    const { client, server } = await setup(() => ({ result: '0x0' }), 'k3y');

    await client.erc20.getBalance(ACCOUNT);

    expect(server.requests[0].headers.authorization).toBe('Bearer k3y');
  });
});

describe('errors', () => {
  it('throws an RpcError with the code and data of a JSON-RPC error', async () => {
    const { client } = await setup(() => ({
      error: { code: -32000, message: 'execution reverted' },
    }));

    const error = await rejection(client.erc20.getName(TOKEN));

    expect(error).toBeInstanceOf(RpcError);
    expect(error).toBeInstanceOf(EvmClientError);
    expect(error).toMatchObject({
      name: 'RpcError',
      code: -32000,
      context: 'erc20/getName',
      message: '[erc20/getName] error: execution reverted',
    });
  });

  it('reads a JSON-RPC error sent with an HTTP error status', async () => {
    const { client } = await setup(() => ({
      raw: {
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          error: { code: -32603, message: 'internal error' },
        }),
      },
    }));

    const error = await rejection(client.erc20.getName(TOKEN));

    expect(error).toBeInstanceOf(RpcError);
    expect(error).toMatchObject({ code: -32603 });
  });

  it('throws a RequestError for an HTTP error status without a JSON-RPC error', async () => {
    const { client } = await setup(() => ({
      raw: {
        status: 429,
        contentType: 'text/plain',
        body: 'Too Many Requests',
      },
    }));

    const error = await rejection(client.erc20.getName(TOKEN));

    expect(error).toBeInstanceOf(RequestError);
    expect(error).toMatchObject({
      message: '[erc20/getName] error: Request failed with HTTP status 429',
    });
  });

  it('throws a RequestError with the cause when the node cannot be reached', async () => {
    const client = createClient({ endpoint: 'http://127.0.0.1:1' });

    const error = await rejection(client.erc20.getBalance(ACCOUNT));

    expect(error).toBeInstanceOf(RequestError);
    expect(error).toMatchObject({ context: 'erc20/getBalance' });
    expect(error).toMatchObject({ cause: expect.any(Error) });
  });

  it('throws a RequestError when the request times out', async () => {
    const { server } = await setup(() => ({ hang: true }));
    const client = createClient({ endpoint: server.url, timeout: 100 });

    const error = await rejection(client.erc20.getName(TOKEN));

    expect(error).toBeInstanceOf(RequestError);
    expect(error).toMatchObject({ message: expect.stringMatching(/timeout/) });
  });

  it.each([
    [
      'an HTML page',
      { raw: { status: 200, contentType: 'text/html', body: '<html></html>' } },
      'The answer is not a JSON-RPC response',
    ],
    ['an empty result', { result: '0x' }, 'No result returned'],
    [
      'an object result',
      { result: { value: 1 } },
      'The result is not a hex string',
    ],
    ['a text result', { result: 'hello' }, 'The result is not a hex string'],
  ] as const)(
    'throws an InvalidResponseError for %s',
    async (_, answer, description) => {
      const { client } = await setup(() => answer);

      const error = await rejection(client.erc20.getName(TOKEN));

      expect(error).toBeInstanceOf(InvalidResponseError);
      expect(error).toMatchObject({
        message: `[erc20/getName] error: ${description}`,
      });
    }
  );

  it('rejects ABI data that claims more elements than it holds', async () => {
    const { client } = await setup(() => ({
      result: `${word(32n)}${word(2n ** 200n).slice(2)}`,
    }));

    const error = await rejection(
      client.erc1155.getBalanceOfBatch([ACCOUNT], TOKEN, ['1'])
    );

    expect(error).toBeInstanceOf(InvalidResponseError);
    expect(error).toMatchObject({ context: 'format/decodeUint256Array' });
  });

  it('rejects a word wider than an address', async () => {
    const { client } = await setup(() => ({ result: `0x${'f'.repeat(64)}` }));

    const error = await rejection(client.erc721.getOwnerOf(TOKEN, '1'));

    expect(error).toBeInstanceOf(InvalidResponseError);
    expect(error).toMatchObject({ context: 'format/decodeAddress' });
  });

  it('rejects more than 255 decimals', async () => {
    const { client } = await setup(() => ({ result: word(2n ** 100n) }));

    const error = await rejection(client.erc20.getDecimals(TOKEN));

    expect(error).toBeInstanceOf(InvalidResponseError);
    expect(error).toMatchObject({
      message: `[erc20/getDecimals] error: Invalid decimals: ${2n ** 100n}`,
    });
  });

  it('rejects invalid arguments before sending, as a rejected promise', async () => {
    const { client, server } = await setup(() => ({ result: word(0n) }));

    const calls = [
      client.erc721.getBalanceOf('0x123', TOKEN),
      client.erc20.getName('not-an-address'),
      client.erc721.getOwnerOf(TOKEN, '-1'),
      client.erc1155.getBalanceOfBatch([ACCOUNT], TOKEN, ['1', '2']),
    ];
    const errors = await Promise.all(calls.map(rejection));

    expect(
      errors.map((error) => error instanceof InvalidArgumentError)
    ).toEqual([true, true, true, true]);
    expect(
      errors.map((error) =>
        error instanceof EvmClientError ? error.context : undefined
      )
    ).toEqual([
      'format/encodeAddress',
      'format/checkAddress',
      'format/encodeUint256',
      'format/encodeBalanceOfBatchArgs',
    ]);
    expect(server.requests).toHaveLength(0);
  });
});
