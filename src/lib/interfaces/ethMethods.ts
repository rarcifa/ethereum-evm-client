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

  /**
   * Method for getting the block by number.
   */
  GetBlockByNumber = 'eth_getBlockByNumber',
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
  /**
   * Selector for `approve` function to allow a spender to withdraw up to the specified amount of tokens.
   */
  Approve = '0x095ea7b3',

  /**
   * Selector for `allowance` function to check the amount of tokens that an owner allowed to a spender.
   */
  Allowance = '0xdd62ed3e',
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
  /**
   * Selector for `approve` function to approve another address to transfer the ownership of a specific NFT.
   */
  Approve = '0x095ea7b3',

  /**
   * Selector for `getApproved` function to get the approved address for a token ID.
   */
  GetApproved = '0x081812fc',

  /**
   * Selector for `setApprovalForAll` function to enable or disable approval for a third party to manage all assets.
   */
  SetApprovalForAll = '0xa22cb465',
}

/**
 * Enumeration for common ERC1155 token function selectors.
 *
 * @enum {string}
 */
export enum Erc1155 {
  /**
   * Selector for `balanceOf` function to get the balance of account's tokens.
   */
  BalanceOf = '0x00fdd58e',

  /**
   * Selector for `balanceOfBatch` function to get the balance of multiple accounts' tokens.
   */
  BalanceOfBatch = '0x4e1273f4',

  /**
   * Selector for `safeTransferFrom` function to safely transfer tokens from one account to another.
   */
  SafeTransferFrom = '0xf242432a',

  /**
   * Selector for `safeBatchTransferFrom` function to safely transfer multiple types of tokens from one account to another.
   */
  SafeBatchTransferFrom = '0x2eb2c2d6',

  /**
   * Selector for `setApprovalForAll` function to enable or disable approval for a third party to manage all of the caller's tokens.
   */
  SetApprovalForAll = '0xa22cb465',

  /**
   * Selector for `isApprovedForAll` function to check if an address is an authorized operator for another address.
   */
  IsApprovedForAll = '0xe985e9c5',
}
