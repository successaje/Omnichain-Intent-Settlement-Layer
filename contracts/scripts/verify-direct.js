const hre = require("hardhat");
const fs = require("fs");
const { execSync } = require("child_process");

/**
 * Direct verification using hardhat verify command via exec
 * This bypasses the plugin loading issue
 */

async function verifyContract(address, constructorArgs, contractName) {
  const network = hre.network.name;
  const args = constructorArgs.map(arg => `"${arg}"`).join(" ");
  
  console.log(`Verifying ${contractName} at ${address}...`);
  
  try {
    const command = `npx hardhat verify --network ${network} ${address} ${args}`;
    console.log(`Running: ${command}`);
    const output = execSync(command, { encoding: "utf-8", stdio: "pipe" });
    console.log(output);
    console.log(`✓ ${contractName} verified!\n`);
    return true;
  } catch (error) {
    const errorOutput = error.stdout || error.stderr || error.message;
    if (errorOutput.includes("Already Verified") || errorOutput.includes("already verified")) {
      console.log(`✓ ${contractName} already verified\n`);
      return true;
    } else {
      console.log(`✗ ${contractName} verification failed: ${errorOutput}\n`);
      return false;
    }
  }
}

async function main() {
  const network = hre.network.name;
  const deploymentFile = `deployments/${network}.json`;

  if (!fs.existsSync(deploymentFile)) {
    console.error(`Deployment file not found: ${deploymentFile}`);
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));

  console.log(`\n${"=".repeat(60)}`);
  console.log(`Verifying contracts on ${network.toUpperCase()}`);
  console.log(`${"=".repeat(60)}\n`);

  // Verify all contracts
  await verifyContract(
    deployment.contracts.reputationToken,
    ["Reputation Token", "REP"],
    "MockERC20"
  );

  await verifyContract(
    deployment.contracts.agentRegistry,
    [
      deployment.contracts.reputationToken,
      deployment.configuration.minStake,
      deployment.deployer,
      deployment.chainId,
    ],
    "AgentRegistry"
  );

  await verifyContract(
    deployment.contracts.paymentEscrow,
    [deployment.deployer],
    "PaymentEscrow"
  );

  await verifyContract(
    deployment.contracts.intentManager,
    [
      deployment.configuration.layerZeroEndpoint,
      deployment.configuration.ccipRouter,
      deployment.deployer,
      deployment.chainId,
    ],
    "IntentManager"
  );

  await verifyContract(
    deployment.contracts.executionProxy,
    [
      deployment.configuration.layerZeroEndpoint,
      deployment.deployer,
      deployment.contracts.intentManager,
      deployment.contracts.paymentEscrow,
    ],
    "ExecutionProxy"
  );

  await verifyContract(
    deployment.contracts.oracleAdapter,
    [deployment.deployer],
    "ChainlinkOracleAdapter"
  );

  console.log(`${"=".repeat(60)}`);
  console.log("Verification complete!");
  console.log(`${"=".repeat(60)}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

