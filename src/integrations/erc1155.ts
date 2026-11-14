import type { AxiosInstance } from 'axios';

import { Erc1155, EthMethod } from '../lib/interfaces/ethMethods.js';
import type { JsonRpcRequestPayload } from '../lib/interfaces/jsonRpcRequest.js';

import { constructEthMethodPayload, sendEthRequest } from '../utils/ethCall.js';
import { format } from '../utils/formatting.js';

/**
 * erc1155 integration for managing Ethereum RPC requests related to erc1155 tokens.
 *
 * @fileoverview This file provides helper functions for Ethereum JSON-RPC interactions for erc1155 tokens.
 * @namespace erc1155
 */
export const erc1155 = {
  /**
   * Fetches the token balance for a specific token ID at a given account address.
   *
   * @param {string} accountAddress - The account address to fetch the token balance from.
   * @param {string} contractAddress - The contract address of the erc1155 token.
   * @param {string | number | bigint} tokenId - The token id, as a decimal string, a `0x` prefixed hex string, a safe integer or a bigint.
   * @param {AxiosInstance} ethereumInstance - The ethereum client instance.
   * @returns {Promise<string>} The balance of the token id at the account address.
   *
   * @example
   * const balance = erc1155.getBalanceOf('0xACCOUNT_ADDRESS', '0xCONTRACT_ADDRESS', 'TOKEN_ID', ethereumInstance);
   */
  getBalanceOf: async (
    accountAddress: string,
    contractAddress: string,
    tokenId: string | number | bigint,
    ethereumInstance: AxiosInstance
  ): Promise<string> => {
    const data: JsonRpcRequestPayload = constructEthMethodPayload(
      {
        to: format.checkAddress(contractAddress),
        data: `${Erc1155.BalanceOf}${format.encodeAddress(accountAddress)}${format.encodeUint256(tokenId)}`,
      },
      EthMethod.Call
    );

    const result = await sendEthRequest(
      ethereumInstance,
      data,
      'erc1155/getBalanceOf'
    );

    return format.formatTokenAmount(result, 0);
  },

  /**
   * Fetches the token balances for pairs of account address and token ID.
   *
   * @param {string[]} accountAddresses - The account addresses to fetch the token balances from.
   * @param {string} contractAddress - The contract address of the erc1155 token.
   * @param {(string | number | bigint)[]} tokenIds - The token ids, one per account address.
   * @param {AxiosInstance} ethereumInstance - The ethereum client instance.
   * @returns {Promise<string[]>} The balance of each pair, in the order of the arguments.
   *
   * @example
   * const balances = erc1155.getBalanceOfBatch(['0xACCOUNT_ADDRESS_1', '0xACCOUNT_ADDRESS_2'], '0xCONTRACT_ADDRESS', ['TOKEN_ID_1', 'TOKEN_ID_2'], ethereumInstance);
   */
  getBalanceOfBatch: async (
    accountAddresses: string[],
    contractAddress: string,
    tokenIds: (string | number | bigint)[],
    ethereumInstance: AxiosInstance
  ): Promise<string[]> => {
    const data: JsonRpcRequestPayload = constructEthMethodPayload(
      {
        to: format.checkAddress(contractAddress),
        data: `${Erc1155.BalanceOfBatch}${format.encodeBalanceOfBatchArgs(accountAddresses, tokenIds)}`,
      },
      EthMethod.Call
    );

    const result = await sendEthRequest(
      ethereumInstance,
      data,
      'erc1155/getBalanceOfBatch'
    );

    return format
      .decodeUint256Array(result)
      .map((balance) => balance.toString());
  },
};
