import hre from "hardhat";
import * as fs from "fs";

/**
 * Script to call LayerZero IntentManager functions
 * 
 * Usage:
 *   npx hardhat run scripts/call-layerzero.ts --network sepolia
 *   npx hardhat run scripts/call-layerzero.ts --network baseSepolia
 * 
 * Environment Variables:
 *   INTENT_ID - Intent ID to use for cross-chain operations (optional)
 *   DST_EID - Destination endpoint ID (optional, defaults to Base Sepolia)
 */

// LayerZero Endpoint IDs
const ENDPOINT_IDS: { [key: string]: number } = {
  // Mainnets
  ethereum: 301,
  arbitrum: 30110,
  optimism: 30111,
  avalanche: 30106,
  base: 30184,
  polygon: 30109,
  
  // Testnets
  sepolia: 40161,
  baseSepolia: 40245,
  arbitrumSepolia: 40231,
  optimismSepolia: 40232,
};

// Default destination for cross-chain messages
const DEFAULT_DST_EID = 40245; // Base Sepolia

async function main() {
  const { ethers } = hre;
  const network = hre.network.name;
  const [signer] = await ethers.getSigners();
  
  console.log("\n=== LayerZero IntentManager Interaction ===\n");
  console.log("Network:", network);
  console.log("Signer:", signer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(signer.address)), "ETH");
  console.log("");

  // Load deployment info
  const deploymentFile = `deployments/${network}.json`;
  if (!fs.existsSync(deploymentFile)) {
    throw new Error(`Deployment file not found: ${deploymentFile}`);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf-8"));
  const intentManagerAddress = deployment.contracts.intentManager;
  
  console.log("IntentManager Address:", intentManagerAddress);
  console.log("LayerZero Endpoint:", deployment.configuration.layerZeroEndpoint);
  console.log("");

  // Get contract instance
  const intentManager = await ethers.getContractAt(
    "IntentManager",
    intentManagerAddress
  );

  // Get current endpoint ID
  const currentEid = ENDPOINT_IDS[network];
  if (!currentEid) {
    console.warn(`⚠️  Unknown endpoint ID for network: ${network}`);
  } else {
    console.log(`Current Endpoint ID (eid): ${currentEid}`);
  }

  // Get destination endpoint ID from env or use default
  const dstEid = process.env.DST_EID 
    ? parseInt(process.env.DST_EID) 
    : DEFAULT_DST_EID;
  console.log(`Destination Endpoint ID (dstEid): ${dstEid}`);
  console.log("");

  // 1. Test quoteCrossChainFee()
  console.log("--- Testing quoteCrossChainFee() ---");
  try {
    // Create a sample message payload
    const samplePayload = ethers.AbiCoder.defaultAbiCoder().encode(
      ["uint256", "address", "uint256"],
      [1, signer.address, ethers.parseEther("0.1")]
    );

    // Create sample options (empty for now, can add gas limits later)
    const options = "0x";

    const fee = await intentManager.quoteCrossChainFee(
      dstEid,
      samplePayload,
      options,
      false // payInLzToken = false (pay in native token)
    );

    console.log("✓ Fee Quote:");
    console.log(`  Native Fee: ${ethers.formatEther(fee.nativeFee)} ETH`);
    console.log(`  LZ Token Fee: ${ethers.formatEther(fee.lzTokenFee)} LZ`);
    console.log(`  Total Fee: ${ethers.formatEther(fee.nativeFee + fee.lzTokenFee)}`);
  } catch (error: any) {
    console.error(`❌ Error quoting fee: ${error.message}`);
    if (error.message.includes("revert")) {
      console.error("   Hint: Make sure LayerZero peer is configured");
    }
  }

  // 2. Test getIntent() if INTENT_ID is provided
  const intentId = process.env.INTENT_ID;
  if (intentId) {
    console.log("\n--- Testing getIntent() ---");
    console.log(`Intent ID: ${intentId}`);
    try {
      const intent = await intentManager.getIntent(intentId);
      console.log("✓ Intent Details:");
      console.log(`  Intent ID: ${intent.intentId.toString()}`);
      console.log(`  User: ${intent.user}`);
      console.log(`  Intent Spec: ${intent.intentSpec}`);
      console.log(`  Amount: ${ethers.formatEther(intent.amount)} tokens`);
      console.log(`  Token: ${intent.token}`);
      console.log(`  Status: ${intent.status}`);
      console.log(`  Deadline: ${new Date(Number(intent.deadline) * 1000).toISOString()}`);
      console.log(`  Filecoin CID: ${intent.filecoinCid}`);
    } catch (error: any) {
      console.error(`❌ Error getting intent: ${error.message}`);
    }
  } else {
    console.log("\n--- Skipping getIntent() ---");
    console.log("Set INTENT_ID environment variable to test getIntent()");
  }

  // 3. Test sendIntentToChain() if INTENT_ID is provided and intent is in Executing status
  if (intentId) {
    console.log("\n--- Testing sendIntentToChain() ---");
    console.log(`Intent ID: ${intentId}`);
    console.log(`Destination eid: ${dstEid}`);
    
    try {
      // Check intent status first
      const intent = await intentManager.getIntent(intentId);
      console.log(`Current Intent Status: ${intent.status}`);
      
      if (intent.status !== 2) { // 2 = Executing
        console.log("⚠️  Intent is not in Executing status. Cannot send cross-chain.");
        console.log("   Hint: Intent must be in Executing status to send cross-chain");
      } else {
        // Create payload
        const payload = ethers.AbiCoder.defaultAbiCoder().encode(
          ["uint256", "address", "uint256"],
          [BigInt(intentId), intent.user, intent.amount]
        );

        // Get fee quote first
        const fee = await intentManager.quoteCrossChainFee(
          dstEid,
          payload,
          "0x",
          false
        );

        const totalFee = fee.nativeFee + fee.lzTokenFee;
        console.log(`Required Fee: ${ethers.formatEther(totalFee)} ETH`);
        console.log(`Current Balance: ${ethers.formatEther(await ethers.provider.getBalance(signer.address))} ETH`);

        // Check if we have enough balance
        const balance = await ethers.provider.getBalance(signer.address);
        if (balance < totalFee) {
          console.log("⚠️  Insufficient balance to send cross-chain message");
          console.log("   Skipping sendIntentToChain() call");
        } else {
          console.log("\n⚠️  This will send a real cross-chain message!");
          console.log("   Uncomment the code below to execute:");
          console.log(`
          const tx = await intentManager.sendIntentToChain(
            ${intentId},
            ${dstEid},
            payload,
            "0x",
            { value: totalFee }
          );
          const receipt = await tx.wait();
          console.log("✓ Cross-chain message sent!");
          console.log("  Tx Hash:", receipt.hash);
          `);
          
          // Uncomment to actually send (commented out for safety)
          // const tx = await intentManager.sendIntentToChain(
          //   intentId,
          //   dstEid,
          //   payload,
          //   "0x",
          //   { value: totalFee }
          // );
          // const receipt = await tx.wait();
          // console.log("✓ Cross-chain message sent!");
          // console.log("  Tx Hash:", receipt.hash);
        }
      }
    } catch (error: any) {
      console.error(`❌ Error sending cross-chain message: ${error.message}`);
    }
  } else {
    console.log("\n--- Skipping sendIntentToChain() ---");
    console.log("Set INTENT_ID environment variable to test sendIntentToChain()");
  }

  // 4. Test getCrossChainIntent() if we have a cross-chain ID
  console.log("\n--- Testing getCrossChainIntent() ---");
  console.log("Note: Requires a valid crossChainId from a previous cross-chain message");
  console.log("   Use getIntentCrossChainIds() to get cross-chain IDs for an intent");

  // 5. Test getIntentCrossChainIds() if INTENT_ID is provided
  if (intentId) {
    console.log("\n--- Testing getIntentCrossChainIds() ---");
    try {
      const crossChainIds = await intentManager.getIntentCrossChainIds(intentId);
      console.log(`✓ Found ${crossChainIds.length} cross-chain IDs for intent ${intentId}`);
      if (crossChainIds.length > 0) {
        crossChainIds.forEach((id: string, index: number) => {
          console.log(`  [${index}]: ${id}`);
        });
      }
    } catch (error: any) {
      console.error(`❌ Error getting cross-chain IDs: ${error.message}`);
    }
  }

  console.log("\n=== Interaction Complete ===\n");
  console.log("Usage Examples:");
  console.log(`  # Quote fee only:`);
  console.log(`  npx hardhat run scripts/call-layerzero.ts --network ${network}`);
  console.log(`  # With intent ID:`);
  console.log(`  INTENT_ID=1 npx hardhat run scripts/call-layerzero.ts --network ${network}`);
  console.log(`  # With custom destination:`);
  console.log(`  DST_EID=40245 INTENT_ID=1 npx hardhat run scripts/call-layerzero.ts --network ${network}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


