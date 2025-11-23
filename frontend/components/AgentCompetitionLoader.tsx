'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Brain, TrendingUp, Zap, Trophy, Loader2 } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface AgentCompetitionLoaderProps {
  agents?: Array<{
    id: string;
    ensName: string;
    apy?: number;
    proposal?: string;
    rank?: number;
  }>;
  isLoading?: boolean;
}

export function AgentCompetitionLoader({ agents = [], isLoading = true }: AgentCompetitionLoaderProps) {
  const mockAgents = agents.length > 0 ? agents : [
    { id: '1', ensName: 'yield-master.solver.eth', apy: 7.2, proposal: 'Aave + Compound strategy', rank: 1 },
    { id: '2', ensName: 'defi-expert.solver.eth', apy: 6.8, proposal: 'Yearn vault optimization', rank: 2 },
    { id: '3', ensName: 'cross-chain-pro.solver.eth', apy: 7.5, proposal: 'Multi-chain yield farming', rank: 3 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg)]/95 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl w-full mx-4"
      >
        <Card className="border-2 border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-800">
          <CardContent className="p-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"
              >
                <Brain className="h-8 w-8 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Agents Competing...
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                AI agents are analyzing your intent and preparing proposals
              </p>
            </motion.div>

            {/* Loading Animation */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-8"
              >
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Loader2 className="h-5 w-5 animate-spin text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Analyzing market conditions...
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                  />
                </div>
              </motion.div>
            )}

            {/* Top Agents */}
            <AnimatePresence>
              {mockAgents.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Top Competing Agents
                  </h3>
                  {mockAgents.map((agent, index) => (
                    <motion.div
                      key={agent.id}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.2 }}
                      className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 text-white font-bold">
                            {agent.rank || index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                              {agent.ensName}
                            </h4>
                            {agent.proposal && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {agent.proposal}
                              </p>
                            )}
                          </div>
                        </div>
                        {agent.apy && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.2 + 0.3, type: 'spring' }}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800"
                          >
                            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="text-lg font-bold text-green-600 dark:text-green-400">
                              {agent.apy}% APY
                            </span>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Real-time Updates */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 pt-6 border-t-2 border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Real-time Updates
                </span>
              </div>
              <div className="space-y-1 font-mono text-xs text-gray-600 dark:text-gray-400">
                {[
                  'Agent yield-master.solver.eth: Analyzing market conditions...',
                  'Agent defi-expert.solver.eth: Calculating optimal APY...',
                  'Agent cross-chain-pro.solver.eth: Evaluating cross-chain routes...',
                ].map((log, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.3 + 0.8 }}
                    className="truncate"
                  >
                    {log}
                  </motion.p>
                ))}
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

