import { Block, State } from '../lib/client/ethereumClient.js';
import { ethMethods } from '../integrations/ethMethods.js';

/**
 * Provides utility functions for fetching and processing blockchain blocks based on timestamps.
 *
 * @fileoverview This file includes functions for fetching block information and finding blocks closest to a given timestamp.
 * @namespace blockTime
 */
export const blockTime = {
  /**
   * Fetches block information for a given block number or hash.
   *
   * @param {number | string} block - The block number or hash to fetch.
   * @param {State} state - The current state of the blockchain data.
   * @returns {Promise<Block>} A promise that resolves to the block information.
   *
   * @example
   * const blockInfo = await blockTime.fetchBlockInfo(123456, state);
   */
  fetchBlockInfo: async (
    block: number | string,
    state: State
  ): Promise<Block> => {
    const blockKey = block.toString();

    if (state.cachedBlocks[blockKey]) {
      return state.cachedBlocks[blockKey];
    }

    const blockData = await ethMethods.getBlockByNumber(String(block), state);

    const { number, timestamp } = blockData;
    const result: Block = {
      block: parseInt(number, 16),
      timestamp: parseInt(timestamp, 16),
    };
    state.cachedBlocks[blockKey] = result;
    state.requests++;

    return result;
  },

  /**
   * Initializes the boundaries (first and latest block) and calculates the average block time.
   *
   * @param {State} state - The current state of the blockchain data.
   * @returns {Promise<void>} A promise that resolves when the boundaries are initialized.
   *
   * @example
   * await blockTime.initializeBoundaries(state);
   */
  initializeBoundaries: async (state: State): Promise<void> => {
    state.latestBlock = await blockTime.fetchBlockInfo('latest', state);
    state.firstBlock = await blockTime.fetchBlockInfo(1, state);

    if (state.latestBlock && state.firstBlock) {
      state.averageBlockTime =
        (state.latestBlock.timestamp - state.firstBlock.timestamp) /
        (state.latestBlock.block - 1);
    }
  },

  /**
   * Calculates the next block number to check based on the timestamp and current block.
   *
   * @param {number} timestamp - The timestamp to find the block for.
   * @param {number} currentBlock - The current block number.
   * @param {number} skip - The number of blocks to skip.
   * @param {State} state - The current state of the blockchain data.
   * @returns {number} The next block number to check.
   *
   * @example
   * const nextBlock = blockTime.calculateNextBlock(1622558400, 123456, 10, state);
   */
  calculateNextBlock: (
    timestamp: number,
    currentBlock: number,
    skip: number,
    state: State
  ): number => {
    let nextBlock = currentBlock + skip;

    if (state.latestBlock && nextBlock > state.latestBlock.block)
      nextBlock = state.latestBlock.block;

    if (state.checkedBlocks[timestamp]?.includes(nextBlock)) {
      return blockTime.calculateNextBlock(
        timestamp,
        currentBlock,
        skip < 0 ? --skip : ++skip,
        state
      );
    }

    state.checkedBlocks[timestamp] = [
      ...(state.checkedBlocks[timestamp] || []),
      nextBlock,
    ];

    const result = nextBlock < 1 ? 1 : nextBlock;
    return result;
  },

  /**
   * Determines if the predicted block is the optimal block for the given timestamp.
   *
   * @param {number} timestamp - The timestamp to find the block for.
   * @param {Block} predictedBlock - The predicted block.
   * @param {State} state - The current state of the blockchain data.
   * @returns {Promise<boolean>} A promise that resolves to true if the predicted block is optimal.
   *
   * @example
   * const isOptimal = await blockTime.isOptimalBlock(1622558400, predictedBlock, state);
   */
  isOptimalBlock: async (
    timestamp: number,
    predictedBlock: Block,
    state: State
  ): Promise<boolean> => {
    const blockTimestamp = predictedBlock.timestamp;

    if (blockTimestamp >= timestamp) {
      const previousBlock = await blockTime.fetchBlockInfo(
        predictedBlock.block - 1,
        state
      );

      if (previousBlock.timestamp < timestamp) {
        return true;
      }
    }
    return false;
  },

  /**
   * Finds the optimal block for the given timestamp by adjusting the skip value.
   *
   * @param {number} timestamp - The timestamp to find the block for.
   * @param {Block} predictedBlock - The predicted block.
   * @param {State} state - The current state of the blockchain data.
   * @returns {Promise<number>} A promise that resolves to the optimal block number.
   *
   * @example
   * const optimalBlock = await blockTime.findOptimalBlock(1622558400, predictedBlock, state);
   */
  findOptimalBlock: async (
    timestamp: number,
    predictedBlock: Block,
    state: State
  ): Promise<number> => {
    if (await blockTime.isOptimalBlock(timestamp, predictedBlock, state))
      return predictedBlock.block;
    const difference = timestamp - predictedBlock.timestamp;
    let skip = Math.ceil(
      difference / (state.averageBlockTime === 0 ? 1 : state.averageBlockTime!)
    );
    if (skip === 0) skip = difference < 0 ? -1 : 1;
    const nextPredictedBlock = await blockTime.fetchBlockInfo(
      blockTime.calculateNextBlock(
        timestamp,
        predictedBlock.block,
        skip,
        state
      ),
      state
    );
    state.averageBlockTime = Math.abs(
      (predictedBlock.timestamp - nextPredictedBlock.timestamp) /
        (predictedBlock.block - nextPredictedBlock.block)
    );

    const result = blockTime.findOptimalBlock(
      timestamp,
      nextPredictedBlock,
      state
    );

    return result;
  },

  /**
   * Gets the block closest to the given timestamp.
   *
   * @param {number} timestamp - The timestamp to find the block for.
   * @param {State} state - The current state of the blockchain data.
   * @returns {Promise<Block>} A promise that resolves to the block closest to the given timestamp.
   *
   * @example
   * const block = await blockTime.getBlockFromTimestamp(1622558400, state);
   */
  getBlockFromTimestamp: async (
    timestamp: number,
    state: State
  ): Promise<Block> => {
    if (!state.firstBlock || !state.latestBlock || !state.averageBlockTime) {
      await blockTime.initializeBoundaries(state);
    }

    if (state.firstBlock && timestamp < state.firstBlock.timestamp) {
      return blockTime.formatResult(timestamp, 1);
    }

    if (state.latestBlock && timestamp >= state.latestBlock.timestamp) {
      return blockTime.formatResult(timestamp, state.latestBlock.block);
    }

    state.checkedBlocks[timestamp] = [];

    const predictedBlock = await blockTime.fetchBlockInfo(
      Math.ceil(
        (timestamp - state.firstBlock!.timestamp) / state.averageBlockTime!
      ),
      state
    );

    const result = blockTime.formatResult(
      timestamp,
      await blockTime.findOptimalBlock(timestamp, predictedBlock, state)
    );

    return result;
  },

  /**
   * Formats the result into a Block object.
   *
   * @param {number} timestamp - The timestamp of the block.
   * @param {number} block - The block number.
   * @returns {Block} The formatted Block object.
   *
   * @example
   * const result = blockTime.formatResult(1622558400, 123456);
   */
  formatResult: (timestamp: number, block: number): Block => {
    const result = {
      timestamp,
      block,
    };

    return result;
  },
};
