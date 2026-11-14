import axios, { AxiosInstance } from 'axios';
import { afterEach, describe, expect, it, jest } from '@jest/globals';

import { createClient } from '../../lib/client/ethereumClient.js';

/**
 * Encodes a string as an ABI `string` return value: offset, length, data.
 *
 * @param {string} value - The string to encode.
 * @returns {string} The ABI encoded hex string.
 */
const encodeString = (value: string): string => {
  const hex = Buffer.from(value, 'utf8').toString('hex');
  const offset = (32).toString(16).padStart(64, '0');
  const length = value.length.toString(16).padStart(64, '0');
  const data = hex.padEnd(Math.ceil(hex.length / 64) * 64, '0');
  return `0x${offset}${length}${data}`;
};

/**
 * Encodes a number as a single ABI `uint256` word.
 *
 * @param {bigint} value - The number to encode.
 * @returns {string} The ABI encoded hex string.
 */
const encodeUint = (value: bigint): string =>
  `0x${value.toString(16).padStart(64, '0')}`;

/**
 * Creates a client whose RPC endpoint answers with the given results, in
 * order, without any network access.
 *
 * @param {string[]} results - The JSON-RPC results to return, one per call.
 * @returns {object} The client and the stubbed post function.
 */
const stubClient = (...results: string[]) => {
  const post = jest.fn<Promise<unknown>, [string, any]>();
  for (const result of results) {
    post.mockResolvedValueOnce({ data: { jsonrpc: '2.0', id: 1, result } });
  }
  jest
    .spyOn(axios, 'create')
    .mockReturnValue({ post } as unknown as AxiosInstance);
  const client = createClient({ endpoint: 'http://rpc.invalid' });
  return { client, post };
};

afterEach(() => {
  jest.restoreAllMocks();
});

describe('erc20 Integration Tests', () => {
  it('successfully fetches account balance', async () => {
    const { client, post } = stubClient('0xde0b6b3a7640000');

    const balance = await client.erc20.getBalance(
      '0x18cF36D6925026f00A57754757Ecd480B92cBefC'
    );

    expect(balance).toBe('1.000000000000000000');
    expect(post.mock.calls[0][1]).toMatchObject({
      method: 'eth_getBalance',
      params: ['0x18cF36D6925026f00A57754757Ecd480B92cBefC', 'latest'],
    });
  });

  it('successfully fetches erc20 balance', async () => {
    const { client, post } = stubClient(encodeUint(2n * 10n ** 18n));

    const balanceOf = await client.erc20.getBalanceOf(
      '0xe45E12B44fCa87e42dbC63A67bF5AA8aB800f459',
      '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE'
    );

    expect(balanceOf).toBe('2.000000000000000000');
    expect(post.mock.calls[0][1].method).toBe('eth_call');
    expect(post.mock.calls[0][1].params[0]).toEqual({
      to: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
      data:
        '0x70a08231' +
        'e45E12B44fCa87e42dbC63A67bF5AA8aB800f459'.padStart(64, '0'),
    });
  });

  it('successfully fetches erc20 name', async () => {
    const { client } = stubClient(encodeString('Tether USD'));

    const name = await client.erc20.getName(
      '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    );

    expect(name).toBe('Tether USD');
  });

  it('successfully fetches erc20 symbol', async () => {
    const { client } = stubClient(encodeString('USDT'));

    const symbol = await client.erc20.getSymbol(
      '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    );

    expect(symbol).toBe('USDT');
  });

  it('successfully fetches erc20 total supply', async () => {
    const { client } = stubClient(encodeUint(1234567n * 10n ** 17n));

    const totalSupply = await client.erc20.getTotalSupply(
      '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    );

    expect(totalSupply).toBe('123,456.7');
  });
});

describe('erc721 Integration Tests', () => {
  it('successfully fetches erc721 balance', async () => {
    const { client } = stubClient(encodeUint(3n));

    const balanceOf = await client.erc721.getBalanceOf(
      '0x18cF36D6925026f00A57754757Ecd480B92cBefC',
      '0x60E4d786628Fea6478F785A6d7e704777c86a7c6'
    );

    expect(balanceOf).toBe('3');
  });

  it('successfully fetches erc721 ownerOf', async () => {
    const { client } = stubClient(
      '0x00000000000000000000000018cf36d6925026f00a57754757ecd480b92cbefc'
    );

    const ownerOf = await client.erc721.getOwnerOf(
      '0x60E4d786628Fea6478F785A6d7e704777c86a7c6',
      '6522'
    );

    expect(ownerOf).toBe('0x18cf36d6925026f00a57754757ecd480b92cbefc');
  });

  it('successfully fetches erc721 uri', async () => {
    const { client } = stubClient(
      encodeString('https://metadata.invalid/6522')
    );
    const metadata = { name: 'Token #6522' };
    const get = jest.spyOn(axios, 'get').mockResolvedValue({ data: metadata });

    const uri = await client.erc721.getTokenUri(
      '0x60E4d786628Fea6478F785A6d7e704777c86a7c6',
      '6522'
    );

    expect(get).toHaveBeenCalledWith('https://metadata.invalid/6522');
    expect(uri).toBe(JSON.stringify(metadata));
  });
});

describe('erc1155 Integration Tests', () => {
  it('successfully fetches erc1155 balance', async () => {
    const { client } = stubClient(encodeUint(5n));

    const balanceOf = await client.erc1155.getBalanceOf(
      '0xA45cd9A7685cD9926e59C14305E3Af275F280949',
      '0xA45cd9A7685cD9926e59C14305E3Af275F280949',
      '4'
    );

    expect(balanceOf).toBe('5');
  });

  it('successfully fetches erc1155 balance of batch', async () => {
    const { client } = stubClient(encodeUint(7n));

    const balanceOfBatch = await client.erc1155.getBalanceOfBatch(
      [
        '0x990aef1085b2f6480a94bba53cbc03215d321e25',
        '0x9cd14e32E3B1AAf35D61EBD9066Ef8e3B06b23ad',
      ],
      '0xdc4aff511e1b94677142a43df90f948f9ae181dd',
      ['1', '2']
    );

    expect(balanceOfBatch).toBe('7');
  });
});
