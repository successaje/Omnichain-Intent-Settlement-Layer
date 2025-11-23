'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { ExecutionFlowGraph } from '@/components/ExecutionFlowGraph';
import { IntentTimeline } from '@/components/IntentTimeline';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChainPill } from '@/components/ChainPill';

export default function ExecutionVisualizerPage() {
  const params = useParams();
  const chainId = useChainId();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { id: '1', label: 'Intent Accepted', status: 'completed' as const, chain: 'Ethereum' },
    { id: '2', label: 'Solver Selected', status: 'completed' as const, chain: 'Ethereum' },
    { id: '3', label: 'Cross-chain Transfer', status: 'active' as const, chain: 'Arbitrum' },
    { id: '4', label: 'Settlement', status: 'pending' as const, chain: 'Base' },
    { id: '5', label: 'Confirmation', status: 'pending' as const, chain: 'Base' },
  ];

  const events = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 300000),
      title: 'Intent Created',
      description: 'User intent submitted and accepted',
      status: 'completed' as const,
      chain: 'Ethereum',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 240000),
      title: 'Agent Selected',
      description: 'yield-master.solver.eth chosen with 7.2% APY',
      status: 'completed' as const,
      chain: 'Ethereum',
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 120000),
      title: 'LayerZero Message Sent',
      description: 'Cross-chain message initiated',
      status: 'completed' as const,
      chain: 'Ethereum → Arbitrum',
    },
    {
      id: '4',
      timestamp: new Date(),
      title: 'Processing on Arbitrum',
      description: 'Executing yield strategy',
      status: 'processing' as const,
      chain: 'Arbitrum',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] antialiased">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            Execution Visualizer
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time cross-chain execution flow
          </p>
        </motion.div>

        {/* Multi-chain Graph */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <Card className="border-2 border-gray-200 dark:border-gray-700">
            <CardHeader className="border-b-2 border-gray-200 dark:border-gray-700">
              <CardTitle>Cross-Chain Execution Flow</CardTitle>
              <CardDescription>LayerZero omnichain execution visualization</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <ExecutionFlowGraph steps={steps} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Chain Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <Card className="border-2 border-gray-200 dark:border-gray-700">
            <CardHeader className="border-b-2 border-gray-200 dark:border-gray-700">
              <CardTitle>Chain Network</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-8 py-8">
                {['Ethereum', 'Arbitrum', 'Base'].map((chain, i) => (
                  <motion.div
                    key={chain}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.2 }}
                    className="text-center"
                  >
                    <div className={`
                      w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4
                      ${i === 0 ? 'bg-blue-500' : i === 1 ? 'bg-cyan-500' : 'bg-blue-400'}
                    `}>
                      {chain[0]}
                    </div>
                    <ChainPill chain={chain} active={i <= currentStep} />
                    {i < 2 && (
                      <motion.div
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: i < currentStep ? 1 : 0 }}
                        className="absolute top-1/2 left-1/2 w-16 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 transform translate-x-8"
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <Card className="border-2 border-gray-200 dark:border-gray-700">
            <CardHeader className="border-b-2 border-gray-200 dark:border-gray-700">
              <CardTitle>Execution Timeline</CardTitle>
              <CardDescription>Step-by-step execution events</CardDescription>
            </CardHeader>
            <CardContent>
              <IntentTimeline events={events} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Transaction List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-2 border-gray-200 dark:border-gray-700">
            <CardHeader className="border-b-2 border-gray-200 dark:border-gray-700">
              <CardTitle>Transaction List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', chain: 'Ethereum', status: 'Confirmed' },
                  { hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890', chain: 'Arbitrum', status: 'Pending' },
                ].map((tx, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-mono text-sm text-gray-900 dark:text-gray-100">{formatTxHash(tx.hash)}</p>
                        <a
                          href={getExplorerUrl(chainId, tx.hash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <ExternalLink className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                        </a>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{tx.chain}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      tx.status === 'Confirmed' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                    }`}>
                      {tx.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

