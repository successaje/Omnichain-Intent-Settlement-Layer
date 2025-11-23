/**
 * Contract Addresses Configuration
 * 
 * These addresses are loaded from the deployment files.
 * Update when deploying to new networks.
 */

export const CONTRACT_ADDRESSES = {
  sepolia: {
    intentManager: "0xd0fC2c0271d8215EcB7Eeb0bdaFf8B1bef7c04A3",
    agentRegistry: "0x3500C12Fbc16CB9beC23362b7524306ccac5018B",
    paymentEscrow: "0x6b27B5864cEF6DC12159cD1DC5b335d6abcFC1a5",
    executionProxy: "0xcA834417fb31B46Db5544e0ddF000b3a822aD9dA",
    oracleAdapter: "0x857a55F93d14a348003356A373D2fCc926b18A7E",
    reputationToken: "0xc7024823429a8224d32e076e637413CC4eF4E26B",
  },
  baseSepolia: {
    intentManager: "0x767FadD3b8A3414c51Bc5D584C07Ea763Db015D7",
    agentRegistry: "0x47f4917805C577a168d411b4531F2A49fBeF311e",
    paymentEscrow: "0x6eE71e2A4a3425B72e7337b7fcc7cd985B1c0892",
    executionProxy: "0xDc3E972df436D0c9F9dAc41066DFfCcC60913e8E",
    oracleAdapter: "0x603FD7639e33cAf15336E5BB52E06558122E4832",
    reputationToken: "0x5467EB13A408C48EB02811E92968F6e2A2556040",
  },
} as const;

export const LAYERZERO_EIDS = {
  sepolia: 40161,
  baseSepolia: 40245,
  arbitrumSepolia: 40231,
  optimismSepolia: 40232,
} as const;

export const CCIP_CHAIN_SELECTORS = {
  sepolia: "16015286601757825753",
  baseSepolia: "10344971235874465080",
  arbitrumSepolia: "3478487238524512106",
  optimismSepolia: "5224473277236331295",
} as const;

/**
 * Get contract address for current chain
 */
export function getContractAddress(
  chainId: number,
  contractName: keyof typeof CONTRACT_ADDRESSES.sepolia
): string {
  // Sepolia: 11155111
  if (chainId === 11155111) {
    return CONTRACT_ADDRESSES.sepolia[contractName];
  }
  
  // Base Sepolia: 84532
  if (chainId === 84532) {
    return CONTRACT_ADDRESSES.baseSepolia[contractName];
  }
  
  // Default to Sepolia
  return CONTRACT_ADDRESSES.sepolia[contractName];
}

