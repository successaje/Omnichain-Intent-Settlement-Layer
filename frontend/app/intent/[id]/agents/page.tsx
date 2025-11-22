'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';
import { Trophy, Zap, Clock } from 'lucide-react';
import { AgentRaceCard } from '@/components/AgentRaceCard';
import { LoadingAgentsAnimation } from '@/components/LoadingAgentsAnimation';
import { Card, CardContent } from '@/components/ui/card';

export default function AgentBattleRoomPage() {
  const params = useParams();
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);

  useEffect(() => {
    // Simulate agents competing
    setTimeout(() => {
      const mockAgents = [
        { id: '1', ensName: 'yield-master.solver.eth', apy: 7.2, proposal: 'Aave + Compound strategy', progress: 100, rank: 1 },
        { id: '2', ensName: 'defi-expert.solver.eth', apy: 6.8, proposal: 'Yearn vault optimization', progress: 85, rank: 2 },
        { id: '3', ensName: 'cross-chain-pro.solver.eth', apy: 7.5, proposal: 'Multi-chain yield farming', progress: 75, rank: 3 },
        { id: '4', ensName: 'stable-yield.solver.eth', apy: 6.5, proposal: 'Stablecoin focus', progress: 60, rank: 4 },
        { id: '5', ensName: 'risk-optimizer.solver.eth', apy: 6.2, proposal: 'Low-risk strategy', progress: 45, rank: 5 },
      ];
      setAgents(mockAgents);
      setLoading(false);
      setWinner('1');
    }, 2000);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] antialiased">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            Agent Battle Room
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            AI agents are competing to fulfill your intent
          </p>
        </motion.div>

        {loading ? (
          <LoadingAgentsAnimation />
        ) : (
          <>
            {/* Winner Announcement */}
            {winner && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className="mb-8"
              >
                <Card className="border-2 border-green-500 bg-green-50 dark:bg-green-900/20">
                  <CardContent className="p-6 text-center">
                    <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                      Winner Selected!
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300">
                      {agents.find(a => a.id === winner)?.ensName} has the best proposal
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Agent Race Cards */}
            <div className="space-y-4 max-w-4xl mx-auto">
              <AnimatePresence>
                {agents.map((agent, index) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <AgentRaceCard
                      agentId={agent.id}
                      ensName={agent.ensName}
                      apy={agent.apy}
                      proposal={agent.proposal}
                      progress={agent.progress}
                      isWinner={agent.id === winner}
                      rank={agent.rank}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Real-time Logs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 max-w-4xl mx-auto"
            >
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    Real-time Updates from Llama 3.2
                  </h3>
                  <div className="space-y-2 font-mono text-sm">
                    {[
                      'Agent yield-master.solver.eth: Analyzing market conditions...',
                      'Agent defi-expert.solver.eth: Calculating optimal APY...',
                      'Agent cross-chain-pro.solver.eth: Evaluating cross-chain routes...',
                      'Winner: yield-master.solver.eth with 7.2% APY',
                    ].map((log, i) => (
                      <motion.p
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.3 }}
                        className="text-gray-600 dark:text-gray-400"
                      >
                        {log}
                      </motion.p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

