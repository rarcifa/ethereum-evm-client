import { format } from '../../utils/formatting.js';
import { describe, expect, test } from '@jest/globals';

describe('weiToEther', () => {
  test('converts Wei to Ether correctly', () => {
    expect(format.weiToEther('0x282d2c002cbdb')).toBe('0.000706791629573083');
  });

  test('returns "0" for zero Wei input', () => {
    expect(format.weiToEther(0)).toBe('0');
  });

  test('throws error for invalid input format', () => {
    expect(() => format.weiToEther('0z48656c6c6f')).toThrow(
      '[format/weiToEther] error: Invalid input format for Wei value'
    );
  });
});

describe('decodeHexString', () => {
  test('decodes hex string to ASCII', () => {
    expect(
      format.decodeHexString(
        '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000045553445400000000000000000000000000000000000000000000000000000000'
      )
    ).toBe('USDT');
  });
});

describe('formatTokenAmount', () => {
  test('formats token amount correctly', () => {
    expect(format.formatTokenAmount('1000000000000000000', 18)).toBe('1');
  });

  test('handles "0x" input as zero', () => {
    expect(format.formatTokenAmount('0x', 18)).toBe('0');
  });

  test('returns "0" for zero amount', () => {
    expect(format.formatTokenAmount('0', 18)).toBe('0');
  });
});

describe('concatAddressesAndIds', () => {
  test('concatenates addresses and IDs correctly', () => {
    const result = format.concatAddressesAndIds(['0xABCDEF'], ['123']);

    expect(result.addresses).toBe(
      '0000000000000000000000000000000000000000000000000000000000abcdef'
    );
    expect(result.ids).toBe(
      '0000000000000000000000000000000000000000000000000000000000000003'
    );
  });

  test('throws error if arrays are of different lengths', () => {
    expect(() => format.concatAddressesAndIds(['0xABC'], ['1', '2'])).toThrow(
      '[format/concatAddressesAndIds] error: Address and Token IDs arrays must be of the same length'
    );
  });
});

describe('cleanHexString', () => {
  test('cleans hex string by removing unnecessary zeros', () => {
    expect(format.cleanHexString('0x00000123')).toBe('0x123');
  });

  test('throws error for invalid hex string', () => {
    expect(() => format.cleanHexString('123')).toThrow(
      '[format/cleanHexString] error: Invalid hex string format'
    );
  });
});
