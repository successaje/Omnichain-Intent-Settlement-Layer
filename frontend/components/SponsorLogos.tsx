'use client';

import { motion } from 'framer-motion';
import { ThemeAwareLogo } from './ThemeAwareLogo';

interface SponsorLogosProps {
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  className?: string;
}

export function SponsorLogos({ size = 'md', showLabels = false, className = '' }: SponsorLogosProps) {
  const sizeClasses = {
    sm: 'h-4 w-auto',
    md: 'h-6 w-auto',
    lg: 'h-8 w-auto',
  };

  const sponsors = [
    { name: 'LayerZero', logo: 'layerzero' as const },
    { name: 'Chainlink', logo: 'chainlink' as const },
    { name: 'Filecoin', logo: 'filecoin' as const },
  ];

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {sponsors.map((sponsor, i) => (
        <motion.div
          key={sponsor.name}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex flex-col items-center gap-2"
        >
          <ThemeAwareLogo
            name={sponsor.logo}
            width={size === 'sm' ? 60 : size === 'md' ? 100 : 140}
            height={size === 'sm' ? 18 : size === 'md' ? 30 : 42}
            className={`${sizeClasses[size]} opacity-70 hover:opacity-100 transition-opacity`}
          />
          {showLabels && (
            <span className="text-xs text-gray-600 dark:text-gray-400">{sponsor.name}</span>
          )}
        </motion.div>
      ))}
    </div>
  );
}

