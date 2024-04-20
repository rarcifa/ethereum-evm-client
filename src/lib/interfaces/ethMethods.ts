export enum EthMethod {
  Call = 'eth_call',
  GetBalance = 'eth_getBalance',
}

export enum Erc20 {
  BalanceOf = '0x70a08231',
  TotalSupply = '0x18160ddd',
  Name = '0x06fdde03',
  Symbol = '0x95d89b41',
  Transfer = '0xa9059cbb',
}

export enum Erc721 {
  BalanceOf = '0x70a08231',
  OwnerOf = '0x6352211e',
  TransferFrom = '0x23b872dd',
  TokenURI = '0xc87b56dd',
}
