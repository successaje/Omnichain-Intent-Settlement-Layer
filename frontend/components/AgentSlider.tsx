'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle2, Trophy } from 'lucide-react';
import { AgentCard } from './AgentCard';
import { Button } from './ui/Button';

interface Agent {
  id: string;
  ensName: string;
  specialization: string;
  reputation: number;
  stake: string;
  completedIntents: number;
  avgRating: number;
  successRate?: number;
  tags?: string[];
  apy?: number;
  rank?: number;
}

interface AgentSliderProps {
  agents: Agent[];
  selectedAgentId: string | null;
  onSelectAgent: (agentId: string) => void;
  autoSelectFirst?: boolean;
}

export function AgentSlider({ agents, selectedAgentId, onSelectAgent, autoSelectFirst = true }: AgentSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoSelected, setAutoSelected] = useState(false);

  // Auto-select first agent if enabled
  if (autoSelectFirst && !autoSelected && agents.length > 0 && !selectedAgentId) {
    setTimeout(() => {
      onSelectAgent(agents[0].id);
      setAutoSelected(true);
    }, 100);
  }

  const visibleAgents = agents.slice(currentIndex, currentIndex + 3);
  const canGoLeft = currentIndex > 0;
  const canGoRight = currentIndex < agents.length - 3;

  const goLeft = () => {
    if (canGoLeft) {
      setCurrentIndex(Math.max(0, currentIndex - 1));
    }
  };

  const goRight = () => {
    if (canGoRight) {
      setCurrentIndex(Math.min(agents.length - 3, currentIndex + 1));
    }
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Top Agents
          </h3>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            ({agents.length} competing)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goLeft}
            disabled={!canGoLeft}
            className={`p-2 rounded-lg border-2 transition-colors ${
              canGoLeft
                ? 'border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400 text-gray-700 dark:text-gray-300'
                : 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={goRight}
            disabled={!canGoRight}
            className={`p-2 rounded-lg border-2 transition-colors ${
              canGoRight
                ? 'border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400 text-gray-700 dark:text-gray-300'
                : 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed'
            }`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Slider Container */}
      <div className="relative overflow-hidden">
        <motion.div
          className="flex gap-6"
          animate={{
            x: `-${currentIndex * (100 / 3)}%`,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {agents.map((agent, index) => {
            const isSelected = selectedAgentId === agent.id;
            const isVisible = index >= currentIndex && index < currentIndex + 3;

            return (
              <motion.div
                key={agent.id}
                className={`flex-shrink-0 w-[calc(33.333%-1rem)] ${
                  isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
                transition={{ delay: (index - currentIndex) * 0.1 }}
              >
                <div className="relative">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -4 }}
                    className={`relative cursor-pointer ${
                      isSelected ? 'ring-2 ring-indigo-500 rounded-xl' : ''
                    }`}
                    onClick={() => onSelectAgent(agent.id)}
                  >
                    {/* Rank Badge */}
                    {agent.rank && (
                      <div className="absolute -top-2 -left-2 z-10 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                        {agent.rank}
                      </div>
                    )}

                    {/* Selected Indicator */}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 z-10 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg"
                      >
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      </motion.div>
                    )}

                    <AgentCard
                      agentId={agent.id}
                      ensName={agent.ensName}
                      specialization={agent.specialization}
                      reputation={agent.reputation}
                      stake={agent.stake}
                      completedIntents={agent.completedIntents}
                      avgRating={agent.avgRating}
                      onClick={() => onSelectAgent(agent.id)}
                    />

                    {/* APY Badge */}
                    {agent.apy && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-2 right-2 px-3 py-1 rounded-lg bg-green-500 text-white text-sm font-bold shadow-lg"
                      >
                        {agent.apy}% APY
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Dots Indicator */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {Array.from({ length: Math.max(1, agents.length - 2) }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'w-8 bg-indigo-600 dark:bg-indigo-400'
                : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
            }`}
          />
        ))}
      </div>

      {/* Selected Agent Info */}
      {selectedAgentId && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 rounded-lg border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Selected Agent
              </p>
              <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                {agents.find(a => a.id === selectedAgentId)?.ensName}
              </p>
              {agents.find(a => a.id === selectedAgentId)?.apy && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Estimated APY: {agents.find(a => a.id === selectedAgentId)?.apy}%
                </p>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => onSelectAgent('')}
              className="text-sm"
            >
              Change Selection
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

