const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function verifyContract(name, address, constructorArgs, network) {
  try {
    console.log(`Verifying ${name}...`);
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: constructorArgs,
    });
    console.log(`✓ ${name} verified: ${address}\n`);
    return true;
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log(`✓ ${name} already verified\n`);
      return true;
    } else {
      console.log(`✗ ${name} verification failed: ${error.message}\n`);
      return false;
    }
  }
}

async function main() {
  const networks = ["sepolia", "arbitrumSepolia", "optimismSepolia", "baseSepolia"];

  for (const network of networks) {
    const deploymentFile = `deployments/${network}.json`;

    if (!fs.existsSync(deploymentFile)) {
      console.log(`\n⚠️  Skipping ${network} - deployment file not found\n`);
      continue;
    }

    const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));

    console.log(`\n${"=".repeat(60)}`);
    console.log(`Verifying contracts on ${network.toUpperCase()}`);
    console.log(`${"=".repeat(60)}\n`);

    // Switch network context
    hre.config.networks[network];

    // Verify all contracts
    await verifyContract(
      "MockERC20",
      deployment.contracts.reputationToken,
      ["Reputation Token", "REP"],
      network
    );

    await verifyContract(
      "AgentRegistry",
      deployment.contracts.agentRegistry,
      [
        deployment.contracts.reputationToken,
        deployment.configuration.minStake,
        deployment.deployer,
        deployment.chainId,
      ],
      network
    );

    await verifyContract(
      "PaymentEscrow",
      deployment.contracts.paymentEscrow,
      [deployment.deployer],
      network
    );

    await verifyContract(
      "IntentManager",
      deployment.contracts.intentManager,
      [
        deployment.configuration.layerZeroEndpoint,
        deployment.configuration.ccipRouter,
        deployment.deployer,
        deployment.chainId,
      ],
      network
    );

    await verifyContract(
      "ExecutionProxy",
      deployment.contracts.executionProxy,
      [
        deployment.configuration.layerZeroEndpoint,
        deployment.deployer,
        deployment.contracts.intentManager,
        deployment.contracts.paymentEscrow,
      ],
      network
    );

    await verifyContract(
      "ChainlinkOracleAdapter",
      deployment.contracts.oracleAdapter,
      [deployment.deployer],
      network
    );

    console.log(`✓ ${network} verification complete!\n`);
  }

  console.log(`${"=".repeat(60)}`);
  console.log("All verifications complete!");
  console.log(`${"=".repeat(60)}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

