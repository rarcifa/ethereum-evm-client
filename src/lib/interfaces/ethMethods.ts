/**
 * Enumeration for common Ethereum JSON-RPC method names.
 *
 * @enum {string}
 */
export enum EthMethod {
  /**
   * Method for making a call or a transaction to read data.
   */
  Call = 'eth_call',

  /**
   * Method for getting the balance of an account.
   */
  GetBalance = 'eth_getBalance',
}

/**
 * Enumeration for common ERC20 token function selectors.
 *
 * @enum {string}
 */
export enum Erc20 {
  /**
   * Selector for `balanceOf` function to get the token balance of an account.
   */
  BalanceOf = '0x70a08231',

  /**
   * Selector for `totalSupply` function to get the total token supply.
   */
  TotalSupply = '0x18160ddd',

  /**
   * Selector for `name` function to get the name of the token.
   */
  Name = '0x06fdde03',

  /**
   * Selector for `symbol` function to get the symbol of the token.
   */
  Symbol = '0x95d89b41',

  /**
   * Selector for `transfer` function to transfer tokens to a specified account.
   */
  Transfer = '0xa9059cbb',
}

/**
 * Enumeration for common ERC721 token function selectors.
 *
 * @enum {string}
 */
export enum Erc721 {
  /**
   * Selector for `balanceOf` function to get the token balance of an account.
   */
  BalanceOf = '0x70a08231',

  /**
   * Selector for `ownerOf` function to find the owner of a specific token.
   */
  OwnerOf = '0x6352211e',

  /**
   * Selector for `transferFrom` function to transfer ownership of a token.
   */
  TransferFrom = '0x23b872dd',

  /**
   * Selector for `tokenURI` function to get the URI for a token's metadata.
   */
  TokenURI = '0xc87b56dd',
}
