import { createClient } from '../../lib/client/ethereumClient.js';

describe('erc20 Integration Tests', () => {
  const ethereumInstance = createClient({
    endpoint: 'https://ethereum-rpc.publicnode.com',
  });

  it('successfully fetches account balance', async () => {
    const balance = await ethereumInstance.erc20.getBalance(
      '0x18cF36D6925026f00A57754757Ecd480B92cBefC'
    );
    expect(balance).toBe(balance);
  });

  it('successfully fetches erc20 balance', async () => {
    const balanceOf = await ethereumInstance.erc20.getBalanceOf(
      '0xe45E12B44fCa87e42dbC63A67bF5AA8aB800f459',
      '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE'
    );
    expect(balanceOf).toBe(balanceOf);
  });

  it('successfully fetches erc20 name', async () => {
    const name = await ethereumInstance.erc20.getName(
      '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    );
    expect(name).toBe('Tether USD');
  });

  it('successfully fetches erc20 symbol', async () => {
    const symbol = await ethereumInstance.erc20.getSymbol(
      '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    );
    expect(symbol).toBe('USDT');
  });

  it('successfully fetches erc20 total supply', async () => {
    const totalSupply = await ethereumInstance.erc20.getTotalSupply(
      '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    );
    expect(totalSupply).toBe(totalSupply);
  });
});

describe('erc721 Integration Tests', () => {
  const ethereumInstance = createClient({
    endpoint: 'https://ethereum-rpc.publicnode.com',
  });

  it('successfully fetches erc721 balance', async () => {
    const balanceOf = await ethereumInstance.erc721.getBalanceOf(
      '0x18cF36D6925026f00A57754757Ecd480B92cBefC',
      '0x60E4d786628Fea6478F785A6d7e704777c86a7c6'
    );
    expect(balanceOf).toBe(balanceOf);
  });

  it('successfully fetches erc721 ownerOf', async () => {
    const ownerOf = await ethereumInstance.erc721.getOwnerOf(
      '0x60E4d786628Fea6478F785A6d7e704777c86a7c6',
      '6522'
    );
    expect(ownerOf).toBe(ownerOf);
  });

  it('successfully fetches erc721 uri', async () => {
    const uri = await ethereumInstance.erc721.getTokenUri(
      '0x60E4d786628Fea6478F785A6d7e704777c86a7c6',
      '6522'
    );
    expect(uri).toBe(uri);
  });
});

describe('erc1155 Integration Tests', () => {
  const ethereumInstance = createClient({
    endpoint: 'https://ethereum-rpc.publicnode.com',
  });

  it('successfully fetches erc1155 balance', async () => {
    const balanceOf = await ethereumInstance.erc1155.getBalanceOf(
      '0xA45cd9A7685cD9926e59C14305E3Af275F280949',
      '0xA45cd9A7685cD9926e59C14305E3Af275F280949',
      '4'
    );
    expect(balanceOf).toBe(balanceOf);
  });

  it('successfully fetches erc1155 balance of batch', async () => {
    const balanceOfBatch = await ethereumInstance.erc1155.getBalanceOfBatch(
      [
        '0x990aef1085b2f6480a94bba53cbc03215d321e25',
        '0x9cd14e32E3B1AAf35D61EBD9066Ef8e3B06b23ad',
      ],
      '0xdc4aff511e1b94677142a43df90f948f9ae181dd',
      ['1', '2']
    );
    expect(balanceOfBatch).toBe(balanceOfBatch);
  });
});
