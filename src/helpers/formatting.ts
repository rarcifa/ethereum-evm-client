/**
 * Provides utility functions for formatting and converting blockchain-related data types.
 *
 * @fileoverview This file includes functions for converting and decoding data types.
 * @namespace format
 */
export const format = {
  /**
   * Converts a value from Wei to Ether. Handles various input formats and ensures accurate conversion using floating-point precision.
   *
   * @param {string | number | bigint | boolean} weiValue - The value in Wei to be converted to Ether.
   * @returns {string} The value in Ether, formatted as a string with up to 18 decimal places.
   *
   * @example
   * const etherValue = format.weiToEther("0x3ca751a12dd1da952");
   *
   */
  weiToEther: (weiValue: string | number | bigint | boolean): string => {
    const value: bigint =
      typeof weiValue === 'string'
        ? weiValue.startsWith('0x')
          ? BigInt(weiValue === '0x' ? '0x0' : weiValue)
          : BigInt(weiValue)
        : BigInt(weiValue);
    const ether: number = Number(value) / 10 ** 18;

    if (ether === 0) {
      return '0';
    }

    return ether.toFixed(18);
  },

  /**
   * Decodes a hex string to a readable ASCII string. This function assumes the hex string is ABI-encoded.
   *
   * @param {string} hexString - The hex string to decode, typically ABI-encoded.
   * @returns {string} The decoded ASCII string.
   *
   * @example
   * const asciiString = format.decodeHexString("0x000000......000000000");
   */
  decodeHexString: (hexString: string): string => {
    const string: string = hexString.startsWith('0x')
      ? hexString.substring(2)
      : hexString;
    const dataStart: number = 64;
    const dataLength: number =
      parseInt(string.substring(dataStart, dataStart + 64), 16) * 2;
    const stringData: string = string.substring(
      dataStart + 64,
      dataStart + 64 + dataLength
    );

    let str: string = '';

    for (let i = 0; i < stringData.length; i += 2) {
      const charCode: number = parseInt(stringData.substr(i, 2), 16);
      if (charCode === 0) {
        break;
      }
      str += String.fromCharCode(charCode);
    }

    return str;
  },

  /**
   * Converts token amounts from the smallest unit based on specified decimals to a formatted string.
   *
   * @param {string | number | bigint} tokenAmount - The token amount in the smallest unit.
   * @param {number} decimals - The number of decimals the token uses.
   * @returns {string} The formatted token amount.
   *
   * @example
   * const formattedAmount = format.formatTokenAmount("87824964111949", 6); // Convert smallest token unit to a human-readable format
   */
  formatTokenAmount: (
    tokenAmount: string | number | bigint,
    decimals: number
  ): string => {
    const amount: bigint =
      typeof tokenAmount === 'string'
        ? BigInt(tokenAmount)
        : BigInt(tokenAmount);
    const divisor: bigint = BigInt(10 ** decimals);
    const formatted: string =
      (amount / divisor).toString() +
      '.' +
      (amount % divisor).toString().padStart(decimals, '0');
    return formatted;
  },
};
