'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Shield, Clock, CheckCircle2, Star } from 'lucide-react';
import { ENSBadge } from './ENSBadge';
import { Button } from './ui/Button';

interface AgentProfileModalProps {
  agent: {
    id: string;
    ensName: string;
    specialization: string;
    reputation: number;
    stake: string;
    completedIntents: number;
    avgRating: number;
    successRate?: number;
    tags?: string[];
  };
  isOpen: boolean;
  onClose: () => void;
  onCompete?: () => void;
}

export function AgentProfileModal({ agent, isOpen, onClose, onCompete }: AgentProfileModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-gray-200 dark:border-gray-700">
              {/* Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b-2 border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between rounded-t-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                    {agent.ensName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <ENSBadge name={agent.ensName} size="lg" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{agent.specialization}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-800">
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{agent.reputation}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Reputation</div>
                  </div>
                  <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{agent.stake}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Stake (ETH)</div>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{agent.completedIntents}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Completed</div>
                  </div>
                  <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{agent.avgRating.toFixed(1)}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Rating</div>
                  </div>
                </div>

                {/* Success Rate */}
                {agent.successRate && (
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Success Rate</span>
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">{agent.successRate}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${agent.successRate}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                      />
                    </div>
                  </div>
                )}

                {/* Tags */}
                {agent.tags && agent.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Specializations</h3>
                    <div className="flex flex-wrap gap-2">
                      {agent.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rating Details */}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Average Rating</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={i < Math.round(agent.avgRating) ? 'text-yellow-400 dark:text-yellow-500' : 'text-gray-300 dark:text-gray-600'}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">({agent.avgRating.toFixed(1)} / 5.0)</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t-2 border-gray-200 dark:border-gray-700">
                  {onCompete && (
                    <Button
                      onClick={() => {
                        onCompete();
                        onClose();
                      }}
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Compete for Intent
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

