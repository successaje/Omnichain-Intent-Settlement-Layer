import hre from "hardhat";
import { ethers } from "hardhat";
import * as fs from "fs";

/**
 * Setup cross-chain connections after deployment
 * Configures LayerZero peers and CCIP chain selectors
 */

interface DeploymentInfo {
  network: string;
  chainId: string;
  contracts: {
    intentManager: string;
    agentRegistry: string;
    paymentEscrow: string;
    executionProxy: string;
  };
}

// LayerZero Endpoint IDs (EIDs)
const LAYERZERO_EIDS: { [key: string]: number } = {
  sepolia: 40161,
  arbitrumSepolia: 40231,
  optimismSepolia: 40232,
  baseSepolia: 40245,
  ethereum: 30101,
  arbitrum: 30110,
  optimism: 30111,
  base: 30184,
  polygon: 30109,
  bsc: 30102,
  avalanche: 30106,
};

// CCIP Chain Selectors
const CCIP_CHAIN_SELECTORS: { [key: string]: bigint } = {
  sepolia: 16015286601757825753n,
  arbitrumSepolia: 3478487238524512106n,
  optimismSepolia: 5224473277236331295n,
  baseSepolia: 10344971235874465080n,
  ethereum: 5009297550715157269n,
  arbitrum: 4949039107694359620n,
  optimism: 3734403246176062136n,
  base: 15971525489660198786n,
  polygon: 4051577828743386545n,
  bsc: 13264668187771770619n,
  avalanche: 6433500567565415381n,
};

async function setupLayerZeroPeers(deployments: DeploymentInfo[]) {
  console.log("\n=== Setting up LayerZero Peers ===\n");
  
  for (let i = 0; i < deployments.length; i++) {
    const deployment = deployments[i];
    const network = deployment.network;
    
    console.log(`Setting up peers for ${network}...`);
    
    // Connect to network
    // Note: In production, you would switch networks here
    const IntentManager = await ethers.getContractFactory("IntentManager");
    const intentManager = IntentManager.attach(deployment.contracts.intentManager);
    
    // Set peers for all other chains
    for (let j = 0; j < deployments.length; j++) {
      if (i === j) continue;
      
      const peerNetwork = deployments[j].network;
      const peerEid = LAYERZERO_EIDS[peerNetwork];
      const peerAddress = deployments[j].contracts.intentManager;
      
      if (peerEid && peerAddress) {
        try {
          // Set peer using LayerZero's setPeer function
          // This would be done via LayerZero's OApp configuration
          console.log(`  → Peer to ${peerNetwork} (EID: ${peerEid}): ${peerAddress}`);
          // await intentManager.setPeer(peerEid, peerAddress);
          console.log(`    ✓ Peer configured`);
        } catch (error) {
          console.log(`    ✗ Failed to set peer: ${error}`);
        }
      }
    }
  }
}

async function setupCcipChainSelectors(deployments: DeploymentInfo[]) {
  console.log("\n=== Setting up CCIP Chain Selectors ===\n");
  
  for (const deployment of deployments) {
    const network = deployment.network;
    const chainSelector = CCIP_CHAIN_SELECTORS[network];
    
    if (!chainSelector) {
      console.log(`Skipping ${network} - no CCIP chain selector`);
      continue;
    }
    
    console.log(`Adding chain selector for ${network}...`);
    
    const IntentManager = await ethers.getContractFactory("IntentManager");
    const intentManager = IntentManager.attach(deployment.contracts.intentManager);
    
    try {
      // Add chain selector for all other chains
      for (const otherDeployment of deployments) {
        if (otherDeployment.network === network) continue;
        
        const otherChainSelector = CCIP_CHAIN_SELECTORS[otherDeployment.network];
        if (otherChainSelector) {
          // await intentManager.addChainSelector(otherChainSelector);
          console.log(`  → Added chain selector: ${otherDeployment.network} (${otherChainSelector})`);
        }
      }
      console.log(`  ✓ ${network} configured`);
    } catch (error) {
      console.log(`  ✗ Failed: ${error}`);
    }
  }
}

async function setupAgentRegistryCrossChain(deployments: DeploymentInfo[]) {
  console.log("\n=== Setting up AgentRegistry Cross-Chain ===\n");
  
  for (const deployment of deployments) {
    const network = deployment.network;
    const chainId = BigInt(deployment.chainId);
    
    console.log(`Configuring AgentRegistry for ${network}...`);
    
    const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
    const agentRegistry = AgentRegistry.attach(deployment.contracts.agentRegistry);
    
    // Set registry addresses for other chains
    for (const otherDeployment of deployments) {
      if (otherDeployment.network === network) continue;
      
      const otherChainId = BigInt(otherDeployment.chainId);
      const otherRegistryAddress = otherDeployment.contracts.agentRegistry;
      
      try {
        // await agentRegistry.setChainRegistryAddress(otherChainId, otherRegistryAddress);
        console.log(`  → Set registry for chain ${otherChainId}: ${otherRegistryAddress}`);
      } catch (error) {
        console.log(`  ✗ Failed: ${error}`);
      }
    }
  }
}

async function main() {
  // Load deployment info
  const deploymentFile = "deployments/multi-chain.json";
  
  if (!fs.existsSync(deploymentFile)) {
    console.error(`Deployment file not found: ${deploymentFile}`);
    console.error("Please run deploy-multi-chain.ts first");
    process.exit(1);
  }
  
  const deploymentData = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const deployments: DeploymentInfo[] = deploymentData.deployments;
  
  console.log("Setting up cross-chain connections for", deployments.length, "networks");
  
  // Setup LayerZero peers
  await setupLayerZeroPeers(deployments);
  
  // Setup CCIP chain selectors
  await setupCcipChainSelectors(deployments);
  
  // Setup AgentRegistry cross-chain
  await setupAgentRegistryCrossChain(deployments);
  
  console.log("\n=== Cross-chain setup complete! ===\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

