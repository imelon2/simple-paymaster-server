import { defineChain } from "viem";
import { mainnet, kaia, polygon, arbitrum, arbitrumSepolia, localhost } from "viem/chains";

const dkargoWarehouse = defineChain({
  id: 61022448,
  name: "DkargoWarehouse",
  network: "warehouse",
  nativeCurrency: {
    name: "dkargo",
    symbol: "DKA",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://warehouse-full01.dkargo.io"],
    },
    public: {
      http: ["https://warehouse-full01.dkargo.io"],
    },
  },
  dasUrls: "",
});

const supportedChains = {
  mainnet,
  kaia,
  polygon,
  arbitrum,
  arbitrumSepolia,
  dkargoWarehouse,
  localhost
};


/**
 *
 * @param _chainName
 * @returns (default mainnet)
 */
export const getChainInfoById = (chainId: number) => {
  for (const chain of Object.values(supportedChains)) {
    if ("id" in chain) {
      if (chain.id === chainId) {
        return chain;
      }
    }
  }

  return mainnet;
};
