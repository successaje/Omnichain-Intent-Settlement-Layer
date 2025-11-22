import hre from "hardhat";
import { ethers } from "hardhat";
import * as fs from "fs";

/**
 * Verify deployment by checking contract addresses and basic functionality
 */

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
  console.log(`Verifying deployment on ${network}`);
  console.log(`${"=".repeat(60)}\n`);
  
  // Verify IntentManager
  console.log("Verifying IntentManager...");
  const IntentManager = await ethers.getContractFactory("IntentManager");
  const intentManager = IntentManager.attach(deployment.contracts.intentManager);
  
  const currentChainId = await intentManager.currentChainId();
  const ccipRouter = await intentManager.ccipRouter();
  console.log(`  ✓ IntentManager deployed at: ${deployment.contracts.intentManager}`);
  console.log(`  ✓ Current Chain ID: ${currentChainId.toString()}`);
  console.log(`  ✓ CCIP Router: ${ccipRouter}`);
  
  // Verify AgentRegistry
  console.log("\nVerifying AgentRegistry...");
  const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
  const agentRegistry = AgentRegistry.attach(deployment.contracts.agentRegistry);
  
  const minStake = await agentRegistry.minStake();
  const registryChainId = await agentRegistry.currentChainId();
  console.log(`  ✓ AgentRegistry deployed at: ${deployment.contracts.agentRegistry}`);
  console.log(`  ✓ Minimum Stake: ${ethers.formatEther(minStake)} REP`);
  console.log(`  ✓ Chain ID: ${registryChainId.toString()}`);
  
  // Verify PaymentEscrow
  console.log("\nVerifying PaymentEscrow...");
  const PaymentEscrow = await ethers.getContractFactory("PaymentEscrow");
  const paymentEscrow = PaymentEscrow.attach(deployment.contracts.paymentEscrow);
  
  const owner = await paymentEscrow.owner();
  console.log(`  ✓ PaymentEscrow deployed at: ${deployment.contracts.paymentEscrow}`);
  console.log(`  ✓ Owner: ${owner}`);
  
  // Verify ExecutionProxy
  console.log("\nVerifying ExecutionProxy...");
  const ExecutionProxy = await ethers.getContractFactory("ExecutionProxy");
  const executionProxy = ExecutionProxy.attach(deployment.contracts.executionProxy);
  
  const intentManagerAddress = await executionProxy.intentManager();
  const paymentEscrowAddress = await executionProxy.paymentEscrow();
  console.log(`  ✓ ExecutionProxy deployed at: ${deployment.contracts.executionProxy}`);
  console.log(`  ✓ IntentManager: ${intentManagerAddress}`);
  console.log(`  ✓ PaymentEscrow: ${paymentEscrowAddress}`);
  
  // Test basic functionality
  console.log("\nTesting basic functionality...");
  
  // Test IntentManager - create intent
  const [deployer] = await ethers.getSigners();
  const intentSpec = "Test intent";
  const filecoinCid = ethers.id("test-cid");
  const deadline = Math.floor(Date.now() / 1000) + 86400;
  
  try {
    const createTx = await intentManager.connect(deployer).createIntent(
      intentSpec,
      filecoinCid,
      deadline,
      ethers.ZeroAddress,
      { value: ethers.parseEther("0.01") }
    );
    await createTx.wait();
    console.log("  ✓ Intent creation works");
    
    const intent = await intentManager.getIntent(0);
    console.log(`  ✓ Intent ID 0 created by: ${intent.user}`);
  } catch (error) {
    console.log(`  ✗ Intent creation failed: ${error}`);
  }
  
  console.log(`\n${"=".repeat(60)}`);
  console.log("Verification complete!");
  console.log(`${"=".repeat(60)}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

