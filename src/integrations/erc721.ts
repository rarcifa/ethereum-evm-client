import axios, { AxiosInstance, AxiosResponse } from 'axios';

import { Erc721, EthMethod } from '../lib/interfaces/ethMethods';
import { JsonRpcRequestPayload } from '../lib/interfaces/jsonRpcRequest';
import { JsonRpcResponse } from '../lib/interfaces/jsonRpcResponse';

import { constructEthMethodPayload } from '../utils/ethCall';
import { format } from '../utils/formatting';
import { logger } from '../utils/logger';

/**
 * erc721 integration for managing Ethereum RPC requests.
 *
 * @fileoverview This file provides helper functions for Ethereum JSON-RPC interactions.
 * @namespace erc721
 */
export const erc721 = {
  /**
   * Fetches the token balance of the erc721 token.
   *
   * @param {string} accountAddress - The account address to fetch the balance from.
   * @param {string} contractAddress - The contract address of the erc721 instance.
   * @param {AxiosInstance} ethereumInstance - The ethereum client to initialize the erc721 instance
   * @returns {Promise<string>} The erc721 token balance of the account.
   *
   * @example
   * const data = erc721.getBalanceOf('0xACCOUNT_ADDRESS', '0xCONTRACT_ADDRESS');
   */
  getBalanceOf: async (
    accountAddress: string,
    contractAddress: string,
    ethereumInstance: AxiosInstance
  ): Promise<string> => {
    const paddedAddress = accountAddress.substring(2).padStart(64, '0');
    const param = `${Erc721.BalanceOf}${paddedAddress}`;
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
          '[erc721/getBalanceOf] error:',
          response.data.error.message
        );
        throw new Error(
          `[erc721/getBalanceOf] error: ${response.data.error.message}`
        );
      }

      if (!response.data.result) {
        logger.error('[erc721/getBalanceOf] error: No result returned');
        throw new Error('[erc721/getBalanceOf] error: No result returned');
      }

      const result: string = format.formatTokenAmount(response.data.result, 0);
      return result;
    } catch (e) {
      logger.error('[erc721/getBalanceOf] error:', e);
      throw e;
    }
  },

  /**
   * Fetches the owner address of the erc721 token.
   *
   * @param {string} contractAddress - The contract address of the erc721 instance.
   * @param {string} tokenId - The specific token ID to check the owner of.
   * @param {AxiosInstance} ethereumInstance - The ethereum client to initialize the erc721 instance
   * @returns {Promise<string>} The owner address of the erc721 token.
   *
   * @example
   * const data = erc721.getOwnerOf('0xCONTRACT_ADDRESS', 'TOKEN_ID');
   */

  getOwnerOf: async (
    contractAddress: string,
    tokenId: string,
    ethereumInstance: AxiosInstance
  ): Promise<string> => {
    const paddedTokenId = tokenId.padStart(64, '0');
    const param = `${Erc721.OwnerOf}${paddedTokenId}`;
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
        logger.error('[erc721/getOwnerOf] error:', response.data.error.message);
        throw new Error(
          `[erc721/getOwnerOf] error: ${response.data.error.message}`
        );
      }

      if (!response.data.result) {
        logger.error('[erc721/getOwnerOf] error: No result returned');
        throw new Error('[erc721/getOwnerOf] error: No result returned');
      }

      const result = response.data.result.replace(/^(0x)0+/, '$1');
      return result;
    } catch (e) {
      logger.error('[erc721/getOwnerOf] error:', e);
      throw e;
    }
  },

  /**
   * Fetches the uri of the erc721 token.
   *
   * @param {string} contractAddress - The contract address of the erc721 instance.
   * @param {string} tokenId - The specific token ID to check the owner of.
   * @param {AxiosInstance} ethereumInstance - The ethereum client to initialize the erc721 instance
   * @returns {Promise<string>} The uri of the erc721 token.
   *
   * @example
   * const data = erc721.getTokenUri('0xCONTRACT_ADDRESS', 'TOKEN_ID');
   */

  getTokenUri: async (
    contractAddress: string,
    tokenId: string,
    ethereumInstance: AxiosInstance
  ): Promise<string> => {
    const paddedTokenId = tokenId.padStart(64, '0');
    const param = `${Erc721.TokenURI}${paddedTokenId}`;
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
          '[erc721/getBalanceOf] error:',
          response.data.error.message
        );
        throw new Error(
          `[erc721/getBalanceOf] error: ${response.data.error.message}`
        );
      }

      if (!response.data.result) {
        logger.error('[erc721/getBalanceOf] error: No result returned');
        throw new Error('[erc721/getBalanceOf] error: No result returned');
      }

      const result: string = format.decodeHexString(response.data.result);
      const metadataResponse: AxiosResponse<string> = await axios.get(result);

      if (metadataResponse) {
        return JSON.stringify(metadataResponse.data);
      }

      return result;
    } catch (e) {
      logger.error('[erc721/getBalanceOf] error:', e);
      throw e;
    }
  },
};
