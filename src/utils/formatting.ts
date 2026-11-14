const WORD_LENGTH = 64;
const MAX_UINT256 = (1n << 256n) - 1n;
const ADDRESS_PATTERN = /^0x[0-9a-fA-F]{40}$/;
const HEX_PATTERN = /^0x[0-9a-fA-F]*$/;
const DECIMAL_PATTERN = /^[0-9]+$/;

/**
 * Removes the `0x` prefix of a hex string.
 *
 * @param {string} hexString - The hex string.
 * @returns {string} The hex digits without the prefix.
 */
const strip0x = (hexString: string): string =>
  hexString.startsWith('0x') ? hexString.slice(2) : hexString;

/**
 * Decodes hex digits as UTF-8 text.
 *
 * @param {string} hexData - The hex digits, without the `0x` prefix.
 * @returns {string} The decoded text.
 */
const hexToUtf8 = (hexData: string): string => {
  const bytes = new Uint8Array(hexData.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hexData.slice(i * 2, i * 2 + 2), 16);
  }
  return new TextDecoder().decode(bytes);
};

/**
 * Reads one 32-byte word of ABI encoded data as a number.
 *
 * @param {string} hexData - The ABI encoded data, without the `0x` prefix.
 * @param {number} byteOffset - The byte offset of the word.
 * @returns {bigint} The word as a number.
 */
const readWord = (hexData: string, byteOffset: number): bigint => {
  const word = hexData.slice(byteOffset * 2, byteOffset * 2 + WORD_LENGTH);
  if (word.length !== WORD_LENGTH) {
    throw new Error('[format/readWord] error: ABI data is too short');
  }
  return BigInt(`0x${word}`);
};

/**
 * Provides utility functions for formatting and converting blockchain-related data types.
 *
 * @fileoverview This file includes functions for encoding call arguments and decoding call results.
 * @namespace format
 */
export const format = {
  /**
   * Converts an integer amount in the smallest unit to a decimal string. The conversion is exact, and trailing zeros
   * of the fraction are removed.
   *
   * @param {string | number | bigint} tokenAmount - The amount in the smallest unit, as a hex string, a decimal string, a safe integer or a bigint.
   * @param {number} decimals - The number of decimals the token uses.
   * @returns {string} The formatted amount, such as `1234.5`.
   *
   * @example
   * const data = format.formatTokenAmount('0xRETURNED_VALUE', DECIMAL_VALUE);
   */
  formatTokenAmount: (
    tokenAmount: string | number | bigint,
    decimals: number
  ): string => {
    if (!Number.isInteger(decimals) || decimals < 0 || decimals > 255) {
      throw new Error(
        `[format/formatTokenAmount] error: Invalid decimals: ${decimals}`
      );
    }

    if (typeof tokenAmount === 'number' && !Number.isSafeInteger(tokenAmount)) {
      throw new Error(
        `[format/formatTokenAmount] error: Invalid amount: ${tokenAmount}`
      );
    }

    if (tokenAmount === '0x') {
      return '0';
    }

    let amount: bigint;
    try {
      amount = BigInt(tokenAmount);
    } catch {
      throw new Error(
        `[format/formatTokenAmount] error: Invalid amount: ${tokenAmount}`
      );
    }

    if (amount < 0n) {
      throw new Error(
        `[format/formatTokenAmount] error: Invalid amount: ${tokenAmount}`
      );
    }

    const divisor = 10n ** BigInt(decimals);
    const integerPart = amount / divisor;
    const fractionalPart = (amount % divisor)
      .toString()
      .padStart(decimals, '0')
      .replace(/0+$/, '');

    return fractionalPart.length > 0
      ? `${integerPart}.${fractionalPart}`
      : integerPart.toString();
  },

  /**
   * Converts a value from Wei to Ether. The conversion is exact, and trailing zeros of the fraction are removed.
   *
   * @param {string | number | bigint} weiValue - The value in Wei, as a hex string, a safe integer or a bigint.
   * @returns {string} The value in Ether, such as `1.5`.
   *
   * @example
   * const data = format.weiToEther('0xRETURNED_VALUE');
   */
  weiToEther: (weiValue: string | number | bigint): string => {
    if (typeof weiValue === 'string' && !HEX_PATTERN.test(weiValue)) {
      throw new Error(
        '[format/weiToEther] error: Invalid input format for Wei value'
      );
    }

    return format.formatTokenAmount(weiValue, 18);
  },

  /**
   * Decodes the result of a call that returns a `string`. Also accepts a `bytes32` result, which some older tokens
   * return for `name` and `symbol`.
   *
   * @param {string} hexString - The ABI encoded result.
   * @returns {string} The decoded UTF-8 string.
   *
   * @example
   * const data = format.decodeHexString('0xRETURNED_VALUE');
   */
  decodeHexString: (hexString: string): string => {
    const hexData = strip0x(hexString);

    if (hexData.length === WORD_LENGTH) {
      return hexToUtf8(hexData.replace(/(00)+$/, ''));
    }

    const offset = Number(readWord(hexData, 0));
    const length = Number(readWord(hexData, offset));
    const start = (offset + 32) * 2;
    const data = hexData.slice(start, start + length * 2);

    if (data.length !== length * 2) {
      throw new Error('[format/decodeHexString] error: ABI data is too short');
    }

    return hexToUtf8(data);
  },

  /**
   * Decodes the result of a call that returns an `address`.
   *
   * @param {string} hexString - The ABI encoded result.
   * @returns {string} The address, lowercase and `0x` prefixed.
   *
   * @example
   * const data = format.decodeAddress('0xRETURNED_VALUE');
   */
  decodeAddress: (hexString: string): string => {
    const word = readWord(strip0x(hexString), 0);
    return `0x${word.toString(16).padStart(40, '0')}`;
  },

  /**
   * Decodes the result of a call that returns a `uint256[]`.
   *
   * @param {string} hexString - The ABI encoded result.
   * @returns {bigint[]} The decoded numbers.
   *
   * @example
   * const data = format.decodeUint256Array('0xRETURNED_VALUE');
   */
  decodeUint256Array: (hexString: string): bigint[] => {
    const hexData = strip0x(hexString);
    const offset = Number(readWord(hexData, 0));
    const length = Number(readWord(hexData, offset));

    return Array.from({ length }, (_, i) =>
      readWord(hexData, offset + 32 * (i + 1))
    );
  },

  /**
   * Encodes an address as one 32-byte ABI word.
   *
   * @param {string} address - The `0x` prefixed address.
   * @returns {string} The encoded word, without the `0x` prefix.
   *
   * @example
   * const data = format.encodeAddress('0xACCOUNT_ADDRESS');
   */
  encodeAddress: (address: string): string => {
    if (!ADDRESS_PATTERN.test(address)) {
      throw new Error(
        `[format/encodeAddress] error: Invalid address: ${address}`
      );
    }

    return strip0x(address).toLowerCase().padStart(WORD_LENGTH, '0');
  },

  /**
   * Encodes an unsigned integer, such as a token id, as one 32-byte ABI word.
   *
   * @param {string | number | bigint} value - The value, as a decimal string, a `0x` prefixed hex string, a safe integer or a bigint.
   * @returns {string} The encoded word, without the `0x` prefix.
   *
   * @example
   * const data = format.encodeUint256('6522');
   */
  encodeUint256: (value: string | number | bigint): string => {
    const valid =
      typeof value === 'bigint' ||
      (typeof value === 'number' && Number.isSafeInteger(value)) ||
      (typeof value === 'string' &&
        (DECIMAL_PATTERN.test(value) ||
          (HEX_PATTERN.test(value) && value.length > 2)));

    const number = valid ? BigInt(value) : -1n;

    if (number < 0n || number > MAX_UINT256) {
      throw new Error(
        `[format/encodeUint256] error: Invalid uint256 value: ${value}`
      );
    }

    return number.toString(16).padStart(WORD_LENGTH, '0');
  },

  /**
   * Encodes the arguments of `balanceOfBatch(address[], uint256[])`: two dynamic arrays of the same length.
   *
   * @param {string[]} accountAddresses - The account addresses.
   * @param {(string | number | bigint)[]} tokenIds - The token ids, one per account address.
   * @returns {string} The encoded arguments, without the `0x` prefix.
   *
   * @example
   * const data = format.encodeBalanceOfBatchArgs(['0xACCOUNT_ADDRESS_1', '0xACCOUNT_ADDRESS_2'], ['TOKEN_ID_1', 'TOKEN_ID_2']);
   */
  encodeBalanceOfBatchArgs: (
    accountAddresses: string[],
    tokenIds: (string | number | bigint)[]
  ): string => {
    if (accountAddresses.length !== tokenIds.length) {
      throw new Error(
        '[format/encodeBalanceOfBatchArgs] error: Address and Token IDs arrays must be of the same length'
      );
    }

    const length = format.encodeUint256(accountAddresses.length);
    const addressesOffset = format.encodeUint256(64);
    const idsOffset = format.encodeUint256(
      64 + 32 * (accountAddresses.length + 1)
    );

    return [
      addressesOffset,
      idsOffset,
      length,
      ...accountAddresses.map(format.encodeAddress),
      length,
      ...tokenIds.map(format.encodeUint256),
    ].join('');
  },

  /**
   * Checks that a contract address is a `0x` prefixed, 20-byte hex address.
   *
   * @param {string} address - The address to check.
   * @returns {string} The address, unchanged.
   *
   * @example
   * const to = format.checkAddress('0xCONTRACT_ADDRESS');
   */
  checkAddress: (address: string): string => {
    if (!ADDRESS_PATTERN.test(address)) {
      throw new Error(
        `[format/checkAddress] error: Invalid address: ${address}`
      );
    }

    return address;
  },
};
