'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import SocialConnectPanel from '@/components/social/SocialConnectPanel';
import ConnectedAccountCard from '@/components/social/ConnectedAccountCard';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import type { SocialPlatform } from '@/types';

export default function SocialPage() {
  const [connected, setConnected] = useState<{ platform: SocialPlatform; accountName: string }[]>([]);

  const handleDisconnect = (platform: SocialPlatform) => {
    setConnected((prev) => prev.filter((c) => c.platform !== platform));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Social Accounts</h2>
            <p className="text-sm text-gray-500">Connect your social media accounts to publish posts directly.</p>
          </div>
          {connected.length > 0 && (
            <Button
              variant="primary"
              onClick={() => window.location.href = '/social/publish'}
            >
              Publish Post
            </Button>
          )}
        </div>
      </Card>

      {connected.length > 0 && (
        <Card className="p-6 space-y-3">
          <h3 className="font-medium text-gray-900">Connected Accounts</h3>
          {connected.map((acc) => (
            <ConnectedAccountCard
              key={acc.platform}
              account={acc}
              onDisconnect={() => handleDisconnect(acc.platform)}
            />
          ))}
        </Card>
      )}

      <Card className="p-6 space-y-4">
        <h3 className="font-medium text-gray-900">
          {connected.length > 0 ? 'Connect Another Account' : 'Connect Your First Account'}
        </h3>
        <SocialConnectPanel onConnect={(platform, name) => {
          setConnected((prev) => {
            const exists = prev.find((c) => c.platform === platform);
            if (exists) return prev;
            return [...prev, { platform, accountName: name }];
          });
        }} />
      </Card>
    </div>
  );
}
