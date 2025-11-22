import hre from "hardhat";
import * as fs from "fs";

async function main() {
  const network = hre.network.name;
  const deploymentFile = `deployments/${network}.json`;
  
  if (!fs.existsSync(deploymentFile)) {
    console.error(`Deployment file not found: ${deploymentFile}`);
    console.error("Please deploy contracts first using deploy.ts");
    process.exit(1);
  }
  
  const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Verifying contracts on ${network.toUpperCase()}`);
  console.log(`${"=".repeat(60)}\n`);
  
  const { ethers } = await import("ethers");
  const provider = new ethers.JsonRpcProvider(hre.config.networks[network]?.url);
  
  // Get contract factories to read artifacts
  const getContractFactory = async (name: string) => {
    const artifact = await hre.artifacts.readArtifact(name);
    return artifact;
  };
  
  try {
    // Verify MockERC20
    console.log("Verifying MockERC20...");
    const mockERC20Artifact = await getContractFactory("MockERC20");
    await hre.run("verify:verify", {
      address: deployment.contracts.reputationToken,
      constructorArguments: ["Reputation Token", "REP"],
    });
    console.log(`✓ MockERC20 verified: ${deployment.contracts.reputationToken}\n`);
  } catch (error: any) {
    console.log(`✗ MockERC20 verification failed: ${error.message}\n`);
  }
  
  try {
    // Verify AgentRegistry
    console.log("Verifying AgentRegistry...");
    const minStake = deployment.configuration.minStake;
    await hre.run("verify:verify", {
      address: deployment.contracts.agentRegistry,
      constructorArguments: [
        deployment.contracts.reputationToken,
        minStake,
        deployment.deployer,
        deployment.chainId,
      ],
    });
    console.log(`✓ AgentRegistry verified: ${deployment.contracts.agentRegistry}\n`);
  } catch (error: any) {
    console.log(`✗ AgentRegistry verification failed: ${error.message}\n`);
  }
  
  try {
    // Verify PaymentEscrow
    console.log("Verifying PaymentEscrow...");
    await hre.run("verify:verify", {
      address: deployment.contracts.paymentEscrow,
      constructorArguments: [deployment.deployer],
    });
    console.log(`✓ PaymentEscrow verified: ${deployment.contracts.paymentEscrow}\n`);
  } catch (error: any) {
    console.log(`✗ PaymentEscrow verification failed: ${error.message}\n`);
  }
  
  try {
    // Verify IntentManager
    console.log("Verifying IntentManager...");
    await hre.run("verify:verify", {
      address: deployment.contracts.intentManager,
      constructorArguments: [
        deployment.configuration.layerZeroEndpoint,
        deployment.configuration.ccipRouter,
        deployment.deployer,
        deployment.chainId,
      ],
    });
    console.log(`✓ IntentManager verified: ${deployment.contracts.intentManager}\n`);
  } catch (error: any) {
    console.log(`✗ IntentManager verification failed: ${error.message}\n`);
  }
  
  try {
    // Verify ExecutionProxy
    console.log("Verifying ExecutionProxy...");
    await hre.run("verify:verify", {
      address: deployment.contracts.executionProxy,
      constructorArguments: [
        deployment.configuration.layerZeroEndpoint,
        deployment.deployer,
        deployment.contracts.intentManager,
        deployment.contracts.paymentEscrow,
      ],
    });
    console.log(`✓ ExecutionProxy verified: ${deployment.contracts.executionProxy}\n`);
  } catch (error: any) {
    console.log(`✗ ExecutionProxy verification failed: ${error.message}\n`);
  }
  
  try {
    // Verify ChainlinkOracleAdapter
    console.log("Verifying ChainlinkOracleAdapter...");
    await hre.run("verify:verify", {
      address: deployment.contracts.oracleAdapter,
      constructorArguments: [deployment.deployer],
    });
    console.log(`✓ ChainlinkOracleAdapter verified: ${deployment.contracts.oracleAdapter}\n`);
  } catch (error: any) {
    console.log(`✗ ChainlinkOracleAdapter verification failed: ${error.message}\n`);
  }
  
  console.log(`${"=".repeat(60)}`);
  console.log("Verification complete!");
  console.log(`${"=".repeat(60)}\n`);
  
  console.log("View contracts on Etherscan:");
  console.log(`IntentManager: https://sepolia.etherscan.io/address/${deployment.contracts.intentManager}`);
  console.log(`AgentRegistry: https://sepolia.etherscan.io/address/${deployment.contracts.agentRegistry}`);
  console.log(`PaymentEscrow: https://sepolia.etherscan.io/address/${deployment.contracts.paymentEscrow}`);
  console.log(`ExecutionProxy: https://sepolia.etherscan.io/address/${deployment.contracts.executionProxy}`);
  console.log(`ChainlinkOracleAdapter: https://sepolia.etherscan.io/address/${deployment.contracts.oracleAdapter}`);
  console.log(`ReputationToken: https://sepolia.etherscan.io/address/${deployment.contracts.reputationToken}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

