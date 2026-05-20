'use client';

import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { platformLinks } from '@/services/social.service';
import type { SocialPlatform } from '@/types';
import { SOCIAL_PLATFORMS } from '@/utils/constants';

export default function SocialConnectPanel({
  onConnect,
}: {
  onConnect?: (platform: SocialPlatform, accountName: string) => void;
}) {
  const router = useRouter();

  const handleConnect = (platform: SocialPlatform) => {
    if (onConnect) {
      onConnect(platform, `user_${platform}`);
    } else {
      router.push('/social/connect?platform=' + platform);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {SOCIAL_PLATFORMS.map((platform) => {
        const p = platform as SocialPlatform;
        const info = platformLinks[p];
        return (
          <Card key={platform} className="p-6 text-center">
            <div className={`w-12 h-12 ${info.color} rounded-full flex items-center justify-center text-white text-xl mx-auto mb-3`}>
              {info.icon}
            </div>
            <h3 className="font-medium text-gray-900">{info.name}</h3>
            <p className="text-sm text-gray-500 mt-1">Connect your {info.name} account</p>
            <Button
              variant="secondary"
              className="mt-4 w-full"
              onClick={() => handleConnect(p)}
            >
              Connect
            </Button>
          </Card>
        );
      })}
    </div>
  );
}
