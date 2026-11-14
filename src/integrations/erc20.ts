import type { AxiosInstance } from 'axios';

import { Erc20, EthMethod } from '../lib/interfaces/ethMethods.js';
import type { JsonRpcRequestPayload } from '../lib/interfaces/jsonRpcRequest.js';

import { constructEthMethodPayload, sendEthRequest } from '../utils/ethCall.js';
import { format } from '../utils/formatting.js';

/**
 * erc20 integration for managing Ethereum RPC requests.
 *
 * @fileoverview This file provides helper functions for Ethereum JSON-RPC interactions for erc20 tokens.
 * @namespace erc20
 */
export const erc20 = {
  /**
   * Fetches the native token balance of an account.
   *
   * @param {string} accountAddress - The account address to fetch the balance from.
   * @param {AxiosInstance} ethereumInstance - The ethereum client to initialize the erc20 instance
   * @returns {Promise<string>} The native token balance of the account, in Ether.
   *
   * @example
   * const data = erc20.getBalance('0xACCOUNT_ADDRESS', ethereumInstance);
   */
  getBalance: async (
    accountAddress: string,
    ethereumInstance: AxiosInstance
  ): Promise<string> => {
    const data: JsonRpcRequestPayload = constructEthMethodPayload(
      format.checkAddress(accountAddress),
      EthMethod.GetBalance
    );

    const result = await sendEthRequest(
      ethereumInstance,
      data,
      'erc20/getBalance'
    );

    return format.weiToEther(result);
  },

  /**
   * Fetches the number of decimals of the erc20 token.
   *
   * @param {string} contractAddress - The contract address of the erc20 instance.
   * @param {AxiosInstance} ethereumInstance - The ethereum client to initialize the erc20 instance
   * @returns {Promise<number>} The number of decimals the token uses.
   *
   * @example
   * const data = erc20.getDecimals('0xCONTRACT_ADDRESS', ethereumInstance);
   */
  getDecimals: async (
    contractAddress: string,
    ethereumInstance: AxiosInstance
  ): Promise<number> => {
    const data: JsonRpcRequestPayload = constructEthMethodPayload(
      {
        to: format.checkAddress(contractAddress),
        data: Erc20.Decimals,
      },
      EthMethod.Call
    );

    const result = await sendEthRequest(
      ethereumInstance,
      data,
      'erc20/getDecimals'
    );

    return Number(format.formatTokenAmount(result, 0));
  },

  /**
   * Fetches the token balance of an account of the erc20 token, using the decimals of the token.
   *
   * @param {string} accountAddress - The account address to fetch the balance from.
   * @param {string} contractAddress - The contract address of the erc20 instance.
   * @param {AxiosInstance} ethereumInstance - The ethereum client to initialize the erc20 instance
   * @returns {Promise<string>} The erc20 token balance of the account.
   *
   * @example
   * const data = erc20.getBalanceOf('0xACCOUNT_ADDRESS', '0xCONTRACT_ADDRESS', ethereumInstance);
   */
  getBalanceOf: async (
    accountAddress: string,
    contractAddress: string,
    ethereumInstance: AxiosInstance
  ): Promise<string> => {
    const data: JsonRpcRequestPayload = constructEthMethodPayload(
      {
        to: format.checkAddress(contractAddress),
        data: `${Erc20.BalanceOf}${format.encodeAddress(accountAddress)}`,
      },
      EthMethod.Call
    );

    const [result, decimals] = await Promise.all([
      sendEthRequest(ethereumInstance, data, 'erc20/getBalanceOf'),
      erc20.getDecimals(contractAddress, ethereumInstance),
    ]);

    return format.formatTokenAmount(result, decimals);
  },

  /**
   * Fetches the name of the erc20 token.
   *
   * @param {string} contractAddress - The contract address of the erc20 instance.
   * @param {AxiosInstance} ethereumInstance - The ethereum client to initialize the erc20 instance
   * @returns {Promise<string>} The name of the token.
   *
   * @example
   * const data = erc20.getName('0xCONTRACT_ADDRESS', ethereumInstance);
   */
  getName: async (
    contractAddress: string,
    ethereumInstance: AxiosInstance
  ): Promise<string> => {
    const data: JsonRpcRequestPayload = constructEthMethodPayload(
      {
        to: format.checkAddress(contractAddress),
        data: Erc20.Name,
      },
      EthMethod.Call
    );

    const result = await sendEthRequest(
      ethereumInstance,
      data,
      'erc20/getName'
    );

    return format.decodeHexString(result);
  },

  /**
   * Fetches the symbol of the erc20 token.
   *
   * @param {string} contractAddress - The contract address of the erc20 instance.
   * @param {AxiosInstance} ethereumInstance - The ethereum client to initialize the erc20 instance
   * @returns {Promise<string>} The symbol of the token.
   *
   * @example
   * const data = erc20.getSymbol('0xCONTRACT_ADDRESS', ethereumInstance);
   */
  getSymbol: async (
    contractAddress: string,
    ethereumInstance: AxiosInstance
  ): Promise<string> => {
    const data: JsonRpcRequestPayload = constructEthMethodPayload(
      {
        to: format.checkAddress(contractAddress),
        data: Erc20.Symbol,
      },
      EthMethod.Call
    );

    const result = await sendEthRequest(
      ethereumInstance,
      data,
      'erc20/getSymbol'
    );

    return format.decodeHexString(result);
  },

  /**
   * Fetches the total supply of the erc20 token, using the decimals of the token.
   *
   * @param {string} contractAddress - The contract address of the erc20 instance.
   * @param {AxiosInstance} ethereumInstance - The ethereum client to initialize the erc20 instance
   * @returns {Promise<string>} The total supply of the token.
   *
   * @example
   * const data = erc20.getTotalSupply('0xCONTRACT_ADDRESS', ethereumInstance);
   */
  getTotalSupply: async (
    contractAddress: string,
    ethereumInstance: AxiosInstance
  ): Promise<string> => {
    const data: JsonRpcRequestPayload = constructEthMethodPayload(
      {
        to: format.checkAddress(contractAddress),
        data: Erc20.TotalSupply,
      },
      EthMethod.Call
    );

    const [result, decimals] = await Promise.all([
      sendEthRequest(ethereumInstance, data, 'erc20/getTotalSupply'),
      erc20.getDecimals(contractAddress, ethereumInstance),
    ]);

    return format.formatTokenAmount(result, decimals);
  },
};
