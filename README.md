# Ethereum EVM Client

The Ethereum EVM Client is a TypeScript/JavaScript library designed to facilitate easy and efficient interactions with any Ethereum Virtual Machine (EVM) combatible blockchain. This client library provides methods to interact with ERC20, ERC721 and ERC1155 tokens as well as other utilities, allowing developers to fetch balances, token metadata, and perform other contract interactions seamlessly.

![npm](https://img.shields.io/npm/v/@rarcifa/ethereum-evm-client)
![ES Version](https://img.shields.io/badge/ES6-yellow)
![Node Version](https://img.shields.io/badge/node-16.x-green)

## Features

Simple and intuitive API for interacting with any EVM compatible blockchain.
Supports both ERC20, ERC721, and ERC1155 token standards.
Configurable client instances tailored to your specific blockchain endpoint and security needs.

## Installation

To install the package, run the following command in your project directory:

```bash
npm i @rarcifa/ethereum-evm-client
```

## Usage

Here’s how you can use the Ethereum EVM Client in your project:

### Configuring the Client

```ts
import { createClient } from '@rarcifa/ethereum-evm-clien';

const client = createClient({
  endpoint: 'CUSTOM_RPC_ENDPOINT', // evm rpc endpoint
  apiKey: 'OPPTIONAL_API_KEY', // optional
});
```

### Fetching ERC20 Token Balance

```ts
const fetchErc20Balance = async (accountAddress, contractAddress) => {
  try {
    const balance = await client.erc20.getBalanceOf(
      accountAddress,
      contractAddress
    );
    console.log('ERC20 Token Balance:', balance);
  } catch (error) {
    console.error('Error fetching ERC20 balance:', error);
  }
};
```

### Interacting with Erc721 Tokens

```ts
const fetchErc721Owner = async (contractAddress) => {
  try {
    const owner = await client.erc721.getOwnerOf(contractAddress);
    console.log('NFT Owner Address:', owner);
  } catch (error) {
    console.error('Error fetching Erc721 owner:', error);
  }
};
```

## API

### Erc20 Methods

- `getBalance(accountAddress)`: Fetches the balance of the main token for an account.
- `getBalanceOf(accountAddress, contractAddress)`: Fetches the balance of a specified ERC20 token for an account.
- `getName(contractAddress)`: Fetches the name of the ERC20 token.
- `getSymbol(contractAddress)`: Fetches the symbol of the ERC20 token.
- `getTotalSupply(contractAddress)`: Fetches the total supply of the ERC20 token.

### Erc721 Methods

- `getBalanceOf(accountAddress, contractAddress)`: Fetches the balance of specified ERC721 tokens for an account.
- `getOwnerOf(contractAddress)`: Fetches the owner address of a specific ERC721 token.
- `getTokenUri(contractAddress)`: Fetches the URI pointing to the metadata of the ERC721 token.

### Erc1155 Methods

- `getBalanceOf(accountAddress, contractAddress, tokenId)`: Fetches the balance of a specific token ID for an ERC1155 token at a given account address.
- `getBalanceOfBatch(accountAddresses, contractAddress, tokenIds)`: Fetches the balances for multiple token IDs at multiple account addresses for ERC1155 tokens.

## Contributing

Contributions are welcome! If you'd like to contribute, please fork the repository and use a feature branch. Pull requests are warmly welcome.

## Licensing

The code in this project is licensed under MIT license.

## Contact

If you have any questions or comments about the library, please feel free to open an issue or a pull request on our GitHub repository.
