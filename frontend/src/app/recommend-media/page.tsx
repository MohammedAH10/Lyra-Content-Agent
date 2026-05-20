'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import ErrorAlert from '@/components/ui/ErrorAlert';
import EmptyState from '@/components/ui/EmptyState';
import MediaRecommenderForm from '@/components/media/MediaRecommenderForm';
import MediaRecommendationGrid from '@/components/media/MediaRecommendationGrid';
import { recommendMedia } from '@/services/ai.service';
import type { MediaRecommendation } from '@/types';

export default function RecommendMediaPage() {
  const [recommendations, setRecommendations] = useState<MediaRecommendation[]>([]);
  const [message, setMessage] = useState<string | undefined>();
  const [totalMatched, setTotalMatched] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (content: string) => {
    setLoading(true);
    setError(null);
    setRecommendations([]);
    setMessage(undefined);
    try {
      const res = await recommendMedia(content);
      if (res.success && res.data) {
        setRecommendations(res.data.recommendations);
        setMessage(res.data.message);
        setTotalMatched(res.data.totalMatched);
      } else {
        setError(res.error?.message || 'Failed to find media');
      }
    } catch (err: any) {
      setError(err?.error?.message || err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Find Matching Media</h2>
        <p className="text-sm text-gray-500 mb-4">
          Describe your post content and we&apos;ll find approved media files that match.
        </p>
        <MediaRecommenderForm onSubmit={handleSubmit} loading={loading} />
      </Card>

      {error && <ErrorAlert message={error} onRetry={() => setError(null)} />}

      {loading && <Card className="p-6"><Spinner /></Card>}

      {!loading && recommendations.length === 0 && message && (
        <Card className="p-6">
          <EmptyState
            title={message === 'No approved media files are available in the library.'
              ? 'No Media Available'
              : 'No Matches Found'}
            description={message}
          />
        </Card>
      )}

      {recommendations.length > 0 && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Recommended Media</h3>
            <span className="text-sm text-gray-500">{totalMatched} files matched</span>
          </div>
          <MediaRecommendationGrid recommendations={recommendations} />
        </Card>
      )}
    </div>
  );
}
