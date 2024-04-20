import { logger } from '../utils/logger';
import { AxiosInstance, AxiosResponse } from 'axios';
import { JsonRpcResponse } from '../lib/interfaces/jsonRpcResponse.js';
import { JsonRpcRequestPayload } from '../lib/interfaces/jsonRpcRequest';
import { Erc1155, EthMethod } from '../lib/interfaces/ethMethods';
import { constructEthMethodPayload } from '../utils/ethCall';
import { format } from '../utils/formatting';

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
   * @param {string} tokenId - The specific token ID to check the balance of.
   * @param {AxiosInstance} ethereumInstance - The ethereum client instance.
   * @returns {Promise<string>} The balance of the erc1155 token for the specific token ID at the given account address.
   *
   * @example
   * const balance = erc1155.getBalanceOf('0xACCOUNT_ADDRESS', '0xCONTRACT_ADDRESS', 'TOKEN_ID', ethereumClient);
   */
  getBalanceOf: async (
    accountAddress: string,
    tokenId: string,
    contractAddress: string,
    ethereumInstance: AxiosInstance
  ): Promise<string> => {
    const paddedTokenId = tokenId.substring(2).padStart(64, '0');
    const paddedAddress = accountAddress.substring(2).padStart(64, '0');
    const param = `${Erc1155.BalanceOf}${paddedAddress}${paddedTokenId}`;
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
        logger.error(
          '[erc1155/getBalanceOf] Error:',
          response.data.error.message
        );
        throw new Error(
          `[erc1155/getBalanceOf] Error: ${response.data.error.message}`
        );
      }

      if (!response.data.result) {
        logger.error('[erc1155/getBalanceOf] error: No result returned');
        throw new Error('[erc1155/getBalanceOf] error: No result returned');
      }

      return format.formatTokenAmount(response.data.result, 0);
    } catch (error) {
      logger.error('[erc1155/getBalanceOf] Exception:', error);
      throw error;
    }
  },

  /**
   * Fetches the token balances for multiple token IDs at multiple account addresses.
   *
   * @param {string} accountAddress - The account addresses to fetch the token balances from.
   * @param {string} contractAddress - The contract address of the erc1155 token.
   * @param {string[]} tokenId - The specific token IDs to check the balances of.
   * @param {AxiosInstance} ethereumInstance - The ethereum client instance.
   * @returns {Promise<string>} The balances of the erc1155 tokens for the specified token IDs at the given account addresses.
   *
   * @example
   * const balances = erc1155.getBalanceOfBatch('0xACCOUNT_ADDRESS', '0xCONTRACT_ADDRESS', ['TOKEN_ID_1', 'TOKEN_ID_2'], ethereumClient);
   */
  getBalanceOfBatch: async (
    accountAddress: string,
    contractAddress: string,
    tokenId: string[],
    ethereumInstance: AxiosInstance
  ): Promise<string> => {
    const paddedAddress = accountAddress.substring(2).padStart(64, '0');
    const param = `${Erc1155.BalanceOfBatch}${paddedAddress}`;
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
        logger.error(
          '[erc1155/getBalanceOfBatch] Error:',
          response.data.error.message
        );
        throw new Error(
          `[erc1155/getBalanceOfBatch] Error: ${response.data.error.message}`
        );
      }

      if (!response.data.result) {
        logger.error('[erc1155/getBalanceOfBatch] error: No result returned');
        throw new Error(
          '[erc1155/getBalanceOfBatch] error: No result returned'
        );
      }

      return format.formatTokenAmount(response.data.result, 0);
    } catch (error) {
      logger.error('[erc1155/getBalanceOfBatch] Exception:', error);
      throw error;
    }
  },
};
