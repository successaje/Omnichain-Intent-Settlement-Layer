'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';
import { Button } from './ui/Button';
import { ENSBadge } from './ENSBadge';

export function WalletConnectButton() {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [ensName, setEnsName] = useState<string | null>(null);

  const handleConnect = async () => {
    // Mock wallet connection - replace with actual wallet integration
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({
          method: 'eth_requestAccounts',
        });
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setEnsName('user.oisl.eth'); // Mock ENS name
          setConnected(true);
        }
      } catch (error) {
        console.error('Wallet connection failed:', error);
      }
    } else {
      // Mock for demo
      setAddress('0x1234...5678');
      setEnsName('user.oisl.eth');
      setConnected(true);
    }
  };

  if (connected && ensName) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3"
      >
        <ENSBadge name={ensName} />
        <Button variant="outline" size="sm" onClick={() => setConnected(false)}>
          Disconnect
        </Button>
      </motion.div>
    );
  }

  return (
    <Button onClick={handleConnect} className="flex items-center gap-2">
      <Wallet className="h-4 w-4" />
      Connect Wallet
    </Button>
  );
}

