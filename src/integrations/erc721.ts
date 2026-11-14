import type { AxiosInstance } from 'axios';

import { Erc721, EthMethod } from '../lib/interfaces/ethMethods.js';
import type { JsonRpcRequestPayload } from '../lib/interfaces/jsonRpcRequest.js';

import { constructEthMethodPayload, sendEthRequest } from '../utils/ethCall.js';
import { format } from '../utils/formatting.js';

/**
 * erc721 integration for managing Ethereum RPC requests.
 *
 * @fileoverview This file provides helper functions for Ethereum JSON-RPC interactions for erc721 tokens.
 * @namespace erc721
 */
export const erc721 = {
  /**
   * Fetches the token balance of the erc721 token.
   *
   * @param {string} accountAddress - The account address to fetch the balance from.
   * @param {string} contractAddress - The contract address of the erc721 instance.
   * @param {AxiosInstance} ethereumInstance - The ethereum client to initialize the erc721 instance
   * @returns {Promise<string>} The number of tokens the account owns.
   *
   * @example
   * const data = erc721.getBalanceOf('0xACCOUNT_ADDRESS', '0xCONTRACT_ADDRESS', ethereumInstance);
   */
  getBalanceOf: async (
    accountAddress: string,
    contractAddress: string,
    ethereumInstance: AxiosInstance
  ): Promise<string> => {
    const data: JsonRpcRequestPayload = constructEthMethodPayload(
      {
        to: format.checkAddress(contractAddress),
        data: `${Erc721.BalanceOf}${format.encodeAddress(accountAddress)}`,
      },
      EthMethod.Call
    );

    const result = await sendEthRequest(
      ethereumInstance,
      data,
      'erc721/getBalanceOf'
    );

    return format.formatTokenAmount(result, 0);
  },

  /**
   * Fetches the owner address of the erc721 token.
   *
   * @param {string} contractAddress - The contract address of the erc721 instance.
   * @param {string | number | bigint} tokenId - The token id, as a decimal string, a `0x` prefixed hex string, a safe integer or a bigint.
   * @param {AxiosInstance} ethereumInstance - The ethereum client to initialize the erc721 instance
   * @returns {Promise<string>} The owner address of the token, lowercase.
   *
   * @example
   * const data = erc721.getOwnerOf('0xCONTRACT_ADDRESS', 'TOKEN_ID', ethereumInstance);
   */
  getOwnerOf: async (
    contractAddress: string,
    tokenId: string | number | bigint,
    ethereumInstance: AxiosInstance
  ): Promise<string> => {
    const data: JsonRpcRequestPayload = constructEthMethodPayload(
      {
        to: format.checkAddress(contractAddress),
        data: `${Erc721.OwnerOf}${format.encodeUint256(tokenId)}`,
      },
      EthMethod.Call
    );

    const result = await sendEthRequest(
      ethereumInstance,
      data,
      'erc721/getOwnerOf'
    );

    return format.decodeAddress(result);
  },

  /**
   * Fetches the metadata uri of the erc721 token.
   *
   * @param {string} contractAddress - The contract address of the erc721 instance.
   * @param {string | number | bigint} tokenId - The token id, as a decimal string, a `0x` prefixed hex string, a safe integer or a bigint.
   * @param {AxiosInstance} ethereumInstance - The ethereum client to initialize the erc721 instance
   * @returns {Promise<string>} The uri of the token metadata, as the contract returns it.
   *
   * @example
   * const data = erc721.getTokenUri('0xCONTRACT_ADDRESS', 'TOKEN_ID', ethereumInstance);
   */
  getTokenUri: async (
    contractAddress: string,
    tokenId: string | number | bigint,
    ethereumInstance: AxiosInstance
  ): Promise<string> => {
    const data: JsonRpcRequestPayload = constructEthMethodPayload(
      {
        to: format.checkAddress(contractAddress),
        data: `${Erc721.TokenURI}${format.encodeUint256(tokenId)}`,
      },
      EthMethod.Call
    );

    const result = await sendEthRequest(
      ethereumInstance,
      data,
      'erc721/getTokenUri'
    );

    return format.decodeHexString(result);
  },
};
