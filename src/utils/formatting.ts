import { InvalidArgumentError, InvalidResponseError } from '../lib/errors.js';
import type { TokenId } from '../lib/interfaces/tokenId.js';

/** Length of one 32-byte ABI word, in hex digits. */
const WORD_LENGTH = 64;

/** Largest value of a `uint256`. */
const MAX_UINT256 = (1n << 256n) - 1n;

/** Largest value of an `address`, 20 bytes. */
const MAX_ADDRESS = (1n << 160n) - 1n;

/** A `0x` prefixed, 20-byte hex address, in any letter case. */
const ADDRESS_PATTERN = /^0x[0-9a-fA-F]{40}$/;

/** A `0x` prefixed hex string, possibly empty. */
const HEX_PATTERN = /^0x[0-9a-fA-F]*$/;

/** A non-negative decimal integer. */
const DECIMAL_PATTERN = /^[0-9]+$/;

/**
 * Removes the `0x` prefix of a hex string.
 *
 * @param hexString - The hex string.
 * @returns The hex digits without the prefix.
 *
 * @example
 * ```ts
 * const digits = strip0x('0x2a'); // '2a'
 * ```
 */
const strip0x = (hexString: string): string =>
  hexString.startsWith('0x') ? hexString.slice(2) : hexString;

/**
 * Decodes hex digits as UTF-8 text.
 *
 * @param hexData - The hex digits, without the `0x` prefix.
 * @returns The decoded text.
 *
 * @example
 * ```ts
 * const text = hexToUtf8('55534454'); // 'USDT'
 * ```
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
 * @param hexData - The ABI encoded data, without the `0x` prefix.
 * @param byteOffset - The byte offset of the word.
 * @returns The word as a number.
 * @throws {@link InvalidResponseError} When the data ends before the word does.
 *
 * @example
 * ```ts
 * const length = readWord(hexData, 32);
 * ```
 */
const readWord = (hexData: string, byteOffset: number): bigint => {
  const word = hexData.slice(byteOffset * 2, byteOffset * 2 + WORD_LENGTH);
  if (word.length !== WORD_LENGTH) {
    throw new InvalidResponseError('format/readWord', 'ABI data is too short');
  }
  return BigInt(`0x${word}`);
};

/**
 * Utility functions that encode call arguments and decode call results.
 *
 * @example
 * ```ts
 * const data = `${Erc721.OwnerOf}${format.encodeUint256('6522')}`;
 * const owner = format.decodeAddress(result);
 * ```
 */
export const format = {
  /**
   * Converts an integer amount in the smallest unit to a decimal string. The conversion is exact, and trailing zeros
   * of the fraction are removed.
   *
   * @param tokenAmount - The amount in the smallest unit, as a hex string, a decimal string, a safe integer or a bigint.
   * @param decimals - The number of decimals the token uses.
   * @returns The formatted amount, such as `1234.5`.
   * @throws {@link InvalidResponseError} When the amount is not a non-negative integer, or the decimals are not an
   * integer from 0 to 255.
   *
   * @example
   * ```ts
   * const data = format.formatTokenAmount('0xRETURNED_VALUE', DECIMAL_VALUE);
   * ```
   */
  formatTokenAmount: (
    tokenAmount: string | number | bigint,
    decimals: number
  ): string => {
    if (!Number.isInteger(decimals) || decimals < 0 || decimals > 255) {
      throw new InvalidResponseError(
        'format/formatTokenAmount',
        `Invalid decimals: ${decimals}`
      );
    }

    if (typeof tokenAmount === 'number' && !Number.isSafeInteger(tokenAmount)) {
      throw new InvalidResponseError(
        'format/formatTokenAmount',
        `Invalid amount: ${tokenAmount}`
      );
    }

    if (tokenAmount === '0x') {
      return '0';
    }

    let amount: bigint;
    try {
      amount = BigInt(tokenAmount);
    } catch (error) {
      throw new InvalidResponseError(
        'format/formatTokenAmount',
        `Invalid amount: ${tokenAmount}`,
        { cause: error }
      );
    }

    if (amount < 0n) {
      throw new InvalidResponseError(
        'format/formatTokenAmount',
        `Invalid amount: ${tokenAmount}`
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
   * @param weiValue - The value in Wei, as a hex string, a safe integer or a bigint.
   * @returns The value in Ether, such as `1.5`.
   * @throws {@link InvalidResponseError} When a string value is not `0x` prefixed hex, or the value is not a
   * non-negative integer.
   *
   * @example
   * ```ts
   * const data = format.weiToEther('0xRETURNED_VALUE');
   * ```
   */
  weiToEther: (weiValue: string | number | bigint): string => {
    if (typeof weiValue === 'string' && !HEX_PATTERN.test(weiValue)) {
      throw new InvalidResponseError(
        'format/weiToEther',
        'Invalid input format for Wei value'
      );
    }

    return format.formatTokenAmount(weiValue, 18);
  },

  /**
   * Decodes the result of a call that returns a `string`. Also accepts a `bytes32` result, which some older tokens
   * return for `name` and `symbol`.
   *
   * @param hexString - The ABI encoded result.
   * @returns The decoded UTF-8 string.
   * @throws {@link InvalidResponseError} When the data is shorter than its offset and length say.
   *
   * @example
   * ```ts
   * const data = format.decodeHexString('0xRETURNED_VALUE');
   * ```
   */
  decodeHexString: (hexString: string): string => {
    const hexData = strip0x(hexString);

    if (hexData.length === WORD_LENGTH) {
      return hexToUtf8(hexData.replace(/(00)+$/, ''));
    }

    const byteLength = BigInt(hexData.length / 2);
    const offset = readWord(hexData, 0);
    const length =
      offset + 32n <= byteLength ? readWord(hexData, Number(offset)) : 0n;

    if (offset + 32n + length > byteLength) {
      throw new InvalidResponseError(
        'format/decodeHexString',
        'ABI data is too short'
      );
    }

    const start = Number(offset + 32n) * 2;
    return hexToUtf8(hexData.slice(start, start + Number(length) * 2));
  },

  /**
   * Decodes the result of a call that returns an `address`.
   *
   * @param hexString - The ABI encoded result.
   * @returns The address, lowercase and `0x` prefixed.
   * @throws {@link InvalidResponseError} When the data is shorter than one word, or the word is wider than an address.
   *
   * @example
   * ```ts
   * const data = format.decodeAddress('0xRETURNED_VALUE');
   * ```
   */
  decodeAddress: (hexString: string): string => {
    const word = readWord(strip0x(hexString), 0);

    if (word > MAX_ADDRESS) {
      throw new InvalidResponseError(
        'format/decodeAddress',
        'The result is not an address'
      );
    }

    return `0x${word.toString(16).padStart(40, '0')}`;
  },

  /**
   * Decodes the result of a call that returns a `uint256[]`.
   *
   * @param hexString - The ABI encoded result.
   * @returns The decoded numbers.
   * @throws {@link InvalidResponseError} When the data is shorter than its offset and length say.
   *
   * @example
   * ```ts
   * const data = format.decodeUint256Array('0xRETURNED_VALUE');
   * ```
   */
  decodeUint256Array: (hexString: string): bigint[] => {
    const hexData = strip0x(hexString);
    const byteLength = BigInt(hexData.length / 2);
    const offset = readWord(hexData, 0);
    const length =
      offset + 32n <= byteLength ? readWord(hexData, Number(offset)) : 0n;

    if (offset + 32n * (length + 1n) > byteLength) {
      throw new InvalidResponseError(
        'format/decodeUint256Array',
        'ABI data is too short'
      );
    }

    return Array.from({ length: Number(length) }, (_, i) =>
      readWord(hexData, Number(offset) + 32 * (i + 1))
    );
  },

  /**
   * Encodes an address as one 32-byte ABI word.
   *
   * @param address - The `0x` prefixed address.
   * @returns The encoded word, without the `0x` prefix.
   * @throws {@link InvalidArgumentError} When the address is not a `0x` prefixed, 20-byte hex address.
   *
   * @example
   * ```ts
   * const data = format.encodeAddress('0xACCOUNT_ADDRESS');
   * ```
   */
  encodeAddress: (address: string): string => {
    if (!ADDRESS_PATTERN.test(address)) {
      throw new InvalidArgumentError(
        'format/encodeAddress',
        `Invalid address: ${address}`
      );
    }

    return strip0x(address).toLowerCase().padStart(WORD_LENGTH, '0');
  },

  /**
   * Encodes an unsigned integer, such as a token id, as one 32-byte ABI word.
   *
   * @param value - The value, as a decimal string, a `0x` prefixed hex string, a safe integer or a bigint.
   * @returns The encoded word, without the `0x` prefix.
   * @throws {@link InvalidArgumentError} When the value is malformed, negative or larger than a `uint256`.
   *
   * @example
   * ```ts
   * const data = format.encodeUint256('6522');
   * ```
   */
  encodeUint256: (value: TokenId): string => {
    const valid =
      typeof value === 'bigint' ||
      (typeof value === 'number' && Number.isSafeInteger(value)) ||
      (typeof value === 'string' &&
        (DECIMAL_PATTERN.test(value) ||
          (HEX_PATTERN.test(value) && value.length > 2)));

    const number = valid ? BigInt(value) : -1n;

    if (number < 0n || number > MAX_UINT256) {
      throw new InvalidArgumentError(
        'format/encodeUint256',
        `Invalid uint256 value: ${value}`
      );
    }

    return number.toString(16).padStart(WORD_LENGTH, '0');
  },

  /**
   * Encodes the arguments of `balanceOfBatch(address[], uint256[])`: two dynamic arrays of the same length.
   *
   * @param accountAddresses - The account addresses.
   * @param tokenIds - The token ids, one per account address.
   * @returns The encoded arguments, without the `0x` prefix.
   * @throws {@link InvalidArgumentError} When the arrays differ in length, or an address or token id is invalid.
   *
   * @example
   * ```ts
   * const data = format.encodeBalanceOfBatchArgs(['0xACCOUNT_ADDRESS_1', '0xACCOUNT_ADDRESS_2'], ['TOKEN_ID_1', 'TOKEN_ID_2']);
   * ```
   */
  encodeBalanceOfBatchArgs: (
    accountAddresses: string[],
    tokenIds: TokenId[]
  ): string => {
    if (accountAddresses.length !== tokenIds.length) {
      throw new InvalidArgumentError(
        'format/encodeBalanceOfBatchArgs',
        'Address and Token IDs arrays must be of the same length'
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
   * @param address - The address to check.
   * @returns The address, unchanged.
   * @throws {@link InvalidArgumentError} When the address is not a `0x` prefixed, 20-byte hex address.
   *
   * @example
   * ```ts
   * const to = format.checkAddress('0xCONTRACT_ADDRESS');
   * ```
   */
  checkAddress: (address: string): string => {
    if (!ADDRESS_PATTERN.test(address)) {
      throw new InvalidArgumentError(
        'format/checkAddress',
        `Invalid address: ${address}`
      );
    }

    return address;
  },

  /**
   * Checks that a value is a `0x` prefixed hex string.
   *
   * @param value - The value to check.
   * @returns Whether the value is a `0x` prefixed hex string.
   *
   * @example
   * ```ts
   * if (!format.isHex(result)) {
   *   throw new InvalidResponseError(context, 'The result is not a hex string');
   * }
   * ```
   */
  isHex: (value: unknown): value is string =>
    typeof value === 'string' && HEX_PATTERN.test(value),
};
