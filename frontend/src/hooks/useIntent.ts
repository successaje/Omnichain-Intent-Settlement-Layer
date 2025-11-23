"use client";

import { useAccount, useChainId, useContractWrite, useContractRead, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther } from "viem";
import { getContractAddress } from "@/src/config/contracts";
import { parseIntentWithLlama } from "@/src/lib/ollama";

/**
 * IntentManager ABI (minimal for createIntent)
 */
const INTENT_MANAGER_ABI = [
  {
    name: "createIntent",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "_intentSpec", type: "string" },
      { name: "_filecoinCid", type: "bytes32" },
      { name: "_deadline", type: "uint256" },
      { name: "_token", type: "address" },
    ],
    outputs: [],
  },
  {
    name: "intents",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "_intentId", type: "uint256" }],
    outputs: [
      { name: "intentId", type: "uint256" },
      { name: "user", type: "address" },
      { name: "intentSpec", type: "string" },
      { name: "amount", type: "uint256" },
      { name: "token", type: "address" },
      { name: "status", type: "uint8" },
      { name: "deadline", type: "uint256" },
      { name: "selectedAgentId", type: "uint256" },
      { name: "filecoinCid", type: "bytes32" },
      { name: "createdAt", type: "uint256" },
      { name: "executedAt", type: "uint256" },
    ],
  },
  {
    name: "nextIntentId",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "getUserIntents",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "_user", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  {
    name: "IntentCreated",
    type: "event",
    inputs: [
      { name: "intentId", type: "uint256", indexed: true },
      { name: "user", type: "address", indexed: true },
      { name: "intentSpec", type: "string", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
      { name: "filecoinCid", type: "bytes32", indexed: false },
    ],
  },
] as const;

export interface CreateIntentParams {
  intentSpec: string;
  amount?: string; // Amount in ETH (will be converted to wei)
  token?: string; // Token address (0x0 for native ETH)
  deadline?: number; // Unix timestamp
  filecoinCid?: string; // IPFS/Filecoin CID (optional)
}

export interface Intent {
  intentId: bigint;
  user: string;
  intentSpec: string;
  amount: bigint;
  token: string;
  status: number;
  deadline: bigint;
  selectedAgentId: bigint;
  filecoinCid: string;
  createdAt: bigint;
  executedAt: bigint;
}

/**
 * Hook for interacting with IntentManager contract
 */
export function useIntent() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  
  const intentManagerAddress = getContractAddress(chainId, "intentManager");

  // Get next intent ID (to track new intents)
  const { data: nextIntentId } = useContractRead({
    address: intentManagerAddress as `0x${string}`,
    abi: INTENT_MANAGER_ABI,
    functionName: "nextIntentId",
    enabled: isConnected,
  });

  // Get user's intents
  const { data: userIntentIds, refetch: refetchUserIntents } = useContractRead({
    address: intentManagerAddress as `0x${string}`,
    abi: INTENT_MANAGER_ABI,
    functionName: "getUserIntents",
    args: address ? [address] : undefined,
    enabled: isConnected && !!address,
  });

  // Create intent function
  const {
    write: createIntentWrite,
    writeAsync: createIntentWriteAsync,
    data: createIntentData,
    isLoading: isCreating,
    error: createError,
  } = useContractWrite({
    address: intentManagerAddress as `0x${string}`,
    abi: INTENT_MANAGER_ABI,
    functionName: "createIntent",
  });

  // Wait for transaction
  const {
    isLoading: isWaiting,
    isSuccess: isCreateSuccess,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash: createIntentData?.hash,
  });

  /**
   * Create a new intent
   */
  const createIntent = async (params: CreateIntentParams) => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected");
    }

    if (!intentManagerAddress || intentManagerAddress === "0x0000000000000000000000000000000000000000") {
      throw new Error("Intent manager contract not deployed on this network. Please switch networks.");
    }

    // Parse intent with Llama 3.2
    let parsedIntent;
    try {
      parsedIntent = await parseIntentWithLlama(params.intentSpec);
    } catch (error) {
      console.warn("Failed to parse intent with Llama, using raw text:", error);
      parsedIntent = {
        objective: params.intentSpec,
        constraints: [],
        riskProfile: "Medium" as const,
        chainsAllowed: [],
        assetsAllowed: [],
      };
    }

    // Prepare parameters
    const filecoinCid = params.filecoinCid 
      ? `0x${params.filecoinCid.replace(/^0x/, "")}` as `0x${string}`
      : `0x${"0".repeat(64)}` as `0x${string}`; // Zero bytes32 if not provided

    const deadline = params.deadline || Math.floor(Date.now() / 1000) + 86400; // Default: 24 hours
    const token = (params.token || "0x0000000000000000000000000000000000000000") as `0x${string}`;
    
    // Calculate value (amount in wei)
    // Extract numeric value from amount string (e.g., "$1000 USDC" -> "1000")
    let amountValue = "0.01"; // Default
    if (params.amount) {
      // Remove currency symbols, commas, and extract number
      const numericMatch = params.amount.replace(/[$,]/g, '').match(/(\d+\.?\d*)/);
      if (numericMatch) {
        amountValue = numericMatch[1];
      }
    }
    const value = parseEther(amountValue);

    // Call contract - use writeAsync for better error handling
    if (!createIntentWriteAsync && !createIntentWrite) {
      throw new Error("Contract write function not available. Please ensure your wallet is connected and you're on the correct network.");
    }

    // Prefer writeAsync for async/await pattern
    if (createIntentWriteAsync) {
      await createIntentWriteAsync({
        args: [params.intentSpec, filecoinCid, BigInt(deadline), token],
        value: value,
      });
    } else if (createIntentWrite) {
      // Fallback to synchronous write
      createIntentWrite({
        args: [params.intentSpec, filecoinCid, BigInt(deadline), token],
        value: value,
      });
    }
  };

  /**
   * Get intent details
   */
  const getIntent = async (intentId: bigint): Promise<Intent | null> => {
    // This would need to be implemented with a contract read
    // For now, return null
    return null;
  };

  return {
    // State
    isConnected,
    address,
    intentManagerAddress,
    nextIntentId,
    userIntentIds,
    
    // Actions
    createIntent,
    getIntent,
    refetchUserIntents,
    
    // Transaction state
    isCreating,
    isWaiting,
    isCreateSuccess,
    createError,
    receipt,
    transactionHash: createIntentData?.hash,
  };
}

