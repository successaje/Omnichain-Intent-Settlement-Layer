'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plus, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import { MetricCard } from '@/components/MetricCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlowingButton } from '@/components/GlowingButton';
import { Navigation } from '@/components/Navigation';

export default function DashboardPage() {
  const activeIntents = [
    { id: '1', description: 'Best yield for $1000 USDC', status: 'processing', apy: 7.2 },
    { id: '2', description: 'Swap 1 ETH to USDC', status: 'completed', apy: 0 },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] antialiased">

      <div className="container mx-auto px-4 py-12">
        {/* Portfolio Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="border-2 border-gray-200 dark:border-gray-700">
            <CardHeader className="border-b-2 border-gray-200 dark:border-gray-700">
              <CardTitle>Portfolio</CardTitle>
              <CardDescription>Your cross-chain assets and intents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <MetricCard
                  title="Total Value"
                  value="$12,450"
                  change="+12.5%"
                  icon={TrendingUp}
                  trend="up"
                />
                <MetricCard
                  title="Active Intents"
                  value={activeIntents.length}
                  icon={Clock}
                />
                <MetricCard
                  title="Completed"
                  value="24"
                  change="+3 this week"
                  icon={CheckCircle2}
                  trend="up"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Start New Intent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="border-2 border-gray-200 dark:border-gray-700">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                Ready to create a new intent?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Let AI agents compete to fulfill your cross-chain goals
              </p>
              <Link href="/intent/new">
                <GlowingButton>
                  <Plus className="h-5 w-5 mr-2" />
                  Start New Intent
                </GlowingButton>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Intents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-2 border-gray-200 dark:border-gray-700">
            <CardHeader className="border-b-2 border-gray-200 dark:border-gray-700">
              <CardTitle>Active Intents</CardTitle>
              <CardDescription>Your ongoing intent executions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeIntents.map((intent) => (
                  <motion.div
                    key={intent.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          {intent.description}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Status: {intent.status}
                        </p>
                      </div>
                      <div className="text-right">
                        {intent.apy > 0 && (
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {intent.apy}% APY
                          </p>
                        )}
                        <Link
                          href={`/intent/${intent.id}/execution`}
                          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
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

