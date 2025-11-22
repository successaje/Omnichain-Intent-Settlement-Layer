import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        'bg-dark': 'var(--bg-dark)',
        surface: 'var(--surface)',
        'surface-dark': 'var(--surface-dark)',
        text: 'var(--text)',
        'text-dark': 'var(--text-dark)',
        accent: 'var(--accent)',
        'accent-dark': 'var(--accent-dark)',
        border: 'var(--border)',
        'border-dark': 'var(--border-dark)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      boxShadow: {
        'glow': '0 0 20px var(--glow)',
        'glow-lg': '0 0 40px var(--glow), 0 0 60px var(--glow)',
      },
    },
  },
  plugins: [],
};

export default config;

