import { AxiosResponse } from 'axios';

import { JsonRpcRequestPayload } from '../lib/interfaces/jsonRpcRequest.js';
import { JsonRpcResponse } from '../lib/interfaces/jsonRpcResponse.js';

import { constructEthMethodPayload } from '../utils/ethCall.js';
import { State } from '../lib/client/ethereumClient.js';
import { EthMethod } from '../lib/interfaces/ethMethods.js';

/**
 * ethMethods integration for managing Ethereum RPC requests.
 *
 * @fileoverview This file provides helper functions for Ethereum JSON-RPC interactions.
 * @namespace ethMethods
 */
export const ethMethods = {
  /**
   * Fetches block information for a given block number.
   *
   * @param {number | string} blockNumber - The block number to fetch.
   * @param {AxiosInstance} ethereumInstance - The Axios instance for making requests.
   * @returns {Promise<{ number: string; timestamp: string }>} A promise that resolves to the block information.
   *
   * @example
   * const blockInfo = await erc20.getBlockByNumber(123456, ethereumInstance);
   */
  getBlockByNumber: async (
    block: string,
    state: State
  ): Promise<{ number: string; timestamp: string }> => {
    const data: JsonRpcRequestPayload = constructEthMethodPayload(
      block,
      EthMethod.GetBlockByNumber
    );

    try {
      const response: AxiosResponse<
        JsonRpcResponse<{ number: string; timestamp: string }>
      > = await state.instance.post<
        JsonRpcResponse<{ number: string; timestamp: string }>
      >('', data);

      if (response.data.error) {
        console.error(
          '[ethMethods/getBlockByNumber] error:',
          response.data.error.message
        );
        throw new Error(
          `[ethMethods/getBlockByNumber] error: ${response.data.error.message}`
        );
      }

      if (!response.data.result) {
        console.error(
          '[ethMethods/getBlockByNumber] error: No result returned'
        );
        throw new Error(
          '[ethMethods/getBlockByNumber] error: No result returned'
        );
      }

      return response.data.result;
    } catch (e) {
      console.error('[ethMethods/getBlockByNumber] error:', e);
      throw e;
    }
  },
};
