# Ethereum EVM Client

[![CI](https://github.com/rarcifa/ethereum-evm-client/actions/workflows/ci.yml/badge.svg)](https://github.com/rarcifa/ethereum-evm-client/actions/workflows/ci.yml)
![npm](https://img.shields.io/npm/v/@rarcifa/ethereum-evm-client)
![Node Version](https://img.shields.io/badge/node-%3E%3D22-green)
![License](https://img.shields.io/badge/license-MIT-blue)

A small TypeScript client for reading ERC20, ERC721 and ERC1155 token data from Ethereum and any other EVM compatible
chain over JSON-RPC.

## Features

- One client per RPC endpoint, with an optional API key, extra headers and a request timeout.
- ERC20, ERC721 and ERC1155 reads, with ABI encoding and decoding built in.
- Exact amounts: balances are computed with `bigint` and returned as decimal strings, using the decimals of the
  token.
- Typed API and errors: every error message names the method that failed, and node errors are `RpcError`s with the
  JSON-RPC error code.

## Installation

```bash
npm install @rarcifa/ethereum-evm-client
```

The package is ESM only and needs Node.js 22 or newer. `require()` works on the Node.js versions that can load ES
modules from CommonJS.

## Usage

### Configuring the client

```ts
import { createClient } from '@rarcifa/ethereum-evm-client';

const client = createClient({
  endpoint: 'https://RPC_ENDPOINT', // EVM JSON-RPC endpoint
  apiKey: 'OPTIONAL_API_KEY', // optional, sent as a bearer token
  additionalHeaders: {}, // optional
  timeout: 30_000, // optional, in milliseconds
});
```

`createClient(config)` is the same as `new EthereumClient(config)`. The client has one property per token standard:
`client.erc20`, `client.erc721` and `client.erc1155`. Their methods are class methods, so call them on the client
(`client.erc20.getName(address)`); to pass one as a callback, bind it first
(`client.erc20.getName.bind(client.erc20)`).

### ERC20

```ts
const balance = await client.erc20.getBalanceOf(
  '0xACCOUNT_ADDRESS',
  '0xCONTRACT_ADDRESS'
);

console.log('ERC20 balance:', balance); // e.g. '1234.5', using the decimals of the token
```

### ERC721

```ts
const owner = await client.erc721.getOwnerOf('0xCONTRACT_ADDRESS', '6522');

console.log('NFT owner:', owner);
```

### ERC1155

```ts
const balances = await client.erc1155.getBalanceOfBatch(
  ['0xACCOUNT_ADDRESS_1', '0xACCOUNT_ADDRESS_2'],
  '0xCONTRACT_ADDRESS',
  ['1', '2']
);

console.log('Balances:', balances); // e.g. ['7', '9']
```

### Errors

```ts
import { RpcError } from '@rarcifa/ethereum-evm-client';

try {
  await client.erc20.getName('0xCONTRACT_ADDRESS');
} catch (e) {
  if (e instanceof RpcError) {
    console.error('Node error', e.code, e.message); // '[erc20/getName] error: ...'
  } else {
    console.error(e); // invalid input, network failure or empty result
  }
}
```

The client never logs: every failure is thrown to the caller.

## API

Exported: `createClient`, `EthereumClient`, `RpcError`, and the types `ClientConfig`, `Erc20Client`, `Erc721Client`,
`Erc1155Client` and `TokenId`.

Addresses are `0x` prefixed, 20-byte hex strings. Token ids (`TokenId`) can be a decimal string (`'6522'`), a `0x`
prefixed hex string (`'0x197a'`), a safe integer or a `bigint`. Amounts are returned as exact decimal strings.

### `client.erc20`

- `getBalance(accountAddress)`: The native token balance of an account, in Ether.
- `getBalanceOf(accountAddress, contractAddress)`: The token balance of an account, using the decimals of the token.
- `getDecimals(contractAddress)`: The number of decimals of the token.
- `getName(contractAddress)`: The name of the token.
- `getSymbol(contractAddress)`: The symbol of the token.
- `getTotalSupply(contractAddress)`: The total supply of the token, using the decimals of the token.

### `client.erc721`

- `getBalanceOf(accountAddress, contractAddress)`: The number of tokens an account owns.
- `getOwnerOf(contractAddress, tokenId)`: The owner address of a token, lowercase.
- `getTokenUri(contractAddress, tokenId)`: The metadata URI of a token, as the contract returns it.

### `client.erc1155`

- `getBalanceOf(accountAddress, contractAddress, tokenId)`: The balance of one token id for one account.
- `getBalanceOfBatch(accountAddresses, contractAddress, tokenIds)`: The balance of each pair of account and token
  id, in order.

## Development

```bash
npm ci
npm run check # format, lint, typecheck, tests and the package smoke test
```

| Script                 | What it does                                                    |
| ---------------------- | --------------------------------------------------------------- |
| `npm run build`        | Compiles `src/` to `dist/` with TypeScript 7, with declarations |
| `npm test`             | Runs the Jest tests, offline                                    |
| `npm run lint`         | Oxlint with type-aware rules (tsgolint)                         |
| `npm run typecheck`    | TypeScript type check                                           |
| `npm run format`       | Formats the repository with Prettier                            |
| `npm run test:package` | Builds and imports the package by name, with ESM and CommonJS   |

## Contributing

Contributions are welcome. Fork the repository, work on a feature branch and open a pull request. `npm run check`
must pass.

## License

[MIT](LICENSE)
