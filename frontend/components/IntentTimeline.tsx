'use client';

import { motion } from 'framer-motion';
import { Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface TimelineEvent {
  id: string;
  timestamp: Date;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  chain?: string;
}

interface IntentTimelineProps {
  events: TimelineEvent[];
}

export function IntentTimeline({ events }: IntentTimelineProps) {
  const getStatusIcon = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 text-indigo-500 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex gap-4"
        >
          <div className="flex flex-col items-center">
            <div className={`
              p-2 rounded-full
              ${event.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' :
                event.status === 'failed' ? 'bg-red-100 dark:bg-red-900/30' :
                event.status === 'processing' ? 'bg-indigo-100 dark:bg-indigo-900/30' :
                'bg-gray-100 dark:bg-gray-800'}
            `}>
              {getStatusIcon(event.status)}
            </div>
            {index < events.length - 1 && (
              <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 my-2" />
            )}
          </div>
          <div className="flex-1 pb-8">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                {event.title}
              </h4>
              <span className="text-xs text-gray-500 dark:text-gray-500">
                {event.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {event.description}
            </p>
            {event.chain && (
              <span className="inline-block px-2 py-1 text-xs rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                {event.chain}
              </span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

