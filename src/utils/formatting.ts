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
   * const data = format.weiToEther('0xRETURNED_VALUE');
   *
   */
  weiToEther: (weiValue: string | number | bigint | boolean): string => {
    if (typeof weiValue === 'string' && !weiValue.startsWith('0x')) {
      throw new Error(
        '[format/weiToEther] error: Invalid input format for Wei value'
      );
    }

    const value: bigint =
      typeof weiValue === 'string'
        ? BigInt(weiValue === '0x' ? '0x0' : weiValue)
        : BigInt(weiValue);
    const ether: number = Number(value) / 10 ** 18;

    return ether === 0 ? '0' : ether.toFixed(18);
  },

  /**
   * Decodes a hex string to a readable ASCII string. This function assumes the hex string is ABI-encoded.
   *
   * @param {string} hexString - The hex string to decode, typically ABI-encoded.
   * @returns {string} The decoded ASCII string.
   *
   * @example
   * const data = format.decodeHexString('0xRETURNED_VALUE');
   */
  decodeHexString: (hexString: string): string => {
    if (hexString.startsWith('0x')) {
      hexString = hexString.slice(2);
    }

    const startPosition = 128;

    let asciiData = '';
    for (let i = startPosition; i < hexString.length; i += 2) {
      const part = hexString.slice(i, i + 2);
      const charCode = parseInt(part, 16);
      if (charCode !== 0) {
        asciiData += String.fromCharCode(charCode);
      }
    }

    return asciiData.trim();
  },

  /**
   * Converts token amounts from the smallest unit based on specified decimals to a formatted string.
   *
   * @param {string | number | bigint} tokenAmount - The token amount in the smallest unit.
   * @param {number} decimals - The number of decimals the token uses.
   * @returns {string} The formatted token amount.
   *
   * @example
   * const data = format.formatTokenAmount('0xRETURNED_VALUE', DECIMAL_VALUE);
   */
  formatTokenAmount: (
    tokenAmount: string | number | bigint,
    decimals: number
  ): string => {
    if (tokenAmount === '0x') {
      return '0';
    }

    const amount: bigint = BigInt(tokenAmount);

    if (amount === BigInt(0)) {
      return '0';
    }

    const divisor = BigInt(10 ** decimals);
    const integerPart = amount / divisor;
    const fractionalPart = amount % divisor;
    const formattedInteger = new Intl.NumberFormat('en-US').format(
      Number(integerPart)
    );

    let formattedFractional: string = fractionalPart
      .toString()
      .padStart(decimals, '0')
      .substring(0, decimals);
    formattedFractional = formattedFractional.replace(/0+$/, '');

    return formattedFractional.length > 0
      ? `${formattedInteger}.${formattedFractional}`
      : formattedInteger;
  },

  /**
   * Concatenates arrays of Ethereum account addresses and token IDs into single strings of concatenated, normalized values.
   *
   * @param {string[]} accountAddresses - An array of Ethereum account addresses.
   * @param {string[]} tokenIds - An array of token IDs associated with the addresses.
   * @returns {object} An object containing concatenated and padded strings of addresses and token IDs.
   *
   * @example
   * const data = concatAddressesAndIds(['0xACCOUNT_ADDRESS_1', '0xACCOUNT_ADDRESS_2'], ['TOKEN_ID_1', 'TOKEN_ID_2']);
   */
  concatAddressesAndIds: (
    accountAddresses: string[],
    tokenIds: string[]
  ): {
    addresses: string;
    ids: string;
  } => {
    if (accountAddresses.length !== tokenIds.length) {
      throw new Error(
        '[format/concatAddressesAndIds] error: Address and Token IDs arrays must be of the same length'
      );
    }

    let addresses: string = '';
    let ids: string = '';

    for (let i = 0; i < tokenIds.length; i++) {
      addresses += accountAddresses[i]
        .toLowerCase()
        .substring(2)
        .padStart(64, '0');
      ids += tokenIds[i].substring(2).padStart(64, '0');
    }

    return { addresses, ids };
  },

  /**
   * Cleans a hexadecimal string returned in a JSON RPC response by removing unnecessary leading zeros.
   *
   * @param {string} hexString - The hexadecimal string to be cleaned, usually representing a numeric value.
   * @returns {string} The cleaned hexadecimal string with leading zeros removed, except for the '0x' prefix.
   *
   * @example
   * const data = cleanHexString(0xRAW_HEX);
   */
  cleanHexString: (hexString: string): string => {
    if (!hexString.startsWith('0x')) {
      throw new Error(
        '[format/cleanHexString] error: Invalid hex string format'
      );
    }

    return hexString.replace(/^(0x)0+/, '$1') || '0x0';
  },
};
