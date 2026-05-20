'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import ErrorAlert from '@/components/ui/ErrorAlert';
import SuccessAlert from '@/components/ui/SuccessAlert';
import HashtagInputForm from '@/components/hashtag/HashtagInputForm';
import HashtagCloud from '@/components/hashtag/HashtagCloud';
import { suggestHashtags } from '@/services/ai.service';
import { HashtagList } from '@/components/post/PostComponents';

export default function SuggestHashtagsPage() {
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (content: string) => {
    setLoading(true);
    setError(null);
    setHashtags([]);
    try {
      const res = await suggestHashtags(content);
      if (res.success && res.data) {
        setHashtags(res.data.hashtags);
      } else {
        setError(res.error?.message || 'Failed to suggest hashtags');
      }
    } catch (err: any) {
      setError(err?.error?.message || err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Suggest Hashtags</h2>
        <p className="text-sm text-gray-500 mb-4">Enter your post content and get relevant hashtag suggestions.</p>
        <HashtagInputForm onSubmit={handleSubmit} loading={loading} />
      </Card>

      {error && <ErrorAlert message={error} onRetry={() => setError(null)} />}

      {loading && <Card className="p-6"><Spinner /></Card>}

      {hashtags.length > 0 && (
        <Card className="p-6 space-y-4">
          <SuccessAlert message={`Generated ${hashtags.length} hashtags!`} />
          <HashtagCloud hashtags={hashtags} />
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Copy all:</h3>
            <HashtagList hashtags={hashtags} />
          </div>
        </Card>
      )}
    </div>
  );
}
