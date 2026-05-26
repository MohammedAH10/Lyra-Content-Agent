'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import ErrorAlert from '@/components/ui/ErrorAlert';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import PostGeneratorForm from '@/components/post/PostGeneratorForm';
import { PostResultCard, VariationCard, HashtagList } from '@/components/post/PostComponents';
import MediaCard from '@/components/media/MediaCard';
import { generatePost, recommendMedia, suggestHashtags } from '@/services/ai.service';
import type { GeneratePostResult, MediaRecommendation } from '@/types';

type FlowStep = 'content' | 'media' | 'preview';

const steps: { id: FlowStep; label: string }[] = [
  { id: 'content', label: 'Post' },
  { id: 'media', label: 'Media' },
  { id: 'preview', label: 'Preview' },
];

function Stepper({ activeStep }: { activeStep: FlowStep }) {
  const activeIndex = steps.findIndex((step) => step.id === activeStep);

  return (
    <div className="flex gap-2">
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={[
            'flex-1 rounded-xl border px-4 py-3 text-sm font-medium text-center transition-all',
            index <= activeIndex
              ? 'border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan'
              : 'border-glass-border text-text-muted',
          ].join(' ')}
        >
          <span className="mr-2 text-neon-cyan font-bold">{index + 1}</span>
          {step.label}
        </div>
      ))}
    </div>
  );
}

function PreviewMedia({ recommendation }: { recommendation: MediaRecommendation | null }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (!recommendation) {
    return (
      <div className="h-56 rounded-xl border border-dashed border-glass-border bg-black/20 flex items-center justify-center text-sm text-text-muted">
        No media selected
      </div>
    );
  }

  const { file } = recommendation;
  const showImage = file.type === 'image' && !imageFailed;

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {showImage ? (
        <img
          src={file.url}
          alt={file.name}
          className="h-56 w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="h-56 bg-black/30 flex items-center justify-center text-text-muted">
          <span className="material-symbols-outlined text-5xl">image</span>
        </div>
      )}
      <div className="p-4">
        <p className="font-medium text-on-surface">{file.name}</p>
        <p className="text-sm text-text-muted capitalize">{file.type}</p>
      </div>
    </div>
  );
}

export default function GeneratePostPage() {
  const [step, setStep] = useState<FlowStep>('content');
  const [result, setResult] = useState<GeneratePostResult | null>(null);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<MediaRecommendation[]>([]);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const [mediaMessage, setMediaMessage] = useState<string | undefined>();
  const [contentLoading, setContentLoading] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedMedia =
    recommendations.find((rec) => rec.file.id === selectedMediaId) || recommendations[0] || null;

  const handleGenerateContent = async (data: { prompt: string; tone: string; variations: number }) => {
    setContentLoading(true);
    setError(null);
    setResult(null);
    setHashtags([]);
    setRecommendations([]);
    setSelectedMediaId(null);
    setMediaMessage(undefined);
    setStep('content');

    try {
      const postRes = await generatePost(data.prompt, data.tone as any, data.variations);
      if (!postRes.success || !postRes.data) {
        setError(postRes.error?.message || 'Failed to generate post');
        return;
      }

      const hashtagRes = await suggestHashtags(postRes.data.primary);
      if (!hashtagRes.success || !hashtagRes.data) {
        setError(hashtagRes.error?.message || 'Failed to generate hashtags');
        return;
      }

      setResult(postRes.data);
      setHashtags(hashtagRes.data.hashtags);
    } catch (err: any) {
      setError(err?.error?.message || err?.message || 'Something went wrong');
    } finally {
      setContentLoading(false);
    }
  };

  const handleRecommendMedia = async () => {
    if (!result?.primary) return;

    setStep('media');
    setMediaLoading(true);
    setError(null);
    setRecommendations([]);
    setSelectedMediaId(null);
    setMediaMessage(undefined);

    try {
      const mediaRes = await recommendMedia(result.primary);
      if (mediaRes.success && mediaRes.data) {
        setRecommendations(mediaRes.data.recommendations);
        setSelectedMediaId(mediaRes.data.recommendations[0]?.file.id || null);
        setMediaMessage(mediaRes.data.message);
      } else {
        setError(mediaRes.error?.message || 'Failed to recommend media');
      }
    } catch (err: any) {
      setError(err?.error?.message || err?.message || 'Something went wrong');
    } finally {
      setMediaLoading(false);
    }
  };

  const resetFlow = () => {
    setStep('content');
    setResult(null);
    setHashtags([]);
    setRecommendations([]);
    setSelectedMediaId(null);
    setMediaMessage(undefined);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-stack-lg">
      <Stepper activeStep={step} />

      {step === 'content' && (
        <>
          <Card>
            <h2 className="font-sora text-headline-lg text-on-surface mb-4">Create Post</h2>
            <PostGeneratorForm onSubmit={handleGenerateContent} loading={contentLoading} />
          </Card>

          {error && <ErrorAlert message={error} onRetry={() => setError(null)} />}
          {contentLoading && <Card><Spinner /></Card>}

          {result && (
            <Card className="space-y-5">
              <div>
                <h3 className="font-medium text-on-surface mb-3">Generated Post</h3>
                <PostResultCard content={result.primary} />
              </div>

              <div>
                <h3 className="font-medium text-on-surface mb-3">Generated Hashtags</h3>
                <HashtagList hashtags={hashtags} />
              </div>

              {result.variations.length > 0 && (
                <div>
                  <h3 className="font-medium text-on-surface mb-3">Variations</h3>
                  <div className="space-y-3">
                    {result.variations.map((variation, index) => (
                      <VariationCard key={index} content={variation} index={index} />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button onClick={handleRecommendMedia}>Next: Recommend Media</Button>
              </div>
            </Card>
          )}
        </>
      )}

      {step === 'media' && (
        <>
          <Card className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-sora text-headline-lg text-on-surface">Recommended Media</h2>
                <p className="text-sm text-text-muted mt-1">Choose one media item for the final preview.</p>
              </div>
              <Button variant="secondary" onClick={() => setStep('content')}>Back</Button>
            </div>

            {mediaLoading && <Spinner />}

            {!mediaLoading && recommendations.length === 0 && (
              <EmptyState
                title="No Media Selected"
                description={mediaMessage || 'No approved media matched this post. You can still preview the post without media.'}
              />
            )}

            {!mediaLoading && recommendations.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((recommendation) => {
                  const isSelected = selectedMedia?.file.id === recommendation.file.id;
                  return (
                    <button
                      key={recommendation.file.id}
                      type="button"
                      onClick={() => setSelectedMediaId(recommendation.file.id)}
                      className={[
                        'text-left rounded-2xl transition-all hover:scale-[1.02]',
                        isSelected ? 'ring-2 ring-neon-cyan' : '',
                      ].join(' ')}
                    >
                      <MediaCard recommendation={recommendation} />
                    </button>
                  );
                })}
              </div>
            )}

            {error && <ErrorAlert message={error} onRetry={() => setError(null)} />}

            <div className="flex justify-between pt-2">
              <Button variant="secondary" onClick={() => setStep('content')}>Previous</Button>
              <Button onClick={() => setStep('preview')} disabled={mediaLoading}>
                Next: Preview
              </Button>
            </div>
          </Card>
        </>
      )}

      {step === 'preview' && result && (
        <Card className="space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-sora text-headline-lg text-on-surface">Post Preview</h2>
              <p className="text-sm text-text-muted mt-1">Final content layout with selected media and hashtags.</p>
            </div>
            <Button variant="secondary" onClick={() => setStep('media')}>Back</Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-6">
            <PreviewMedia recommendation={selectedMedia} />
            <div className="space-y-4">
              <PostResultCard content={result.primary} />
              <HashtagList hashtags={hashtags} />
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="secondary" onClick={() => setStep('media')}>Previous</Button>
            <Button onClick={resetFlow}>Create Another Post</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
