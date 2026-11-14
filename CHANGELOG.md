# Changelog

## 0.3.0

### Breaking changes

- The package is ESM only and needs Node.js 22 or newer.
- Amounts are exact decimal strings without thousands separators and without trailing zeros (`'1234.5'`, not
  `'1,234.5'` or `'1234.500000000000000000'`).
- `erc20.getBalanceOf` and `erc20.getTotalSupply` use the decimals of the token instead of always 18.
- `erc721.getTokenUri` returns the URI instead of fetching it and returning the metadata.
- `erc1155.getBalanceOfBatch` returns one balance per pair (`string[]`) instead of one string.
- `axios` is a dependency instead of a peer dependency; `lodash` and `tslib` are no longer needed.
- The client no longer writes to the console; errors are thrown to the caller.

### Fixes

- The built package can be imported: it was compiled to CommonJS inside a `"type": "module"` package.
- The package ships type declarations.
- Balances no longer lose precision: they were converted through a JavaScript `number`.
- Decimal token ids are encoded as numbers: `'6522'` was sent as token `0x6522`.
- `erc1155.getBalanceOf` sends the token id: it was dropped and token 0 was queried.
- `erc1155.getBalanceOfBatch` sends valid ABI encoded arrays and decodes the returned array.
- `erc721.getOwnerOf` keeps the leading zeros of an address.
- Strings are decoded as UTF-8 from their ABI length, and `bytes32` names and symbols are supported.
- `erc721.getTokenUri` errors name `erc721/getTokenUri`.

### Added

- `erc20.getDecimals`.
- `RpcError`, with the JSON-RPC error `code` and `data`.
- The `timeout` client option, 30 seconds by default.
- Address and token id validation before any request is sent.
- Exported types: `BlockchainClient`, `ClientConfig`, `Erc20Client`, `Erc721Client`, `Erc1155Client`, `TokenId`.
