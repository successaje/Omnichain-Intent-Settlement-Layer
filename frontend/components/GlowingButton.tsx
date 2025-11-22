'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/Button';
import { Sparkles } from 'lucide-react';

interface GlowingButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export function GlowingButton({ children, onClick, className = '', disabled = false }: GlowingButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative"
    >
      <Button
        onClick={onClick}
        disabled={disabled}
        className={`
          relative overflow-hidden
          bg-gradient-to-r from-indigo-600 to-purple-600
          text-white font-semibold
          shadow-lg shadow-indigo-500/50
          hover:shadow-xl hover:shadow-indigo-500/50
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: 'linear',
          }}
        />
        <span className="relative flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          {children}
        </span>
      </Button>
    </motion.div>
  );
}

