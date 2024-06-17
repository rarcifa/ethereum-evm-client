import { constructEthMethodPayload } from '../../utils/ethCall.js';

describe('constructEthMethodPayload', () => {
  test('constructs payload correctly with full parameters', () => {
    const params = {
      to: '0xCONTRACT_ADDRESS',
      data: '0x6352211e',
    };
    const payload = constructEthMethodPayload(params, 'eth_call', 'latest', 1);

    expect(payload).toEqual({
      jsonrpc: '2.0',
      method: 'eth_call',
      params: [params, 'latest'],
      id: 1,
    });
  });

  test('uses default values for optional parameters', () => {
    const params = {
      to: '0xCONTRACT_ADDRESS',
      data: '0x6352211e',
    };
    const payload = constructEthMethodPayload(
      {
        to: '0xCONTRACT_ADDRESS',
        data: '0x6352211e',
      },
      'eth_call'
    );

    expect(payload).toEqual({
      jsonrpc: '2.0',
      method: 'eth_call',
      params: [params, 'latest'],
      id: 1,
    });
  });

  test('handles different method names and block tags', () => {
    const params = {
      to: '0xANOTHER_ADDRESS',
      data: '0xdeadbeef',
    };
    const payload = constructEthMethodPayload(
      params,
      'eth_sendTransaction',
      'earliest',
      99
    );

    expect(payload).toEqual({
      jsonrpc: '2.0',
      method: 'eth_sendTransaction',
      params: [params, 'earliest'],
      id: 99,
    });
  });
});
