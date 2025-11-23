'use client';

import Image from 'next/image';
import { useTheme } from './ThemeContext';

interface ThemeAwareLogoProps {
  name: 'layerzero' | 'chainlink' | 'filecoin';
  width?: number;
  height?: number;
  className?: string;
  alt?: string;
}

const logoMap = {
  layerzero: {
    light: '/logos/black_layerzero.png',
    dark: '/logos/white_layerzero.png',
  },
  chainlink: {
    light: '/logos/chainlink.png',
    dark: '/logos/chainlink.png', // Chainlink logo works for both
  },
  filecoin: {
    light: '/logos/filecoin-fil-logo.png',
    dark: '/logos/filecoin-fil-logo.png', // Filecoin logo works for both
  },
};

export function ThemeAwareLogo({ 
  name, 
  width = 80, 
  height = 24, 
  className = '',
  alt 
}: ThemeAwareLogoProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const logoPath = logoMap[name][isDark ? 'dark' : 'light'];

  return (
    <Image
      src={logoPath}
      alt={alt || name}
      width={width}
      height={height}
      className={className}
    />
  );
}

