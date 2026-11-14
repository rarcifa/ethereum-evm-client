// Imports the built package by its name, the way a consumer does, and checks
// its public exports. Run after `npm run build`.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const esm = await import('@rarcifa/ethereum-evm-client');
const cjs = createRequire(import.meta.url)('@rarcifa/ethereum-evm-client');

for (const [kind, mod] of [
  ['import', esm],
  ['require', cjs],
]) {
  assert.deepEqual(
    Object.keys(mod).toSorted(),
    ['EthereumClient', 'RpcError', 'createClient'],
    kind
  );

  const client = mod.createClient({ endpoint: 'http://127.0.0.1:1' });
  assert.ok(client instanceof mod.EthereumClient, `${kind} createClient`);
  for (const [standard, methods] of Object.entries({
    erc20: [
      'getBalance',
      'getBalanceOf',
      'getDecimals',
      'getName',
      'getSymbol',
      'getTotalSupply',
    ],
    erc721: ['getBalanceOf', 'getOwnerOf', 'getTokenUri'],
    erc1155: ['getBalanceOf', 'getBalanceOfBatch'],
  })) {
    assert.deepEqual(
      Object.getOwnPropertyNames(Object.getPrototypeOf(client[standard]))
        .filter((name) => name !== 'constructor')
        .toSorted(),
      methods,
      `${kind} ${standard}`
    );
  }
}

console.log('package smoke test passed');
