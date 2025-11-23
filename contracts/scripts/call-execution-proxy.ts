import hre from "hardhat";
import * as fs from "fs";

/**
 * Script to call ExecutionProxy functions (LayerZero + Chainlink)
 * 
 * Usage:
 *   npx hardhat run scripts/call-execution-proxy.ts --network sepolia
 *   npx hardhat run scripts/call-execution-proxy.ts --network baseSepolia
 * 
 * Environment Variables:
 *   INTENT_ID - Intent ID for swap operations (optional)
 *   SRC_TOKEN - Source token address (optional, defaults to ETH)
 *   DST_TOKEN - Destination token address (optional, defaults to ETH)
 *   DST_EID - Destination endpoint ID (optional, defaults to Base Sepolia)
 */

// LayerZero Endpoint IDs
const ENDPOINT_IDS: { [key: string]: number } = {
  sepolia: 40161,
  baseSepolia: 40245,
  arbitrumSepolia: 40231,
  optimismSepolia: 40232,
};

// Default destination
const DEFAULT_DST_EID = 40245; // Base Sepolia
const ETH_ADDRESS = "0x0000000000000000000000000000000000000000";

async function main() {
  const { ethers } = hre;
  const network = hre.network.name;
  const [signer] = await ethers.getSigners();
  
  console.log("\n=== ExecutionProxy Interaction ===\n");
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
  const executionProxyAddress = deployment.contracts.executionProxy;
  const oracleAdapterAddress = deployment.contracts.oracleAdapter;
  
  console.log("ExecutionProxy Address:", executionProxyAddress);
  console.log("OracleAdapter Address:", oracleAdapterAddress);
  console.log("");

  // Get contract instances
  const executionProxy = await ethers.getContractAt(
    "ExecutionProxy",
    executionProxyAddress
  );

  const oracleAdapter = await ethers.getContractAt(
    "ChainlinkOracleAdapter",
    oracleAdapterAddress
  );

  // Get token addresses
  const srcToken = process.env.SRC_TOKEN || ETH_ADDRESS;
  const dstToken = process.env.DST_TOKEN || ETH_ADDRESS;
  const dstEid = process.env.DST_EID ? parseInt(process.env.DST_EID) : DEFAULT_DST_EID;

  console.log("Configuration:");
  console.log(`  Source Token: ${srcToken}`);
  console.log(`  Destination Token: ${dstToken}`);
  console.log(`  Destination eid: ${dstEid}`);
  console.log("");

  // 1. Test getExpectedAmount() - Uses Chainlink price feeds
  console.log("--- Testing getExpectedAmount() (Chainlink) ---");
  try {
    const srcAmount = ethers.parseEther("1"); // 1 ETH
    console.log(`Source Amount: ${ethers.formatEther(srcAmount)} tokens`);

    // Check if price feeds are configured
    const srcFeed = await oracleAdapter.priceFeeds(srcToken);
    const dstFeed = await oracleAdapter.priceFeeds(dstToken);

    if (srcFeed === ethers.ZeroAddress) {
      console.log(`⚠️  Price feed not configured for source token`);
      console.log(`   Run: npx hardhat run scripts/setup-price-feeds.ts --network ${network}`);
    } else if (dstFeed === ethers.ZeroAddress) {
      console.log(`⚠️  Price feed not configured for destination token`);
      console.log(`   Run: npx hardhat run scripts/setup-price-feeds.ts --network ${network}`);
    } else {
      const expectedAmount = await executionProxy.getExpectedAmount(
        srcToken,
        dstToken,
        srcAmount
      );
      console.log(`✓ Expected Amount: ${ethers.formatEther(expectedAmount)} tokens`);
      console.log(`  (Based on Chainlink price feeds)`);
    }
  } catch (error: any) {
    console.error(`❌ Error getting expected amount: ${error.message}`);
    if (error.message.includes("Price feed not found")) {
      console.error("   Hint: Configure price feeds using setup-price-feeds.ts");
    }
  }

  // 2. Test price feed configuration
  console.log("\n--- Checking Price Feed Configuration ---");
  try {
    const srcFeed = await executionProxy.priceFeeds(srcToken);
    const dstFeed = await executionProxy.priceFeeds(dstToken);
    const srcThreshold = await executionProxy.priceStalenessThreshold(srcToken);
    const dstThreshold = await executionProxy.priceStalenessThreshold(dstToken);

    console.log(`Source Token (${srcToken}):`);
    console.log(`  Price Feed: ${srcFeed}`);
    console.log(`  Staleness Threshold: ${srcThreshold.toString()} seconds`);
    console.log(`Destination Token (${dstToken}):`);
    console.log(`  Price Feed: ${dstFeed}`);
    console.log(`  Staleness Threshold: ${dstThreshold.toString()} seconds`);

    if (srcFeed === ethers.ZeroAddress || dstFeed === ethers.ZeroAddress) {
      console.log("\n⚠️  Price feeds not configured in ExecutionProxy");
      console.log("   Use setPriceFeed() to configure feeds");
    }
  } catch (error: any) {
    console.error(`❌ Error checking price feeds: ${error.message}`);
  }

  // 3. Test initiateSwap() if INTENT_ID is provided
  const intentId = process.env.INTENT_ID;
  if (intentId) {
    console.log("\n--- Testing initiateSwap() (LayerZero + Chainlink) ---");
    console.log(`Intent ID: ${intentId}`);
    
    try {
      const srcAmount = ethers.parseEther("0.1"); // 0.1 tokens
      const minDstAmount = ethers.parseEther("0.09"); // 10% slippage tolerance
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600); // 1 hour from now
      const options = "0x"; // Empty options

      console.log(`Source Amount: ${ethers.formatEther(srcAmount)}`);
      console.log(`Min Destination Amount: ${ethers.formatEther(minDstAmount)}`);
      console.log(`Deadline: ${new Date(Number(deadline) * 1000).toISOString()}`);

      // Get fee quote first
      // Note: ExecutionProxy doesn't have a direct fee quote, but we can estimate
      console.log("\n⚠️  This will initiate a real cross-chain swap!");
      console.log("   Uncomment the code below to execute:");
      console.log(`
      const tx = await executionProxy.initiateSwap(
        ${intentId},
        "${srcToken}",
        "${dstToken}",
        ${srcAmount.toString()},
        ${minDstAmount.toString()},
        ${dstEid},
        "${options}",
        ${deadline.toString()},
        { value: ethers.parseEther("0.01") } // Estimated fee
      );
      const receipt = await tx.wait();
      console.log("✓ Swap initiated!");
      console.log("  Tx Hash:", receipt.hash);
      `);
      
      // Uncomment to actually execute (commented out for safety)
      // const tx = await executionProxy.initiateSwap(
      //   intentId,
      //   srcToken,
      //   dstToken,
      //   srcAmount,
      //   minDstAmount,
      //   dstEid,
      //   options,
      //   deadline,
      //   { value: ethers.parseEther("0.01") }
      // );
      // const receipt = await tx.wait();
      // console.log("✓ Swap initiated!");
      // console.log("  Tx Hash:", receipt.hash);
    } catch (error: any) {
      console.error(`❌ Error initiating swap: ${error.message}`);
    }
  } else {
    console.log("\n--- Skipping initiateSwap() ---");
    console.log("Set INTENT_ID environment variable to test initiateSwap()");
  }

  // 4. Test batchExecuteIntent() if we have multiple intent IDs
  console.log("\n--- Testing batchExecuteIntent() ---");
  console.log("Note: Requires multiple intent IDs");
  console.log("   Example: INTENT_IDS='1,2,3' npx hardhat run scripts/call-execution-proxy.ts --network sepolia");

  const intentIds = process.env.INTENT_IDS?.split(",").map(id => id.trim());
  if (intentIds && intentIds.length > 1) {
    try {
      const tokens = intentIds.map(() => srcToken);
      const amounts = intentIds.map(() => ethers.parseEther("0.1"));
      const options = "0x";

      console.log(`Batch executing ${intentIds.length} intents...`);
      console.log("⚠️  This will send a real batch cross-chain message!");
      console.log("   Uncomment the code below to execute:");
      console.log(`
      const tx = await executionProxy.batchExecuteIntent(
        [${intentIds.join(", ")}],
        [${tokens.map(t => `"${t}"`).join(", ")}],
        [${amounts.map(a => a.toString()).join(", ")}],
        ${dstEid},
        "${options}",
        { value: ethers.parseEther("0.01") }
      );
      const receipt = await tx.wait();
      console.log("✓ Batch execution initiated!");
      console.log("  Tx Hash:", receipt.hash);
      `);
    } catch (error: any) {
      console.error(`❌ Error batch executing: ${error.message}`);
    }
  }

  console.log("\n=== Interaction Complete ===\n");
  console.log("Usage Examples:");
  console.log(`  # Get expected amount:`);
  console.log(`  npx hardhat run scripts/call-execution-proxy.ts --network ${network}`);
  console.log(`  # With custom tokens:`);
  console.log(`  SRC_TOKEN=0x... DST_TOKEN=0x... npx hardhat run scripts/call-execution-proxy.ts --network ${network}`);
  console.log(`  # Initiate swap:`);
  console.log(`  INTENT_ID=1 npx hardhat run scripts/call-execution-proxy.ts --network ${network}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


