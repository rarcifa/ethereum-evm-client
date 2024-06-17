import { AxiosInstance, AxiosResponse } from 'axios';

import { Erc20, EthMethod } from '../lib/interfaces/ethMethods.js';
import { JsonRpcRequestPayload } from '../lib/interfaces/jsonRpcRequest.js';
import { JsonRpcResponse } from '../lib/interfaces/jsonRpcResponse.js';

import { constructEthMethodPayload } from '../utils/ethCall.js';
import { format } from '../utils/formatting.js';

/**
 * erc20 integration for managing Ethereum RPC requests.
 *
 * @fileoverview This file provides helper functions for Ethereum JSON-RPC interactions.
 * @namespace erc20
 */
export const erc20 = {
  /**
   * Fetches the balance of an account.
   *
   * @param {JsonRpcRequestPayload} accountAddress - The account address to fetch the balance from.
   * @param {AxiosInstance} ethereumInstance - The ethereum client to initialize the erc20 instance
   * @returns {Promise<string>} The main token balance of the account.
   *
   * @example
   * const data = erc20.getBalance('0xACCOUNT_ADDRESS');
   */
  getBalance: async (
    accountAddress: string,
    ethereumInstance: AxiosInstance
  ): Promise<string> => {
    const data: JsonRpcRequestPayload = constructEthMethodPayload(
      accountAddress,
      EthMethod.GetBalance
    );

    try {
      const response: AxiosResponse<JsonRpcResponse<string>> =
        await ethereumInstance.post<JsonRpcResponse<string>>('', data);

      if (response.data.error) {
        console.log('[erc20/getBalance] error:', response.data.error.message);
        throw new Error(
          `[erc20/getBalance] error: ${response.data.error.message}`
        );
      }

      if (!response.data.result) {
        console.error('[erc20/getBalance] error: No result returned');
        throw new Error('[erc20/getBalance] error: No result returned');
      }

      const result: string = format.weiToEther(response.data.result);
      return result;
    } catch (e) {
      console.error('[erc20/getBalance] error:', e);
      throw e;
    }
  },

  /**
   * Fetches the token balance of an account of the erc20 token.
   *
   * @param {string} accountAddress - The account address to fetch the balance from.
   * @param {string} contractAddress - The contract address of the erc20 instance.
   * @param {AxiosInstance} ethereumInstance - The ethereum client to initialize the erc20 instance
   * @returns {Promise<string>} The erc20 token balance of the account.
   *
   * @example
   * const data = erc20.getBalanceOf('0xACCOUNT_ADDRESS', '0xCONTRACT_ADDRESS');
   */
  getBalanceOf: async (
    accountAddress: string,
    contractAddress: string,
    ethereumInstance: AxiosInstance
  ): Promise<string> => {
    const paddedAddress = accountAddress.substring(2).padStart(64, '0');
    const param = `${Erc20.BalanceOf}${paddedAddress}`;
    const data: JsonRpcRequestPayload = constructEthMethodPayload(
      {
        to: contractAddress,
        data: param,
      },
      EthMethod.Call
    );

    try {
      const response: AxiosResponse<JsonRpcResponse<string>> =
        await ethereumInstance.post<JsonRpcResponse<string>>('', data);

      if (response.data.error) {
        console.error(
          '[erc20/getBalanceOf] error:',
          response.data.error.message
        );
        throw new Error(
          `[erc20/getBalanceOf] error: ${response.data.error.message}`
        );
      }

      if (!response.data.result) {
        console.error('[erc20/getBalanceOf] error: No result returned');
        throw new Error('[erc20/getBalanceOf] error: No result returned');
      }

      const result: string = format.weiToEther(response.data.result);
      return result;
    } catch (e) {
      console.error('[erc20/getBalanceOf] error:', e);
      throw e;
    }
  },

  /**
   * Fetches the name of the erc20 token.
   *
   * @param {string} contractAddress - The contract address of the erc20 instance.
   * @param {AxiosInstance} ethereumInstance - The ethereum client to initialize the erc20 instance
   * @returns {Promise<string>} The name of the token.
   *
   * @example
   * const data = erc20.getName('0xCONTRACT_ADDRESS');
   */
  getName: async (
    contractAddress: string,
    ethereumInstance: AxiosInstance
  ): Promise<string> => {
    const data: JsonRpcRequestPayload = constructEthMethodPayload(
      {
        to: contractAddress,
        data: Erc20.Name,
      },
      EthMethod.Call
    );

    try {
      const response: AxiosResponse<JsonRpcResponse<string>> =
        await ethereumInstance.post<JsonRpcResponse<string>>('', data);

      if (response.data.error) {
        console.error('[erc20/getName] error:', response.data.error.message);
        throw new Error(
          `[erc20/getName] error: ${response.data.error.message}`
        );
      }

      if (!response.data.result) {
        console.error('[erc20/getName] error: No result returned');
        throw new Error('[erc20/getName] error: No result returned');
      }

      const result: string = format.decodeHexString(response.data.result);
      return result;
    } catch (e) {
      console.error('[erc20/getName] error:', e);
      throw e;
    }
  },

  /**
   * Fetches the symbol of the erc20 token.
   *
   * @param {string} contractAddress - The contract address of the erc20 instance.
   * @param {AxiosInstance} ethereumInstance - The ethereum client to initialize the erc20 instance
   * @returns {Promise<string>} The symbol of the token.
   *
   * @example
   * const data = erc20.getSymbol('0xCONTRACT_ADDRESS');
   */
  getSymbol: async (
    contractAddress: string,
    ethereumInstance: AxiosInstance
  ): Promise<string> => {
    const data: JsonRpcRequestPayload = constructEthMethodPayload(
      {
        to: contractAddress,
        data: Erc20.Symbol,
      },
      EthMethod.Call
    );

    try {
      const response: AxiosResponse<JsonRpcResponse<string>> =
        await ethereumInstance.post<JsonRpcResponse<string>>('', data);

      if (response.data.error) {
        console.error('[erc20/getSymbol] error:', response.data.error.message);
        throw new Error(
          `[erc20/getSymbol] error: ${response.data.error.message}`
        );
      }

      if (!response.data.result) {
        console.error('[erc20/getSymbol] error: No result returned');
        throw new Error('[erc20/getSymbol] error: No result returned');
      }

      const result: string = format.decodeHexString(response.data.result);
      return result;
    } catch (e) {
      console.error('[erc20/getSymbol] error:', e);
      throw e;
    }
  },

  /**
   * Fetches the total supply of the erc20 token.
   *
   * @param {string} contractAddress - The contract address of the erc20 instance.
   * @param {AxiosInstance} ethereumInstance - The ethereum client to initialize the erc20 instance
   * @returns {Promise<string>} The total supply of the token.
   *
   * @example
   * const data = erc20.getTotalSupply('0xCONTRACT_ADDRESS');
   */
  getTotalSupply: async (
    contractAddress: string,
    ethereumInstance: AxiosInstance
  ): Promise<string> => {
    const data: JsonRpcRequestPayload = constructEthMethodPayload(
      {
        to: contractAddress,
        data: Erc20.TotalSupply,
      },
      EthMethod.Call
    );

    try {
      const response: AxiosResponse<JsonRpcResponse<string>> =
        await ethereumInstance.post<JsonRpcResponse<string>>('', data);

      if (response.data.error) {
        console.error(
          '[erc20/getTotalSupply] error:',
          response.data.error.message
        );
        throw new Error(
          `[erc20/getTotalSupply] error: ${response.data.error.message}`
        );
      }

      if (!response.data.result) {
        console.error('[erc20/getTotalSupply] error: No result returned');
        throw new Error('[erc20/getTotalSupply] error: No result returned');
      }

      const result: string = format.formatTokenAmount(response.data.result, 18);
      return result;
    } catch (e) {
      console.error('[erc20/getTotalSupply] error:', e);
      throw e;
    }
  },
};
