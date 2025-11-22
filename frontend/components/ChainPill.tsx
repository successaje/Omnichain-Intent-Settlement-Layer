'use client';

import { motion } from 'framer-motion';

interface ChainPillProps {
  chain: string;
  active?: boolean;
  onClick?: () => void;
}

const chainColors: Record<string, string> = {
  ethereum: 'bg-blue-500',
  arbitrum: 'bg-cyan-500',
  optimism: 'bg-red-500',
  polygon: 'bg-purple-500',
  base: 'bg-blue-400',
  avalanche: 'bg-red-600',
};

export function ChainPill({ chain, active = false, onClick }: ChainPillProps) {
  const color = chainColors[chain.toLowerCase()] || 'bg-gray-500';

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        px-3 py-1.5 rounded-full text-xs font-medium text-white
        ${color}
        ${active ? 'ring-2 ring-offset-2 ring-indigo-400' : ''}
        transition-all
      `}
    >
      {chain}
    </motion.button>
  );
}

