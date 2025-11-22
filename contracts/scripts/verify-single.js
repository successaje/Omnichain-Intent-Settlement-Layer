const hre = require("hardhat");

/**
 * Verify a single contract
 * Usage: npx hardhat run scripts/verify-single.js --network sepolia
 * 
 * Or with arguments:
 * CONTRACT_ADDRESS=0x... CONTRACT_NAME=IntentManager npx hardhat run scripts/verify-single.js --network sepolia
 */

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const contractName = process.env.CONTRACT_NAME || "IntentManager";
  const network = hre.network.name;

  if (!contractAddress) {
    console.error("Error: CONTRACT_ADDRESS environment variable is required");
    console.error("Usage: CONTRACT_ADDRESS=0x... CONTRACT_NAME=IntentManager npx hardhat run scripts/verify-single.js --network sepolia");
    process.exit(1);
  }

  console.log(`\nVerifying ${contractName} on ${network}...`);
  console.log(`Address: ${contractAddress}\n`);

  // Load deployment file to get constructor arguments
  const fs = require("fs");
  const deploymentFile = `deployments/${network}.json`;

  let constructorArgs = [];

  if (fs.existsSync(deploymentFile)) {
    const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));

    // Get constructor arguments based on contract name
    switch (contractName) {
      case "MockERC20":
      case "ReputationToken":
        constructorArgs = ["Reputation Token", "REP"];
        break;
      case "AgentRegistry":
        constructorArgs = [
          deployment.contracts.reputationToken,
          deployment.configuration.minStake,
          deployment.deployer,
          deployment.chainId,
        ];
        break;
      case "PaymentEscrow":
        constructorArgs = [deployment.deployer];
        break;
      case "IntentManager":
        constructorArgs = [
          deployment.configuration.layerZeroEndpoint,
          deployment.configuration.ccipRouter,
          deployment.deployer,
          deployment.chainId,
        ];
        break;
      case "ExecutionProxy":
        constructorArgs = [
          deployment.configuration.layerZeroEndpoint,
          deployment.deployer,
          deployment.contracts.intentManager,
          deployment.contracts.paymentEscrow,
        ];
        break;
      case "ChainlinkOracleAdapter":
      case "OracleAdapter":
        constructorArgs = [deployment.deployer];
        break;
      default:
        console.log("⚠️  Contract name not recognized, trying without constructor arguments");
    }
  } else {
    console.log("⚠️  Deployment file not found, trying without constructor arguments");
  }

  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: constructorArgs,
    });
    console.log(`\n✓ ${contractName} verified successfully!`);
    console.log(`View on Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log(`\n✓ ${contractName} is already verified!`);
    } else {
      console.error(`\n✗ Verification failed: ${error.message}`);
      if (constructorArgs.length > 0) {
        console.log("\nConstructor arguments used:");
        console.log(JSON.stringify(constructorArgs, null, 2));
      }
      process.exit(1);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

