'use client';

import { useState } from 'react';
import { useAccount, useChainId, useContractWrite, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { getContractAddress } from '@/src/config/contracts';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { getExplorerUrl, formatTxHash } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';

// Simple ABI for createIntent
const CREATE_INTENT_ABI = [
  {
    name: "createIntent",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "_intentSpec", type: "string" },
      { name: "_filecoinCid", type: "bytes32" },
      { name: "_deadline", type: "uint256" },
      { name: "_token", type: "address" },
      { name: "_amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

// Simple test intents
const SIMPLE_INTENTS = [
  {
    id: 1,
    spec: "Get best yield for 0.01 ETH",
    amount: "0.01",
    description: "Minimal yield intent",
  },
  {
    id: 2,
    spec: "Find best stablecoin yield",
    amount: "0.01",
    description: "Simple stablecoin yield",
  },
  {
    id: 3,
    spec: "Swap 0.01 ETH to USDC",
    amount: "0.01",
    description: "Simple token swap",
  },
];

export default function TestIntentPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [selectedIntent, setSelectedIntent] = useState<number | null>(null);
  const [intentResult, setIntentResult] = useState<{ success: boolean; hash?: string; error?: string } | null>(null);

  const intentManagerAddress = getContractAddress(chainId, "intentManager");
  
  // Validate address - must be a valid non-zero address
  const isValidAddress = intentManagerAddress && 
    intentManagerAddress !== "0x0000000000000000000000000000000000000000" &&
    intentManagerAddress.startsWith("0x") &&
    intentManagerAddress.length === 42;
  
  const contractAddress = isValidAddress ? (intentManagerAddress as `0x${string}`) : undefined;

  const {
    write: createIntentWrite,
    writeAsync: createIntentWriteAsync,
    data: txData,
    isLoading: isWriting,
    error: writeError,
  } = useContractWrite({
    address: contractAddress,
    abi: CREATE_INTENT_ABI,
    functionName: "createIntent",
  });

  const {
    isLoading: isWaiting,
    isSuccess: isTxSuccess,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash: txData?.hash,
  });

  const handleCreateIntent = async (intent: typeof SIMPLE_INTENTS[0]) => {
    if (!isConnected || !address) {
      setIntentResult({ success: false, error: "Wallet not connected" });
      return;
    }

    if (!contractAddress) {
      const networkName = chainId === 11155111 ? "Sepolia" : chainId === 84532 ? "Base Sepolia" : `Chain ${chainId}`;
      setIntentResult({ success: false, error: `IntentManager not deployed on ${networkName} (Chain ID: ${chainId}). Please switch to Sepolia (11155111) or Base Sepolia (84532).` });
      return;
    }

    try {
      setSelectedIntent(intent.id);
      setIntentResult(null);

      // Calculate deadline (24 hours from now)
      const deadline = Math.floor(Date.now() / 1000) + 86400;
      
      // Prepare parameters
      const filecoinCid = `0x${"0".repeat(64)}` as `0x${string}`; // Zero bytes32
      const token = "0x0000000000000000000000000000000000000000" as `0x${string}`; // Native ETH
      const amount = parseEther(intent.amount);
      const value = amount; // For native ETH, value = amount

      // Call contract
      if (!createIntentWriteAsync) {
        throw new Error("Contract write function not available. Please check your wallet connection.");
      }

      if (!createIntentWriteAsync) {
        throw new Error("Contract write function not available. Please check your wallet connection and network.");
      }

      const hash = await createIntentWriteAsync({
        args: [intent.spec, filecoinCid, BigInt(deadline), token, 0n], // amount = 0 for native ETH (value is sent via msg.value)
        value: value,
      });

      setIntentResult({ success: true, hash });
    } catch (error: any) {
      console.error("Error creating intent:", error);
      setIntentResult({ 
        success: false, 
        error: error.message || "Failed to create intent" 
      });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] antialiased">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            Test Simple Intents
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            These are simple, tested intents that will work with the current contract setup.
          </p>

          {/* Connection Status */}
          <Card className="mb-8 border-2 border-gray-200 dark:border-gray-700">
            <CardHeader className="border-b-2 border-gray-200 dark:border-gray-700">
              <CardTitle>Connection Status</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Wallet:</span>
                  <span className={isConnected ? "text-green-600 dark:text-green-400 font-medium" : "text-red-600 dark:text-red-400"}>
                    {isConnected ? `Connected (${address?.slice(0, 6)}...${address?.slice(-4)})` : "Not Connected"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Network:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {chainId === 11155111 ? "Sepolia" : chainId === 84532 ? "Base Sepolia" : `Chain ${chainId}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">IntentManager:</span>
                  <span className={`font-mono text-xs ${
                    contractAddress ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  }`}>
                    {contractAddress 
                      ? `${contractAddress.slice(0, 6)}...${contractAddress.slice(-4)}` 
                      : "Not Available"}
                  </span>
                </div>
                {!contractAddress && (
                  <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs text-yellow-800 dark:text-yellow-200">
                    ⚠️ Switch to Sepolia (11155111) or Base Sepolia (84532) to use IntentManager
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Simple Intents */}
          <div className="space-y-4 mb-8">
            {SIMPLE_INTENTS.map((intent) => (
              <Card key={intent.id} className="border-2 border-gray-200 dark:border-gray-700">
                <CardHeader className="border-b-2 border-gray-200 dark:border-gray-700">
                  <CardTitle>{intent.description}</CardTitle>
                  <CardDescription>{intent.spec}</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Amount: {intent.amount} ETH</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Deadline: 24 hours</p>
                    </div>
                    <Button
                      onClick={() => handleCreateIntent(intent)}
                      disabled={!isConnected || isWriting || isWaiting || selectedIntent === intent.id}
                      className="bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      {selectedIntent === intent.id && (isWriting || isWaiting) ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isWriting ? "Creating..." : "Waiting..."}
                        </>
                      ) : (
                        "Create Intent"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Results */}
          {intentResult && (
            <Card className={`border-2 ${
              intentResult.success 
                ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20" 
                : "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
            }`}>
              <CardContent className="pt-6">
                {intentResult.success ? (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">
                        Intent Created Successfully!
                      </h3>
                    </div>
                    {intentResult.hash && (
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-mono text-gray-900 dark:text-gray-100">
                          {formatTxHash(intentResult.hash)}
                        </p>
                        <a
                          href={getExplorerUrl(chainId, intentResult.hash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
                        Error Creating Intent
                      </h3>
                    </div>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {intentResult.error}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Transaction Status */}
          {isTxSuccess && receipt && (
            <Card className="mt-4 border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">
                    Transaction Confirmed!
                  </h3>
                </div>
                {txData?.hash && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-mono text-gray-900 dark:text-gray-100">
                      {formatTxHash(txData.hash)}
                    </p>
                    <a
                      href={getExplorerUrl(chainId, txData.hash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {writeError && (
            <Card className="mt-4 border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
                    Transaction Error
                  </h3>
                </div>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {writeError.message}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

