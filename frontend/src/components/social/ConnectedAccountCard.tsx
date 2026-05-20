'use client';

import Button from '@/components/ui/Button';
import { platformLinks } from '@/services/social.service';
import type { SocialPlatform } from '@/types';

interface ConnectedAccount {
  platform: SocialPlatform;
  accountName: string;
}

export default function ConnectedAccountCard({
  account,
  onDisconnect,
}: {
  account: ConnectedAccount;
  onDisconnect: () => void;
}) {
  const info = platformLinks[account.platform];
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
      <div className={`w-10 h-10 ${info.color} rounded-full flex items-center justify-center text-white`}>
        {info.icon}
      </div>
      <div className="flex-1">
        <p className="font-medium text-gray-900">{info.name}</p>
        <p className="text-sm text-gray-500">@{account.accountName}</p>
      </div>
      <Button variant="danger" size="sm" onClick={onDisconnect}>
        Disconnect
      </Button>
    </div>
  );
}
