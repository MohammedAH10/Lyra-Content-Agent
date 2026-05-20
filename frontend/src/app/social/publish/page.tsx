'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import TextArea from '@/components/ui/TextArea';
import Input from '@/components/ui/Input';
import ErrorAlert from '@/components/ui/ErrorAlert';
import SuccessAlert from '@/components/ui/SuccessAlert';
import PlatformSelector from '@/components/social/PlatformSelector';
import type { SocialPlatform } from '@/types';

export default function PublishPage() {
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [platforms, setPlatforms] = useState<SocialPlatform[]>(['twitter']);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const handlePublish = async () => {
    if (!content.trim()) {
      setError('Post content is required');
      return;
    }
    if (platforms.length === 0) {
      setError('Select at least one platform');
      return;
    }

    setPublishing(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/social/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          mediaUrls: mediaUrl ? [mediaUrl] : [],
          platforms,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(`Published to ${platforms.length} platform(s) successfully!`);
      } else {
        setError(data.error?.message || 'Failed to publish');
      }
    } catch {
      setError('Failed to publish. Make sure your social accounts are connected.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Publish Post</h2>
        <p className="text-sm text-gray-500">Write your post and publish it to connected social accounts.</p>

        <TextArea
          label="Post Content"
          placeholder="Write your post content here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <Input
          label="Media URL (optional)"
          placeholder="https://s3.example.com/files/banner.png"
          value={mediaUrl}
          onChange={(e) => setMediaUrl(e.target.value)}
        />

        <PlatformSelector selected={platforms} onChange={setPlatforms} />

        {error && <ErrorAlert message={error} />}
        {result && <SuccessAlert message={result} />}

        <Button onClick={handlePublish} loading={publishing} className="w-full">
          Publish to {platforms.length} platform{platforms.length !== 1 ? 's' : ''}
        </Button>
      </Card>

      <Card className="p-6">
        <h3 className="font-medium text-gray-900 mb-3">Post Preview</h3>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          {content ? (
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{content}</p>
          ) : (
            <p className="text-sm text-gray-400 italic">Your post preview will appear here...</p>
          )}
          {mediaUrl && (
            <div className="mt-3 text-xs text-gray-500">
              📎 Media: {mediaUrl}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
