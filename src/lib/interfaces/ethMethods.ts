/**
 * Common Ethereum JSON-RPC method names.
 */
export enum EthMethod {
  /** Method for making a call to read contract data. */
  Call = 'eth_call',

  /** Method for getting the native token balance of an account. */
  GetBalance = 'eth_getBalance',
}

/**
 * Common ERC20 token function selectors.
 */
export enum Erc20 {
  /** Selector for `balanceOf`, which returns the token balance of an account. */
  BalanceOf = '0x70a08231',

  /** Selector for `totalSupply`, which returns the total token supply. */
  TotalSupply = '0x18160ddd',

  /** Selector for `decimals`, which returns the number of decimals the token uses. */
  Decimals = '0x313ce567',

  /** Selector for `name`, which returns the name of the token. */
  Name = '0x06fdde03',

  /** Selector for `symbol`, which returns the symbol of the token. */
  Symbol = '0x95d89b41',

  /** Selector for `transfer`, which transfers tokens to an account. */
  Transfer = '0xa9059cbb',

  /** Selector for `approve`, which allows a spender to withdraw up to an amount of tokens. */
  Approve = '0x095ea7b3',

  /** Selector for `allowance`, which returns the amount of tokens an owner allowed a spender. */
  Allowance = '0xdd62ed3e',
}

/**
 * Common ERC721 token function selectors.
 */
export enum Erc721 {
  /** Selector for `balanceOf`, which returns the number of tokens an account owns. */
  BalanceOf = '0x70a08231',

  /** Selector for `ownerOf`, which returns the owner of a token. */
  OwnerOf = '0x6352211e',

  /** Selector for `transferFrom`, which transfers the ownership of a token. */
  TransferFrom = '0x23b872dd',

  /** Selector for `tokenURI`, which returns the uri of the metadata of a token. */
  TokenURI = '0xc87b56dd',

  /** Selector for `approve`, which allows another address to transfer a token. */
  Approve = '0x095ea7b3',

  /** Selector for `getApproved`, which returns the approved address of a token. */
  GetApproved = '0x081812fc',

  /** Selector for `setApprovalForAll`, which allows or forbids an operator to manage every token of the caller. */
  SetApprovalForAll = '0xa22cb465',
}

/**
 * Common ERC1155 token function selectors.
 */
export enum Erc1155 {
  /** Selector for `balanceOf`, which returns the balance of one token id at one account. */
  BalanceOf = '0x00fdd58e',

  /** Selector for `balanceOfBatch`, which returns the balances of pairs of account and token id. */
  BalanceOfBatch = '0x4e1273f4',

  /** Selector for `safeTransferFrom`, which transfers tokens of one id from one account to another. */
  SafeTransferFrom = '0xf242432a',

  /** Selector for `safeBatchTransferFrom`, which transfers tokens of several ids from one account to another. */
  SafeBatchTransferFrom = '0x2eb2c2d6',

  /** Selector for `setApprovalForAll`, which allows or forbids an operator to manage every token of the caller. */
  SetApprovalForAll = '0xa22cb465',

  /** Selector for `isApprovedForAll`, which returns whether an address is an operator for another address. */
  IsApprovedForAll = '0xe985e9c5',
}
