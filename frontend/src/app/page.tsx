'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icons';
import api from '@/services/api';

const features = [
  { href: '/generate-post', title: 'Create Content', desc: 'Generate post copy, hashtags, media recommendations, and preview', icon: 'edit' as const, color: 'bg-blue-50 border-blue-200' },
  { href: '/suggest-hashtags', title: 'Suggest Hashtags', desc: 'Get hashtag suggestions from your post content', icon: 'tag' as const, color: 'bg-purple-50 border-purple-200' },
  { href: '/recommend-media', title: 'Recommend Media', desc: 'Find approved media files matching your post', icon: 'image' as const, color: 'bg-green-50 border-green-200' },
  { href: '/files', title: 'Files Library', desc: 'Browse and manage your media file records', icon: 'folder' as const, color: 'bg-amber-50 border-amber-200' },
];

export default function Dashboard() {
  const [healthy, setHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    api.get('/health')
      .then(() => setHealthy(true))
      .catch(() => setHealthy(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome to Lyra Content Agent</h2>
          <p className="text-gray-500 mt-1">AI-powered content creation and media management</p>
        </div>
        <div className="ml-auto">
          {healthy !== null && (
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
              healthy ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              <span className={`w-2 h-2 rounded-full ${healthy ? 'bg-green-500' : 'bg-red-500'}`} />
              API {healthy ? 'Online' : 'Offline'}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((f) => (
          <Link key={f.href} href={f.href}>
            <Card className={`p-6 border-2 ${f.color} hover:shadow-md transition-all cursor-pointer h-full`}>
              <div className="mb-3 text-lyra-600"><Icon name={f.icon} className="w-8 h-8" /></div>
              <h3 className="font-semibold text-gray-900">{f.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{f.desc}</p>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Quick Start</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>1. Upload and approve media files → <Link href="/files/create" className="text-lyra-600 hover:text-lyra-800 font-medium">Upload File</Link></p>
          <p>2. Generate post copy and hashtags → <Link href="/generate-post" className="text-lyra-600 hover:text-lyra-800 font-medium">Create Content</Link></p>
          <p>3. Pick recommended media and review the preview before publishing.</p>

        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-3">API Base URL</h3>
        <code className="block bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-700 border border-gray-200">
          https://lyra-content-agent.vercel.app
        </code>
        <p className="text-xs text-gray-400 mt-2">No authentication required — all endpoints are open</p>
      </Card>
    </div>
  );
}
