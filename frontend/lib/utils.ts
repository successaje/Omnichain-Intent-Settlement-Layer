import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get blockchain explorer URL for a transaction hash
 */
export function getExplorerUrl(chainId: number, txHash: string): string {
  const explorers: Record<number, string> = {
    1: 'https://etherscan.io/tx/',
    11155111: 'https://sepolia.etherscan.io/tx/', // Sepolia
    84532: 'https://sepolia.basescan.org/tx/', // Base Sepolia
    421614: 'https://sepolia.arbiscan.io/tx/', // Arbitrum Sepolia
    11155420: 'https://optimism-sepolia.blockscout.com/tx/', // Optimism Sepolia
  };

  const baseUrl = explorers[chainId] || explorers[11155111]; // Default to Sepolia
  return `${baseUrl}${txHash}`;
}

/**
 * Format transaction hash for display
 */
export function formatTxHash(hash: string): string {
  if (!hash) return '';
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}
