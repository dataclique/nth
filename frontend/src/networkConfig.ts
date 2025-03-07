import { getFullnodeUrl } from "@mysten/sui/client"
import { createNetworkConfig } from "@mysten/dapp-kit"

export const BACKEND_BASE_URL = "https://strikefi-coqn.shuttle.app/"

const DEVNET_PACKAGE_ID = "0xTODO"
const TESTNET_PACKAGE_ID =
  "0xffa827a39850a5ef924e1d9927977c9863607ef0217398c173c162334a00a36d"
const MAINNET_PACKAGE_ID = "0xTODO"

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    devnet: {
      url: getFullnodeUrl("devnet"),
      variables: {
        counterPackageId: DEVNET_PACKAGE_ID,
      },
    },
    testnet: {
      url: getFullnodeUrl("testnet"),
      variables: {
        counterPackageId: TESTNET_PACKAGE_ID,
      },
    },
    mainnet: {
      url: getFullnodeUrl("mainnet"),
      variables: {
        counterPackageId: MAINNET_PACKAGE_ID,
      },
    },
  })

export { useNetworkVariable, useNetworkVariables, networkConfig }
