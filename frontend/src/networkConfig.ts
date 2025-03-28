import { getFullnodeUrl } from "@mysten/sui/client"
import { createNetworkConfig } from "@mysten/dapp-kit"

export const BACKEND_BASE_URL = "https://strikefi-coqn.shuttle.app/"

const DEVNET_PACKAGE_ID = "0xTODO"
const TESTNET_PACKAGE_ID =
  "0xf347590ce69acb840be78a67c8abc79d5fe28ccc5c34cd7c609c2a4819ae71ec"
const MAINNET_PACKAGE_ID = "0xTODO"

// USDC coin type addresses from Circle's official documentation
// Source: https://www.circle.com/blog/now-available-native-usdc-on-sui
const MAINNET_USDC_COIN_TYPE =
  "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC"
const TESTNET_USDC_COIN_TYPE =
  "0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC"
const DEVNET_USDC_COIN_TYPE =
  "0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC" // Using testnet address for devnet as placeholder

// Remove the margin-specific package IDs

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    devnet: {
      url: getFullnodeUrl("devnet"),
      variables: {
        packageId: DEVNET_PACKAGE_ID,
        usdcCoinType: DEVNET_USDC_COIN_TYPE,
      },
    },
    testnet: {
      url: getFullnodeUrl("testnet"),
      variables: {
        packageId: TESTNET_PACKAGE_ID,
        usdcCoinType: TESTNET_USDC_COIN_TYPE,
      },
    },
    mainnet: {
      url: getFullnodeUrl("mainnet"),
      variables: {
        packageId: MAINNET_PACKAGE_ID,
        usdcCoinType: MAINNET_USDC_COIN_TYPE,
      },
    },
  })

export { useNetworkVariable, useNetworkVariables, networkConfig }
