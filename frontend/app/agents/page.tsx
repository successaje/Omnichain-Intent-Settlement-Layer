'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Plus, TrendingUp, Zap, Shield } from 'lucide-react';
import { AgentCard } from '@/components/AgentCard';
import { GlowingButton } from '@/components/GlowingButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/Input';

export default function AgentMarketplacePage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const agents = [
    {
      agentId: 'agent-1',
      ensName: 'yield-master.solver.eth',
      specialization: 'Yield Farming',
      reputation: 1250,
      stake: '10.5',
      completedIntents: 45,
      avgRating: 4.8,
      successRate: 98,
      tags: ['best-apy', 'fastest'],
    },
    {
      agentId: 'agent-2',
      ensName: 'defi-expert.solver.eth',
      specialization: 'DeFi Strategy',
      reputation: 980,
      stake: '8.2',
      completedIntents: 32,
      avgRating: 4.6,
      successRate: 95,
      tags: ['cross-chain'],
    },
    {
      agentId: 'agent-3',
      ensName: 'cross-chain-pro.solver.eth',
      specialization: 'Cross-Chain Arbitrage',
      reputation: 1500,
      stake: '15.0',
      completedIntents: 58,
      avgRating: 4.9,
      successRate: 99,
      tags: ['cross-chain', 'best-apy'],
    },
    {
      agentId: 'agent-4',
      ensName: 'stable-yield.solver.eth',
      specialization: 'Stablecoin Yields',
      reputation: 850,
      stake: '7.5',
      completedIntents: 28,
      avgRating: 4.5,
      successRate: 92,
      tags: ['low-risk'],
    },
    {
      agentId: 'agent-5',
      ensName: 'risk-optimizer.solver.eth',
      specialization: 'Risk-Adjusted Returns',
      reputation: 1100,
      stake: '9.8',
      completedIntents: 41,
      avgRating: 4.7,
      successRate: 96,
      tags: ['low-risk', 'fastest'],
    },
  ];

  const filters = [
    { id: 'all', label: 'All Agents' },
    { id: 'best-apy', label: 'Best APY' },
    { id: 'fastest', label: 'Fastest' },
    { id: 'cross-chain', label: 'Cross-Chain Specialist' },
    { id: 'low-risk', label: 'Low Risk' },
  ];

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch = agent.ensName.toLowerCase().includes(search.toLowerCase()) ||
      agent.specialization.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || agent.tags.includes(filter);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] antialiased">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                Agent Marketplace
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Browse and hire AI agents to fulfill your intents
              </p>
            </div>
            <GlowingButton>
              <Plus className="h-5 w-5 mr-2" />
              Mint New Agent
            </GlowingButton>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4 mb-8">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search agents..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {filters.map((f) => (
                <motion.button
                  key={f.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilter(f.id)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${filter === f.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  {f.label}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Agent Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent, index) => (
            <motion.div
              key={agent.agentId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full border-2 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <AgentCard
                    agentId={agent.agentId}
                    ensName={agent.ensName}
                    specialization={agent.specialization}
                    reputation={agent.reputation}
                    stake={agent.stake}
                    completedIntents={agent.completedIntents}
                    avgRating={agent.avgRating}
                  />
                  <div className="mt-4 pt-4 border-t-2 border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate</span>
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                        {agent.successRate}%
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {agent.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full mt-4 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
                    >
                      Hire Agent
                    </motion.button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredAgents.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-gray-600 dark:text-gray-400">No agents found matching your criteria</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
