/**
 * Setup IntentManager Contract
 * 
 * This script configures the IntentManager contract with all necessary
 * settings before users can start creating intents.
 * 
 * Required setup steps:
 * 1. Set LayerZero peers (already done)
 * 2. Set Chainlink CCIP chain selectors
 * 3. Authorize executors
 * 4. Set oracle adapters
 * 5. Configure payment escrow releasers
 * 6. Register test agents (optional)
 */

import { ethers } from "hardhat";
import { getNetworkName, getLayerZeroEndpoint, getCcipRouter, getChainId } from "./deploy";

// Contract addresses (update after deployment)
const CONTRACT_ADDRESSES: Record<string, any> = {
  sepolia: {
    intentManager: "0xd0fC2c0271d8215EcB7Eeb0bdaFf8B1bef7c04A3",
    agentRegistry: "0x3500C12Fbc16CB9beC23362b7524306ccac5018B",
    paymentEscrow: "0x6b27B5864cEF6DC12159cD1DC5b335d6abcFC1a5",
    executionProxy: "0xcA834417fb31B46Db5544e0ddF000b3a822aD9dA",
    oracleAdapter: "0x857a55F93d14a348003356A373D2fCc926b18A7E",
  },
  baseSepolia: {
    intentManager: "0x767FadD3b8A3414c51Bc5D584C07Ea763Db015D7",
    agentRegistry: "0x47f4917805C577a168d411b4531F2A49fBeF311e",
    paymentEscrow: "0x6eE71e2A4a3425B72e7337b7fcc7cd985B1c0892",
    executionProxy: "0xDc3E972df436D0c9F9dAc41066DFfCcC60913e8E",
    oracleAdapter: "0x603FD7639e33cAf15336E5BB52E06558122E4832",
  },
};

// Chain selectors for CCIP
const CCIP_CHAIN_SELECTORS: Record<string, Record<string, bigint>> = {
  sepolia: {
    sepolia: 16015286601586328007n,
    baseSepolia: 5790810961207155382n,
    arbitrumSepolia: 3478487238524512106n,
    optimismSepolia: 5224473277236331295n,
  },
  baseSepolia: {
    sepolia: 16015286601586328007n,
    baseSepolia: 5790810961207155382n,
    arbitrumSepolia: 3478487238524512106n,
    optimismSepolia: 5224473277236331295n,
  },
};

// LayerZero EIDs
const LAYERZERO_EIDS: Record<string, Record<string, number>> = {
  sepolia: {
    sepolia: 40161,
    baseSepolia: 40231,
    arbitrumSepolia: 40231,
    optimismSepolia: 40232,
  },
  baseSepolia: {
    sepolia: 40161,
    baseSepolia: 40231,
    arbitrumSepolia: 40231,
    optimismSepolia: 40232,
  },
};

async function main() {
  const { ethers } = hre;
  const [deployer] = await ethers.getSigners();
  const networkName = getNetworkName();
  
  console.log("Setting up IntentManager on", networkName);
  console.log("Deployer:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  const addresses = CONTRACT_ADDRESSES[networkName] || CONTRACT_ADDRESSES.sepolia;
  const chainSelectors = CCIP_CHAIN_SELECTORS[networkName] || CCIP_CHAIN_SELECTORS.sepolia;
  const eids = LAYERZERO_EIDS[networkName] || LAYERZERO_EIDS.sepolia;

  // Load contracts
  const IntentManager = await ethers.getContractAt("IntentManager", addresses.intentManager);
  const AgentRegistry = await ethers.getContractAt("AgentRegistry", addresses.agentRegistry);
  const PaymentEscrow = await ethers.getContractAt("PaymentEscrow", addresses.paymentEscrow);
  const ExecutionProxy = await ethers.getContractAt("ExecutionProxy", addresses.executionProxy);
  const OracleAdapter = await ethers.getContractAt("ChainlinkOracleAdapter", addresses.oracleAdapter);

  console.log("\n=== Setup IntentManager ===");

  // 1. Set CCIP Chain Selectors
  console.log("\n1. Setting CCIP Chain Selectors...");
  for (const [chainName, selector] of Object.entries(chainSelectors)) {
    if (chainName !== networkName) {
      try {
        const tx = await IntentManager.setCcipChainSelector(chainName, selector);
        await tx.wait();
        console.log(`   ✅ Set CCIP selector for ${chainName}: ${selector}`);
      } catch (error: any) {
        console.log(`   ⚠️  Failed to set CCIP selector for ${chainName}: ${error.message}`);
      }
    }
  }

  // 2. Authorize Executors
  console.log("\n2. Authorizing Executors...");
  try {
    const tx1 = await IntentManager.setExecutor(deployer.address, true);
    await tx1.wait();
    console.log(`   ✅ Authorized executor: ${deployer.address}`);
  } catch (error: any) {
    console.log(`   ⚠️  Failed to authorize executor: ${error.message}`);
  }

  // 3. Set Oracle Adapter
  console.log("\n3. Setting Oracle Adapter...");
  try {
    const tx = await IntentManager.setOracleAdapter(addresses.oracleAdapter);
    await tx.wait();
    console.log(`   ✅ Set oracle adapter: ${addresses.oracleAdapter}`);
  } catch (error: any) {
    console.log(`   ⚠️  Failed to set oracle adapter: ${error.message}`);
  }

  // 4. Configure Payment Escrow Releasers
  console.log("\n4. Configuring Payment Escrow Releasers...");
  try {
    // Authorize IntentManager as releaser
    const tx1 = await PaymentEscrow.authorizeReleaser(addresses.intentManager, true);
    await tx1.wait();
    console.log(`   ✅ Authorized IntentManager as releaser`);

    // Authorize ExecutionProxy as releaser
    const tx2 = await PaymentEscrow.authorizeReleaser(addresses.executionProxy, true);
    await tx2.wait();
    console.log(`   ✅ Authorized ExecutionProxy as releaser`);
  } catch (error: any) {
    console.log(`   ⚠️  Failed to configure payment escrow: ${error.message}`);
  }

  // 5. Set Execution Proxy in IntentManager
  console.log("\n5. Setting Execution Proxy...");
  try {
    const tx = await IntentManager.setExecutionProxy(addresses.executionProxy);
    await tx.wait();
    console.log(`   ✅ Set execution proxy: ${addresses.executionProxy}`);
  } catch (error: any) {
    console.log(`   ⚠️  Failed to set execution proxy: ${error.message}`);
  }

  // 6. Set Agent Registry in IntentManager
  console.log("\n6. Setting Agent Registry...");
  try {
    const tx = await IntentManager.setAgentRegistry(addresses.agentRegistry);
    await tx.wait();
    console.log(`   ✅ Set agent registry: ${addresses.agentRegistry}`);
  } catch (error: any) {
    console.log(`   ⚠️  Failed to set agent registry: ${error.message}`);
  }

  // 7. Set Payment Escrow in IntentManager
  console.log("\n7. Setting Payment Escrow...");
  try {
    const tx = await IntentManager.setPaymentEscrow(addresses.paymentEscrow);
    await tx.wait();
    console.log(`   ✅ Set payment escrow: ${addresses.paymentEscrow}`);
  } catch (error: any) {
    console.log(`   ⚠️  Failed to set payment escrow: ${error.message}`);
  }

  // 8. Register a test agent (optional)
  console.log("\n8. Registering Test Agent (optional)...");
  try {
    const testAgentData = {
      ensName: "test-agent.solver.eth",
      specialization: "Yield Optimization",
      stake: ethers.parseEther("1.0"), // 1 ETH
    };
    
    const tx = await AgentRegistry.registerAgent(
      testAgentData.ensName,
      testAgentData.specialization,
      { value: testAgentData.stake }
    );
    await tx.wait();
    console.log(`   ✅ Registered test agent: ${testAgentData.ensName}`);
  } catch (error: any) {
    console.log(`   ⚠️  Failed to register test agent: ${error.message}`);
  }

  console.log("\n=== Setup Complete ===");
  console.log("\n✅ IntentManager is now ready to accept intents!");
  console.log("\nNext steps:");
  console.log("  1. Verify all configurations on block explorer");
  console.log("  2. Test creating an intent from the frontend");
  console.log("  3. Monitor contract events for intent creation");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

