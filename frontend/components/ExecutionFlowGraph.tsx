'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Circle, ArrowRight, Loader2 } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed';
  chain?: string;
}

interface ExecutionFlowGraphProps {
  steps: Step[];
}

export function ExecutionFlowGraph({ steps }: ExecutionFlowGraphProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.2 }}
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  ${step.status === 'completed' 
                    ? 'bg-green-500 text-white' 
                    : step.status === 'active'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }
                  relative z-10
                `}
              >
                {step.status === 'completed' ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : step.status === 'active' ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Circle className="h-6 w-6" />
                )}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 + 0.1 }}
                className="mt-2 text-center"
              >
                <p className={`text-sm font-medium ${
                  step.status === 'active' 
                    ? 'text-indigo-600 dark:text-indigo-400' 
                    : step.status === 'completed'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {step.label}
                </p>
                {step.chain && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {step.chain}
                  </p>
                )}
              </motion.div>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 mx-4 h-0.5 bg-gray-300 dark:bg-gray-700 relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ 
                    width: step.status === 'completed' ? '100%' : '0%' 
                  }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

