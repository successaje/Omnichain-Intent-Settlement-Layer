'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Moon, Sun, Monitor, Key, Bell, Network } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/components/ThemeContext';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [apiKey, setApiKey] = useState('');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    intentUpdates: true,
  });

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] antialiased">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <SettingsIcon className="h-8 w-8" />
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your preferences and account settings
          </p>
        </motion.div>

        {/* Theme Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="border-2 border-gray-200 dark:border-gray-700">
            <CardHeader className="border-b-2 border-gray-200 dark:border-gray-700">
              <CardTitle className="flex items-center gap-2">
                <Sun className="h-5 w-5" />
                Theme
              </CardTitle>
              <CardDescription>Choose your preferred color scheme</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {[
                  { value: 'light', icon: Sun, label: 'Light' },
                  { value: 'dark', icon: Moon, label: 'Dark' },
                  { value: 'system', icon: Monitor, label: 'System' },
                ].map(({ value, icon: Icon, label }) => (
                  <motion.button
                    key={value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setTheme(value as any)}
                    className={`
                      flex-1 p-4 rounded-lg border-2 transition-all
                      ${theme === value
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }
                    `}
                  >
                    <Icon className="h-6 w-6 mx-auto mb-2 text-gray-700 dark:text-gray-300" />
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Chain Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="border-2 border-gray-200 dark:border-gray-700">
            <CardHeader className="border-b-2 border-gray-200 dark:border-gray-700">
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Chain Preferences
              </CardTitle>
              <CardDescription>Set your preferred chains for intent execution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Ethereum', 'Arbitrum', 'Optimism', 'Polygon', 'Base', 'Avalanche'].map((chain) => (
                  <label key={chain} className="flex items-center justify-between p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                    <span className="text-gray-900 dark:text-gray-100">{chain}</span>
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-indigo-600 rounded" />
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ENS Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="border-2 border-gray-200 dark:border-gray-700">
            <CardHeader className="border-b-2 border-gray-200 dark:border-gray-700">
              <CardTitle>ENS Profile</CardTitle>
              <CardDescription>Manage your ENS identity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  label="ENS Name"
                  placeholder="yourname.oisl.eth"
                  defaultValue="user.oisl.eth"
                />
                <Button>Update ENS Name</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* API Keys */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card className="border-2 border-gray-200 dark:border-gray-700">
            <CardHeader className="border-b-2 border-gray-200 dark:border-gray-700">
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Keys
              </CardTitle>
              <CardDescription>For advanced users and integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  label="API Key"
                  type="password"
                  placeholder="Enter your API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <div className="flex gap-4">
                  <Button>Save API Key</Button>
                  <Button variant="outline">Generate New Key</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-2 border-gray-200 dark:border-gray-700">
            <CardHeader className="border-b-2 border-gray-200 dark:border-gray-700">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>Configure your notification preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { key: 'email', label: 'Email Notifications' },
                  { key: 'push', label: 'Push Notifications' },
                  { key: 'intentUpdates', label: 'Intent Updates' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center justify-between p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                    <span className="text-gray-900 dark:text-gray-100">{label}</span>
                    <input
                      type="checkbox"
                      checked={notifications[key as keyof typeof notifications]}
                      onChange={(e) =>
                        setNotifications({ ...notifications, [key]: e.target.checked })
                      }
                      className="w-5 h-5 text-indigo-600 rounded"
                    />
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

