# [⚠️ DEPRECATED] simple paymaster server
![Deprecated](https://img.shields.io/badge/status-deprecated-red)

> **This repository is no longer maintained.**
> Please use [erc4337-paymaster-server](https://github.com/imelon2/erc4337-paymaster-server) instead. Refactored the backend architecture from Express.js to NestJS to improve scalability, maintainability, and modular design.

</br>

</br>

This repository provides a reference implementation of a simple paymaster server based on the VerifyingPaymaster.sol smart contract from [eth-infinitism’s account-abstraction](https://github.com/eth-infinitism/account-abstraction/tree/v0.7.0) project. The server is designed to sponsor gas fees for users in an ERC-4337 account abstraction flow by verifying off-chain signatures, following the same logic as the on-chain [`VerifyingPaymaster.sol`](https://github.com/eth-infinitism/account-abstraction/blob/v0.7.0/contracts/samples/VerifyingPaymaster.sol).

The server’s API interface is built according to the **[ERC-7677 Paymaster Web Service Capability standard](https://eips.ethereum.org/EIPS/eip-7677)**, enabling seamless integration with ERC-4337 wallets and bundlers. This project serves as a practical starting point for building and testing custom paymaster logic and sponsorship flows in modern Ethereum dApps.


> [!IMPORTANT]
> This server only supports the `pm_getPaymasterData` and `pm_getPaymasterStubData` APIs.
> It does not support payments using ERC20 tokens.

## Quick start
1. Set the values shown in `.env.example` as environmental variables. To copy it into a `.env` file:

    ```
    cp .env.example .env
    ```

2. You'll still need to edit some variables, i.e., `PAYMASTER_PK`, `BUNDLER_URL`, `PROVIDER_URL`, `PAYMASTER_ADDRESS`.
    ```
    BUNDLER_URL=http://127.0.0.1:3000
    PROVIDER_URL=http://127.0.0.1:8545

    PAYMASTER_ADDRESS=
    PAYMASTER_PK=

    ```

3. run deploy script
    ```
    yarn run start
    ```

</br>

# SDK Compatibility
[![Ethereum](https://img.shields.io/badge/Ethereum-3C3C3D?logo=ethereum&logoColor=white)](#)
[![Viem](https://custom-icon-badges.demolab.com/badge/Viem-FFC517?logo=viem-dark)](#)

This server is designed to be fully compatible with [**viem/account-abstraction**](https://viem.sh/account-abstraction) and the SimpleSmartAccount from **[permissionless/accounts](https://docs.pimlico.io/references/permissionless/)**. 

If you would like to run it yourself, please follow the instructions at [hello-viem](https://github.com/imelon2/hello-viem) repo!
