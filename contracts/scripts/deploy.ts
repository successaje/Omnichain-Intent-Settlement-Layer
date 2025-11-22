import { ethers } from 'ethers';
import hre from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with account:', deployer.address);
  console.log('Account balance:', (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy MockEndpoint for local testing
  // In production, use actual LayerZero endpoint address
  console.log('\nDeploying MockEndpoint...');
  const MockEndpoint = await ethers.getContractFactory('MockEndpoint');
  const mockEndpoint = await MockEndpoint.deploy();
  await mockEndpoint.waitForDeployment();
  const mockEndpointAddress = await mockEndpoint.getAddress();
  console.log('MockEndpoint deployed to:', mockEndpointAddress);

  // Deploy MockERC20 for reputation token
  console.log('\nDeploying MockERC20 (Reputation Token)...');
  const MockERC20 = await ethers.getContractFactory('MockERC20');
  const reputationToken = await MockERC20.deploy('Reputation Token', 'REP');
  await reputationToken.waitForDeployment();
  const reputationTokenAddress = await reputationToken.getAddress();
  console.log('Reputation Token deployed to:', reputationTokenAddress);

  // Deploy AgentRegistry
  console.log('\nDeploying AgentRegistry...');
  const AgentRegistry = await ethers.getContractFactory('AgentRegistry');
  const agentRegistry = await AgentRegistry.deploy(
    reputationTokenAddress,
    ethers.parseEther('1'), // minStake
    deployer.address // owner
  );
  await agentRegistry.waitForDeployment();
  const agentRegistryAddress = await agentRegistry.getAddress();
  console.log('AgentRegistry deployed to:', agentRegistryAddress);

  // Deploy PaymentEscrow
  console.log('\nDeploying PaymentEscrow...');
  const PaymentEscrow = await ethers.getContractFactory('PaymentEscrow');
  const paymentEscrow = await PaymentEscrow.deploy();
  await paymentEscrow.waitForDeployment();
  const paymentEscrowAddress = await paymentEscrow.getAddress();
  console.log('PaymentEscrow deployed to:', paymentEscrowAddress);

  // Deploy IntentManager
  console.log('\nDeploying IntentManager...');
  const IntentManager = await ethers.getContractFactory('IntentManager');
  const intentManager = await IntentManager.deploy(
    mockEndpointAddress, // endpoint
    deployer.address // owner
  );
  await intentManager.waitForDeployment();
  const intentManagerAddress = await intentManager.getAddress();
  console.log('IntentManager deployed to:', intentManagerAddress);

  // Deploy ChainlinkOracleAdapter
  console.log('\nDeploying ChainlinkOracleAdapter...');
  const ChainlinkOracleAdapter = await ethers.getContractFactory('ChainlinkOracleAdapter');
  const oracleAdapter = await ChainlinkOracleAdapter.deploy(deployer.address);
  await oracleAdapter.waitForDeployment();
  const oracleAdapterAddress = await oracleAdapter.getAddress();
  console.log('ChainlinkOracleAdapter deployed to:', oracleAdapterAddress);

  // Deploy ExecutionProxy (requires OFT token)
  // For demo, we'll skip this as it requires an OFT token contract

  console.log('\n=== Deployment Summary ===');
  console.log('MockEndpoint:', mockEndpointAddress);
  console.log('Reputation Token:', reputationTokenAddress);
  console.log('AgentRegistry:', agentRegistryAddress);
  console.log('PaymentEscrow:', paymentEscrowAddress);
  console.log('IntentManager:', intentManagerAddress);
  console.log('ChainlinkOracleAdapter:', oracleAdapterAddress);

  // Save addresses to file for frontend/backend
  const addresses = {
    mockEndpoint: mockEndpointAddress,
    reputationToken: reputationTokenAddress,
    agentRegistry: agentRegistryAddress,
    paymentEscrow: paymentEscrowAddress,
    intentManager: intentManagerAddress,
    chainlinkOracleAdapter: oracleAdapterAddress,
    network: hre.network.name,
  };

  const fs = await import('fs');
  fs.writeFileSync(
    '../backend/.contract-addresses.json',
    JSON.stringify(addresses, null, 2)
  );
  console.log('\nContract addresses saved to backend/.contract-addresses.json');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

