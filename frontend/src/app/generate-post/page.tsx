'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import ErrorAlert from '@/components/ui/ErrorAlert';
import SuccessAlert from '@/components/ui/SuccessAlert';
import PostGeneratorForm from '@/components/post/PostGeneratorForm';
import { PostResultCard, VariationCard, HashtagList } from '@/components/post/PostComponents';
import { generatePost } from '@/services/ai.service';
import type { GeneratePostResult } from '@/types';

export default function GeneratePostPage() {
  const [result, setResult] = useState<GeneratePostResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: { prompt: string; tone: string; variations: number }) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await generatePost(data.prompt, data.tone as any, data.variations);
      if (res.success && res.data) {
        setResult(res.data);
      } else {
        setError(res.error?.message || 'Failed to generate post');
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Your Post</h2>
        <PostGeneratorForm onSubmit={handleSubmit} loading={loading} />
      </Card>

      {error && <ErrorAlert message={error} onRetry={() => setError(null)} />}

      {loading && <Card className="p-6"><Spinner /></Card>}

      {result && (
        <>
          <SuccessAlert message="Post generated successfully!" />
          <Card className="p-6 space-y-4">
            <h3 className="font-medium text-gray-900">Primary Post</h3>
            <PostResultCard content={result.primary} />
          </Card>

          {result.variations.length > 0 && (
            <Card className="p-6 space-y-4">
              <h3 className="font-medium text-gray-900">Variations</h3>
              <div className="space-y-3">
                {result.variations.map((v, i) => (
                  <VariationCard key={i} content={v} index={i} />
                ))}
              </div>
            </Card>
          )}

          <Card className="p-6 space-y-4">
            <h3 className="font-medium text-gray-900">Suggested Hashtags</h3>
            <HashtagList hashtags={result.hashtags} />
          </Card>
        </>
      )}
    </div>
  );
}
