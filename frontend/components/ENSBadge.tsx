'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface ENSBadgeProps {
  name: string;
  verified?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ENSBadge({ name, verified = true, size = 'md' }: ENSBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium ${sizeClasses[size]}`}
    >
      <span>{name}</span>
      {verified && (
        <CheckCircle2 className="h-3 w-3" />
      )}
    </motion.div>
  );
}

