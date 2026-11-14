# Contributing

Fork the repository, work on a feature branch and open a pull request. `npm run check` must pass: formatting, lint,
type check, tests and the package smoke test.

## Errors

- Throw only the classes of `src/lib/errors.ts`: `InvalidArgumentError` for caller input (rejected before any request),
  `RequestError` for transport failures, `RpcError` for JSON-RPC errors and `InvalidResponseError` for answers that
  do not decode. Never throw a plain `Error`.
- The `context` is the `module/function` that detected the problem; the message is `[context] error: description`.
- Catch only to wrap a lower-level error into one of these classes, passing it as `cause`. Never swallow an error,
  rethrow it unchanged, or catch it to log.
- Methods that send requests are `async`, so they reject and never throw synchronously.
- The library never logs (`no-console`); callers own logging, retries and alerting.

## Documentation comments

Every declaration in `src/` has a [TSDoc](https://tsdoc.org) comment. Types live in the TypeScript signatures, never
in the comment.

- The summary is one or more full sentences ending with a period. Functions, methods and constructors start with a
  verb (`Fetches`, `Creates`, `Encodes`); classes, interfaces, types, enums, constants, fields and members start with
  a noun phrase.
- Tags, in this order: `@typeParam`, `@param`, `@returns`, `@throws`, `@defaultValue`, `@example`.
- `@param name - Description.` for every parameter; optional parameters start with `Optional.` and give their
  default.
- `@returns Description.` on every function and method that returns a value.
- `@throws {@link RpcError} When …` and `@throws {@link Error} When …` whenever the code, or code it calls, can throw.
- `@example` with a fenced `ts` block on every function and method outside the tests.
- Fields, interface members, enum members and constants use the one-line form: `/** Summary. */`.
- No JSDoc type braces (`{string}`) and no `@class`, `@interface`, `@enum`, `@property`, `@typedef` or
  `@fileoverview`.

````ts
/**
 * Fetches the symbol of the erc20 token.
 *
 * @param contractAddress - The contract address of the erc20 token.
 * @returns The symbol of the token.
 * @throws {@link RpcError} When the node answers with a JSON-RPC error.
 * @throws {@link Error} When the address is invalid, the request fails or the contract returns no data.
 *
 * @example
 * ```ts
 * const symbol = await client.erc20.getSymbol('0xCONTRACT_ADDRESS');
 * ```
 */
````
