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
    <div className="max-w-2xl mx-auto space-y-stack-lg">
      <Card>
        <h2 className="font-sora text-headline-lg text-on-surface mb-4">Suggest Hashtags</h2>
        <p className="text-sm text-text-muted mb-4">Enter your post content and get relevant hashtag suggestions.</p>
        <HashtagInputForm onSubmit={handleSubmit} loading={loading} />
      </Card>

      {error && <ErrorAlert message={error} onRetry={() => setError(null)} />}

      {loading && <Card><Spinner /></Card>}

      {hashtags.length > 0 && (
        <>
          <Card className="space-y-4">
            <SuccessAlert message={`Generated ${hashtags.length} hashtags!`} />
            <HashtagCloud hashtags={hashtags} />
            <div className="mt-4">
              <h3 className="text-sm font-medium text-on-surface mb-2">Copy all:</h3>
              <HashtagList hashtags={hashtags} />
            </div>
          </Card>

          <Card>
            <h3 className="font-sora text-headline-lg text-on-surface mb-6">Hashtag Performance</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
              <div className="text-center p-6 rounded-2xl bg-white/5 border border-glass-border">
                <div className="text-2xl font-bold text-neon-violet mb-1">4.2M</div>
                <div className="text-[10px] tracking-widest text-text-muted uppercase">Global Reach</div>
              </div>
              <div className="text-center p-6 rounded-2xl bg-white/5 border border-glass-border">
                <div className="text-2xl font-bold text-neon-cyan mb-1">862k</div>
                <div className="text-[10px] tracking-widest text-text-muted uppercase">Impressions</div>
              </div>
              <div className="text-center p-6 rounded-2xl bg-white/5 border border-glass-border">
                <div className="text-2xl font-bold text-neon-pink mb-1">12%</div>
                <div className="text-[10px] tracking-widest text-text-muted uppercase">Click Rate</div>
              </div>
              <div className="text-center p-6 rounded-2xl bg-white/5 border border-glass-border">
                <div className="text-2xl font-bold text-on-surface mb-1">High</div>
                <div className="text-[10px] tracking-widest text-text-muted uppercase">Velocity</div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
