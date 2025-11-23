import hre from "hardhat";
import * as fs from "fs";

/**
 * Script to call Chainlink OracleAdapter functions
 * 
 * Usage:
 *   npx hardhat run scripts/call-chainlink.ts --network sepolia
 *   npx hardhat run scripts/call-chainlink.ts --network baseSepolia
 */

// Sepolia Price Feed Addresses
const SEPOLIA_PRICE_FEEDS: { [key: string]: { token: string; feed: string } } = {
  ETH: {
    token: "0x0000000000000000000000000000000000000000",
    feed: "0x694AA1769357215DE4FAC081bf1f309aDC325306", // ETH/USD
  },
};

// Base Sepolia Price Feed Addresses
const BASE_SEPOLIA_PRICE_FEEDS: { [key: string]: { token: string; feed: string } } = {
  ETH: {
    token: "0x0000000000000000000000000000000000000000",
    feed: "0x4aDC67696bA383F43DD60A171e9278f74A5fB1f7", // ETH/USD
  },
};

async function main() {
  const { ethers } = hre;
  const network = hre.network.name;
  
  console.log("\n=== Chainlink OracleAdapter Interaction ===\n");
  console.log("Network:", network);

  // Load deployment info
  const deploymentFile = `deployments/${network}.json`;
  if (!fs.existsSync(deploymentFile)) {
    throw new Error(`Deployment file not found: ${deploymentFile}`);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf-8"));
  const oracleAdapterAddress = deployment.contracts.oracleAdapter;
  
  console.log("OracleAdapter Address:", oracleAdapterAddress);
  console.log("");

  // Get contract instance
  const oracleAdapter = await ethers.getContractAt(
    "ChainlinkOracleAdapter",
    oracleAdapterAddress
  );

  // Select price feeds based on network
  const priceFeeds = network === "baseSepolia" 
    ? BASE_SEPOLIA_PRICE_FEEDS 
    : SEPOLIA_PRICE_FEEDS;

  // Test each price feed
  for (const [tokenName, { token, feed }] of Object.entries(priceFeeds)) {
    console.log(`\n--- Testing ${tokenName} Price Feed ---`);
    console.log(`Token Address: ${token}`);
    console.log(`Feed Address: ${feed}`);

    try {
      // Check if price feed is configured
      const configuredFeed = await oracleAdapter.priceFeeds(token);
      if (configuredFeed === ethers.ZeroAddress) {
        console.log(`⚠️  Price feed not configured for ${tokenName}`);
        console.log(`   Run: npx hardhat run scripts/setup-price-feeds.ts --network ${network}`);
        continue;
      }
      console.log(`✓ Price feed configured: ${configuredFeed}`);

      // Get staleness threshold
      const threshold = await oracleAdapter.staleThreshold(token);
      console.log(`✓ Staleness threshold: ${threshold.toString()} seconds`);

      // 1. Call getLatestPrice()
      console.log("\n1. Calling getLatestPrice()...");
      try {
        const [price, timestamp] = await oracleAdapter.getLatestPrice(token);
        const priceFormatted = ethers.formatUnits(price, 8); // Chainlink prices have 8 decimals
        const date = new Date(Number(timestamp) * 1000);
        console.log(`   ✓ Price: $${priceFormatted}`);
        console.log(`   ✓ Timestamp: ${timestamp.toString()} (${date.toISOString()})`);
      } catch (error: any) {
        console.error(`   ❌ Error: ${error.message}`);
        if (error.message.includes("Price data stale")) {
          console.error(`   Hint: Price data is older than staleness threshold`);
        }
      }

      // 2. Call getValidatedPrice()
      console.log("\n2. Calling getValidatedPrice()...");
      try {
        const [price, timestamp] = await oracleAdapter.getValidatedPrice(token);
        const priceFormatted = ethers.formatUnits(price, 8);
        const date = new Date(Number(timestamp) * 1000);
        console.log(`   ✓ Validated Price: $${priceFormatted}`);
        console.log(`   ✓ Timestamp: ${timestamp.toString()} (${date.toISOString()})`);
      } catch (error: any) {
        console.error(`   ❌ Error: ${error.message}`);
      }

    } catch (error: any) {
      console.error(`❌ Error testing ${tokenName}:`, error.message);
    }
  }

  // Test comparePrices if we have multiple tokens
  const tokenEntries = Object.entries(priceFeeds);
  if (tokenEntries.length >= 2) {
    console.log("\n--- Testing comparePrices() ---");
    const [tokenA, tokenB] = tokenEntries.slice(0, 2);
    const tokenAAddr = tokenA[1].token;
    const tokenBAddr = tokenB[1].token;
    
    try {
      console.log(`Comparing ${tokenA[0]} vs ${tokenB[0]}...`);
      const ratio = await oracleAdapter.comparePrices(tokenAAddr, tokenBAddr);
      const ratioFormatted = ethers.formatUnits(ratio, 18);
      console.log(`✓ Price Ratio: ${ratioFormatted}`);
      console.log(`  (${tokenA[0]} price / ${tokenB[0]} price)`);
    } catch (error: any) {
      console.error(`❌ Error comparing prices: ${error.message}`);
    }
  }

  console.log("\n=== Interaction Complete ===\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


