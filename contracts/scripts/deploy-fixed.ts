import hre from "hardhat";
import * as fs from "fs";

// Get ethers from hre after it's initialized
async function main() {
  // Access ethers through hre
  const ethers = hre.ethers;
  
  if (!ethers) {
    throw new Error("ethers is not available. Make sure Hardhat is properly initialized.");
  }
  
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());
  console.log("Network:", hre.network.name);
  
  // LayerZero and CCIP addresses
  const LAYERZERO_ENDPOINT = "0x6EDCE65403992e310A62460808c4b910D972f10f";
  const CCIP_ROUTER = "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59";
  const CHAIN_ID = 11155111n;
  
  console.log("\n=== Configuration ===");
  console.log("LayerZero Endpoint:", LAYERZERO_ENDPOINT);
  console.log("CCIP Router:", CCIP_ROUTER);
  console.log("Chain ID:", CHAIN_ID.toString());
  
  // Deploy contracts
  console.log("\n=== Deploying MockERC20 (Reputation Token) ===");
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const reputationToken = await MockERC20.deploy("Reputation Token", "REP");
  await reputationToken.waitForDeployment();
  const repTokenAddr = await reputationToken.getAddress();
  console.log("Reputation Token:", repTokenAddr);
  
  console.log("\n=== Deploying AgentRegistry ===");
  const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
  const minStake = ethers.parseEther("1");
  const agentRegistry = await AgentRegistry.deploy(repTokenAddr, minStake, deployer.address, CHAIN_ID);
  await agentRegistry.waitForDeployment();
  const agentRegAddr = await agentRegistry.getAddress();
  console.log("AgentRegistry:", agentRegAddr);
  
  console.log("\n=== Deploying PaymentEscrow ===");
  const PaymentEscrow = await ethers.getContractFactory("PaymentEscrow");
  const paymentEscrow = await PaymentEscrow.deploy(deployer.address);
  await paymentEscrow.waitForDeployment();
  const escrowAddr = await paymentEscrow.getAddress();
  console.log("PaymentEscrow:", escrowAddr);
  
  console.log("\n=== Deploying IntentManager ===");
  const IntentManager = await ethers.getContractFactory("IntentManager");
  const intentManager = await IntentManager.deploy(LAYERZERO_ENDPOINT, CCIP_ROUTER, deployer.address, CHAIN_ID);
  await intentManager.waitForDeployment();
  const intentMgrAddr = await intentManager.getAddress();
  console.log("IntentManager:", intentMgrAddr);
  
  console.log("\n=== Deploying ExecutionProxy ===");
  const ExecutionProxy = await ethers.getContractFactory("ExecutionProxy");
  const executionProxy = await ExecutionProxy.deploy(LAYERZERO_ENDPOINT, deployer.address, intentMgrAddr, escrowAddr);
  await executionProxy.waitForDeployment();
  const execProxyAddr = await executionProxy.getAddress();
  console.log("ExecutionProxy:", execProxyAddr);
  
  console.log("\n=== Deploying ChainlinkOracleAdapter ===");
  const ChainlinkOracleAdapter = await ethers.getContractFactory("ChainlinkOracleAdapter");
  const oracleAdapter = await ChainlinkOracleAdapter.deploy(deployer.address);
  await oracleAdapter.waitForDeployment();
  const oracleAddr = await oracleAdapter.getAddress();
  console.log("ChainlinkOracleAdapter:", oracleAddr);
  
  // Setup relationships
  console.log("\n=== Setting up relationships ===");
  await paymentEscrow.addAuthorizedReleaser(intentMgrAddr);
  await paymentEscrow.addAuthorizedReleaser(execProxyAddr);
  console.log("✓ Authorized releasers set");
  
  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: CHAIN_ID.toString(),
    deployer: deployer.address,
    contracts: {
      reputationToken: repTokenAddr,
      agentRegistry: agentRegAddr,
      paymentEscrow: escrowAddr,
      intentManager: intentMgrAddr,
      executionProxy: execProxyAddr,
      oracleAdapter: oracleAddr,
    },
    timestamp: new Date().toISOString(),
  };
  
  fs.mkdirSync("deployments", { recursive: true });
  fs.writeFileSync(`deployments/${hre.network.name}.json`, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n✓ Deployment saved to deployments/${hre.network.name}.json`);
  
  console.log("\n=== Deployment Complete ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
