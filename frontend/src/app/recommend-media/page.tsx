'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import ErrorAlert from '@/components/ui/ErrorAlert';
import EmptyState from '@/components/ui/EmptyState';
import MediaRecommenderForm from '@/components/media/MediaRecommenderForm';
import MediaRecommendationGrid from '@/components/media/MediaRecommendationGrid';
import { recommendMedia } from '@/services/ai.service';
import type { ScoredRecommendation } from '@/types';

function RecommendMediaContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || undefined;

  const [recommendations, setRecommendations] = useState<ScoredRecommendation[]>([]);
  const [noResultReason, setNoResultReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (content: string) => {
    setLoading(true);
    setError(null);
    setRecommendations([]);
    setNoResultReason(null);
    try {
      const res = await recommendMedia(content);
      if (res.success && res.data) {
        setRecommendations(res.data.recommendations);
        setNoResultReason(res.data.noResultReason);
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
    <div className="max-w-3xl mx-auto space-y-stack-lg">
      <Card>
        <h2 className="font-sora text-headline-lg text-on-surface mb-4">Find Matching Media</h2>
        <p className="text-sm text-text-muted mb-4">
          Describe your post content and we&apos;ll find approved media files that match.
        </p>
        <MediaRecommenderForm onSubmit={handleSubmit} loading={loading} initialValue={queryParam} />
      </Card>

      {error && <ErrorAlert message={error} onRetry={() => setError(null)} />}

      {loading && <Card><Spinner /></Card>}

      {!loading && recommendations.length === 0 && noResultReason && (
        <Card>
          <EmptyState
            title={noResultReason === 'No approved media files are available in the library.'
              ? 'No Media Available'
              : 'No Matches Found'}
            description={noResultReason}
          />
        </Card>
      )}

      {recommendations.length > 0 && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-on-surface">Recommended Media</h3>
            <span className="text-sm text-text-muted">{recommendations.length} files matched</span>
          </div>
          <MediaRecommendationGrid recommendations={recommendations} />
        </Card>
      )}
    </div>
  );
}

export default function RecommendMediaPage() {
  return (
    <Suspense fallback={
      <div className="max-w-3xl mx-auto space-y-stack-lg">
        <Card><Spinner /></Card>
      </div>
    }>
      <RecommendMediaContent />
    </Suspense>
  );
}
