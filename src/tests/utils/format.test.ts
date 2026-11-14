import { describe, expect, test } from '@jest/globals';

import { format } from '../../utils/formatting.js';

describe('formatTokenAmount', () => {
  test('formats an amount exactly, without trailing zeros', () => {
    expect(format.formatTokenAmount('1000000000000000000', 18)).toBe('1');
    expect(format.formatTokenAmount('0x12d687', 6)).toBe('1.234567');
    expect(format.formatTokenAmount(1500n, 3)).toBe('1.5');
    expect(format.formatTokenAmount(2n ** 200n, 0)).toBe(
      (2n ** 200n).toString()
    );
  });

  test('handles zero and "0x" as zero', () => {
    expect(format.formatTokenAmount('0x', 18)).toBe('0');
    expect(format.formatTokenAmount('0', 18)).toBe('0');
  });

  test('handles more than 15 decimals without rounding', () => {
    expect(format.formatTokenAmount(10n ** 24n + 1n, 24)).toBe(
      '1.000000000000000000000001'
    );
  });

  test('rejects invalid amounts and decimals', () => {
    expect(() => format.formatTokenAmount('abc', 18)).toThrow(
      '[format/formatTokenAmount] error: Invalid amount: abc'
    );
    expect(() => format.formatTokenAmount(-1n, 18)).toThrow(
      '[format/formatTokenAmount] error: Invalid amount: -1'
    );
    expect(() => format.formatTokenAmount(1, -1)).toThrow(
      '[format/formatTokenAmount] error: Invalid decimals: -1'
    );
  });
});

describe('weiToEther', () => {
  test('converts Wei to Ether exactly', () => {
    expect(format.weiToEther('0x282d2c002cbdb')).toBe('0.000706791629573083');
    expect(format.weiToEther(`0x${123456789123456789123n.toString(16)}`)).toBe(
      '123.456789123456789123'
    );
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
  test('decodes an ABI encoded string', () => {
    expect(
      format.decodeHexString(
        '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000045553445400000000000000000000000000000000000000000000000000000000'
      )
    ).toBe('USDT');
  });

  test('decodes UTF-8 characters', () => {
    const hex = Buffer.from('Ünïcode €').toString('hex');
    const data = `0x${(32).toString(16).padStart(64, '0')}${(hex.length / 2).toString(16).padStart(64, '0')}${hex.padEnd(64, '0')}`;

    expect(format.decodeHexString(data)).toBe('Ünïcode €');
  });

  test('decodes a bytes32 string', () => {
    expect(
      format.decodeHexString(
        `0x${Buffer.from('Maker').toString('hex').padEnd(64, '0')}`
      )
    ).toBe('Maker');
  });

  test('rejects data shorter than its length', () => {
    expect(() =>
      format.decodeHexString(
        `0x${(32).toString(16).padStart(64, '0')}${(40).toString(16).padStart(64, '0')}00`
      )
    ).toThrow('[format/decodeHexString] error: ABI data is too short');
  });
});

describe('decodeAddress', () => {
  test('keeps the leading zeros of an address', () => {
    expect(
      format.decodeAddress(
        '0x0000000000000000000000000000000000000000000000000000000000c0ffee'
      )
    ).toBe('0x0000000000000000000000000000000000c0ffee');
  });
});

describe('decodeUint256Array', () => {
  test('decodes every element', () => {
    const words = [32n, 3n, 1n, 0n, 2n ** 255n].map((n) =>
      n.toString(16).padStart(64, '0')
    );

    expect(format.decodeUint256Array(`0x${words.join('')}`)).toEqual([
      1n,
      0n,
      2n ** 255n,
    ]);
  });
});

describe('encodeAddress', () => {
  test('pads a valid address to one lowercase word', () => {
    expect(
      format.encodeAddress('0x18cF36D6925026f00A57754757Ecd480B92cBefC')
    ).toBe('00000000000000000000000018cf36d6925026f00a57754757ecd480b92cbefc');
  });

  test('rejects an invalid address', () => {
    expect(() => format.encodeAddress('0xABCDEF')).toThrow(
      '[format/encodeAddress] error: Invalid address: 0xABCDEF'
    );
  });
});

describe('encodeUint256', () => {
  test('encodes decimal strings, hex strings, numbers and bigints', () => {
    const expected = (6522).toString(16).padStart(64, '0');

    expect(format.encodeUint256('6522')).toBe(expected);
    expect(format.encodeUint256('0x197a')).toBe(expected);
    expect(format.encodeUint256(6522)).toBe(expected);
    expect(format.encodeUint256(6522n)).toBe(expected);
  });

  test('rejects negative, fractional, oversized and malformed values', () => {
    for (const value of ['-1', '1.5', '0x', 'abc', 1.5, -1n, 2n ** 256n]) {
      expect(() => format.encodeUint256(value)).toThrow(
        `[format/encodeUint256] error: Invalid uint256 value: ${value}`
      );
    }
  });
});

describe('encodeBalanceOfBatchArgs', () => {
  test('encodes two dynamic arrays', () => {
    const words = format
      .encodeBalanceOfBatchArgs(
        ['0x0000000000000000000000000000000000abcdef'],
        ['123']
      )
      .match(/.{64}/g)
      ?.map((w) => BigInt(`0x${w}`));

    expect(words).toEqual([64n, 128n, 1n, 0xabcdefn, 1n, 123n]);
  });

  test('throws error if arrays are of different lengths', () => {
    expect(() =>
      format.encodeBalanceOfBatchArgs(
        ['0x0000000000000000000000000000000000abcdef'],
        ['1', '2']
      )
    ).toThrow(
      '[format/encodeBalanceOfBatchArgs] error: Address and Token IDs arrays must be of the same length'
    );
  });
});

describe('checkAddress', () => {
  test('returns a valid address unchanged', () => {
    expect(
      format.checkAddress('0x18cF36D6925026f00A57754757Ecd480B92cBefC')
    ).toBe('0x18cF36D6925026f00A57754757Ecd480B92cBefC');
  });

  test('rejects an invalid address', () => {
    expect(() => format.checkAddress('0x123')).toThrow(
      '[format/checkAddress] error: Invalid address: 0x123'
    );
  });
});
