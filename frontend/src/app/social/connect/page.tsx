'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Card from '@/components/ui/Card';
import SuccessAlert from '@/components/ui/SuccessAlert';

const platformNames: Record<string, string> = {
  twitter: 'Twitter (X)',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
};

export default function ConnectPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const platform = searchParams.get('platform');

  useEffect(() => {
    if (!platform || !platformNames[platform]) {
      router.push('/social');
    }
  }, [platform, router]);

  if (!platform || !platformNames[platform]) return null;

  return (
    <div className="max-w-md mx-auto">
      <Card className="p-6 text-center space-y-4">
        <div className="text-5xl">
          {platform === 'twitter' ? '𝕏' : platform === 'instagram' ? '📷' : '💼'}
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          Connect {platformNames[platform]}
        </h2>
        <p className="text-sm text-gray-500">
          You will be redirected to {platformNames[platform]} to authorize the connection.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => {
              alert(`${platformNames[platform]} OAuth flow would start here.
Client ID and redirect URL must be configured in NextAuth.`);
              router.push('/social');
            }}
            className="px-6 py-2 bg-lyra-600 text-white rounded-lg hover:bg-lyra-700 text-sm font-medium"
          >
            Authorize
          </button>
          <button
            onClick={() => router.push('/social')}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
          >
            Cancel
          </button>
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-left">
          <p className="text-xs text-gray-500 font-medium mb-2">OAuth Flow Steps:</p>
          <ol className="text-xs text-gray-500 space-y-1 list-decimal list-inside">
            <li>Redirect to {platformNames[platform]} consent screen</li>
            <li>User approves requested permissions</li>
            <li>Platform redirects back with authorization code</li>
            <li>NextAuth exchanges code for access token</li>
            <li>Token stored in session — account connected</li>
          </ol>
        </div>
      </Card>
    </div>
  );
}
