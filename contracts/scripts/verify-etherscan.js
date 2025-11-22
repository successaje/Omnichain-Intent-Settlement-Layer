const https = require("https");
const fs = require("fs");
const path = require("path");

/**
 * Direct Etherscan API verification
 * This bypasses Hardhat plugin issues
 */

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "GMEVNFUEFWI9ZT1KGJD8Q7ABQSJ3YDTMAK";
const NETWORK = process.argv[2] || "sepolia";

const ETHERSCAN_URLS = {
  sepolia: "https://api-sepolia.etherscan.io/api",
  mainnet: "https://api.etherscan.io/api",
  arbitrumSepolia: "https://api-sepolia.arbiscan.io/api",
  baseSepolia: "https://api-sepolia.basescan.org/api",
};

function getApiUrl(network) {
  return ETHERSCAN_URLS[network] || ETHERSCAN_URLS.sepolia;
}

function verifyContract(address, constructorArgs, contractName, sourceCode) {
  return new Promise((resolve, reject) => {
    const apiUrl = getApiUrl(NETWORK);
    const url = new URL(apiUrl);
    
    const postData = JSON.stringify({
      apikey: ETHERSCAN_API_KEY,
      module: "contract",
      action: "verifysourcecode",
      contractaddress: address,
      sourceCode: sourceCode,
      codeformat: "solidity-single-file",
      contractname: contractName,
      compilerversion: "v0.8.24+commit.e11b9ed9",
      optimizationUsed: "1",
      runs: "200",
      constructorArguements: constructorArgs,
    });

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const result = JSON.parse(data);
          if (result.status === "1") {
            resolve(result);
          } else {
            reject(new Error(result.message || "Verification failed"));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Etherscan API Verification for ${NETWORK.toUpperCase()}`);
  console.log(`${"=".repeat(60)}\n`);
  console.log("Note: This script requires manual source code upload.");
  console.log("For automated verification, use manual Etherscan UI method.\n");
  console.log("See VERIFICATION_README.md for detailed instructions.\n");
  
  const deploymentFile = `deployments/${NETWORK}.json`;
  if (!fs.existsSync(deploymentFile)) {
    console.error(`Deployment file not found: ${deploymentFile}`);
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));

  console.log("Contract addresses to verify:");
  console.log(`1. MockERC20: ${deployment.contracts.reputationToken}`);
  console.log(`2. AgentRegistry: ${deployment.contracts.agentRegistry}`);
  console.log(`3. PaymentEscrow: ${deployment.contracts.paymentEscrow}`);
  console.log(`4. IntentManager: ${deployment.contracts.intentManager}`);
  console.log(`5. ExecutionProxy: ${deployment.contracts.executionProxy}`);
  console.log(`6. ChainlinkOracleAdapter: ${deployment.contracts.oracleAdapter}`);
  console.log("\nConstructor arguments are in VERIFICATION_README.md");
  console.log("\nUse Etherscan UI for verification:");
  console.log(`https://sepolia.etherscan.io/address/${deployment.contracts.intentManager}#code`);
}

main().catch(console.error);

