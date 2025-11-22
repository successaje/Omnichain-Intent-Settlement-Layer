'use client';

import { motion } from 'framer-motion';
import { Brain, Zap, Sparkles } from 'lucide-react';

export function LoadingAgentsAnimation() {
  const agents = [
    { icon: Brain, delay: 0 },
    { icon: Zap, delay: 0.2 },
    { icon: Sparkles, delay: 0.4 },
  ];

  return (
    <div className="flex items-center justify-center gap-4 py-12">
      {agents.map(({ icon: Icon, delay }, i) => (
        <motion.div
          key={i}
          initial={{ y: 0, opacity: 0.5 }}
          animate={{ 
            y: [0, -20, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay,
            ease: 'easeInOut',
          }}
          className="p-4 rounded-full bg-indigo-100 dark:bg-indigo-900/30"
        >
          <Icon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
        </motion.div>
      ))}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="ml-4 text-lg font-medium text-gray-600 dark:text-gray-400"
      >
        Agents are thinking...
      </motion.p>
    </div>
  );
}

