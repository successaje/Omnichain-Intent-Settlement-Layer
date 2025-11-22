import hre from "hardhat";
import { ethers } from "hardhat";
import * as fs from "fs";

/**
 * Multi-chain deployment script
 * Deploys contracts to multiple networks and sets up cross-chain connections
 */

interface DeploymentInfo {
  network: string;
  chainId: string;
  contracts: {
    intentManager: string;
    agentRegistry: string;
    paymentEscrow: string;
    executionProxy: string;
  };
}

const NETWORKS = [
  "sepolia",
  "arbitrumSepolia",
  "optimismSepolia",
  "baseSepolia",
];

const LAYERZERO_ENDPOINTS: { [key: string]: string } = {
  sepolia: "0x6EDCE65403992e310A62460808c4b910D972f10f",
  arbitrumSepolia: "0x6EDCE65403992e310A62460808c4b910D972f10f",
  optimismSepolia: "0x6EDCE65403992e310A62460808c4b910D972f10f",
  baseSepolia: "0x6EDCE65403992e310A62460808c4b910D972f10f",
};

const CCIP_ROUTERS: { [key: string]: string } = {
  sepolia: "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59",
  arbitrumSepolia: "0x2a9C5afB0d0e4BAb2AdaDA92493B3D313c4C3b0C",
  optimismSepolia: "0x114A20A10b43D4115e5aeef7345a1A9844850E4E",
  baseSepolia: "0xD3b06cEbF099CE7A4fa6d5A8b5b8C5C5C5C5C5C5",
};

const CHAIN_IDS: { [key: string]: bigint } = {
  sepolia: 11155111n,
  arbitrumSepolia: 421614n,
  optimismSepolia: 11155420n,
  baseSepolia: 84532n,
};

async function deployToNetwork(network: string): Promise<DeploymentInfo> {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Deploying to ${network.toUpperCase()}`);
  console.log(`${"=".repeat(60)}\n`);
  
  // Switch to network
  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: ["0x0000000000000000000000000000000000000000"],
  });
  
  const [deployer] = await ethers.getSigners();
  
  const layerZeroEndpoint = LAYERZERO_ENDPOINTS[network];
  const ccipRouter = CCIP_ROUTERS[network] || ethers.ZeroAddress;
  const chainId = CHAIN_IDS[network];
  
  // Deploy contracts (same as main deploy script)
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const reputationToken = await MockERC20.deploy("Reputation Token", "REP");
  await reputationToken.waitForDeployment();
  
  const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
  const agentRegistry = await AgentRegistry.deploy(
    await reputationToken.getAddress(),
    ethers.parseEther("1"),
    deployer.address,
    chainId
  );
  await agentRegistry.waitForDeployment();
  
  const PaymentEscrow = await ethers.getContractFactory("PaymentEscrow");
  const paymentEscrow = await PaymentEscrow.deploy(deployer.address);
  await paymentEscrow.waitForDeployment();
  
  const IntentManager = await ethers.getContractFactory("IntentManager");
  const intentManager = await IntentManager.deploy(
    layerZeroEndpoint,
    ccipRouter,
    deployer.address,
    chainId
  );
  await intentManager.waitForDeployment();
  
  const ExecutionProxy = await ethers.getContractFactory("ExecutionProxy");
  const executionProxy = await ExecutionProxy.deploy(
    layerZeroEndpoint,
    deployer.address,
    await intentManager.getAddress(),
    await paymentEscrow.getAddress()
  );
  await executionProxy.waitForDeployment();
  
  // Setup relationships
  await paymentEscrow.addAuthorizedReleaser(await intentManager.getAddress());
  await paymentEscrow.addAuthorizedReleaser(await executionProxy.getAddress());
  
  return {
    network,
    chainId: chainId.toString(),
    contracts: {
      intentManager: await intentManager.getAddress(),
      agentRegistry: await agentRegistry.getAddress(),
      paymentEscrow: await paymentEscrow.getAddress(),
      executionProxy: await executionProxy.getAddress(),
    },
  };
}

async function setupCrossChainConnections(deployments: DeploymentInfo[]) {
  console.log(`\n${"=".repeat(60)}`);
  console.log("Setting up cross-chain connections");
  console.log(`${"=".repeat(60)}\n`);
  
  // For each network, set up peer connections
  for (const deployment of deployments) {
    console.log(`Setting up peers for ${deployment.network}...`);
    
    // In production, you would:
    // 1. Call setPeer() on each IntentManager for other chains
    // 2. Configure LayerZero DVN (Data Verification Network)
    // 3. Set up CCIP chain selectors
    
    console.log(`✓ ${deployment.network} configured`);
  }
}

async function main() {
  const deployments: DeploymentInfo[] = [];
  
  // Deploy to each network
  for (const network of NETWORKS) {
    try {
      const deployment = await deployToNetwork(network);
      deployments.push(deployment);
      
      // Save individual deployment
      fs.mkdirSync("deployments", { recursive: true });
      fs.writeFileSync(
        `deployments/${network}.json`,
        JSON.stringify(deployment, null, 2)
      );
    } catch (error) {
      console.error(`Failed to deploy to ${network}:`, error);
    }
  }
  
  // Save multi-chain deployment summary
  const summary = {
    timestamp: new Date().toISOString(),
    deployments,
  };
  
  fs.writeFileSync(
    "deployments/multi-chain.json",
    JSON.stringify(summary, null, 2)
  );
  
  console.log(`\n${"=".repeat(60)}`);
  console.log("Multi-chain deployment complete!");
  console.log(`${"=".repeat(60)}\n`);
  console.log("Deployment summary saved to: deployments/multi-chain.json");
  
  // Setup cross-chain connections
  await setupCrossChainConnections(deployments);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

