'use client';

import { useEffect } from 'react';
import { useComposerStore } from '@/store/postComposer.store';
import {
  generatePost as apiGeneratePost,
  regeneratePost as apiRegeneratePost,
  createDraft,
  acceptDraft,
} from '@/services/ai.service';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import ErrorAlert from '@/components/ui/ErrorAlert';
import GeneratedContent from '@/components/post/GeneratedContent';
import VariationsPanel from '@/components/post/VariationsPanel';
import ImprovementsPanel from '@/components/post/ImprovementsPanel';
import RelatedIdeasPanel from '@/components/post/RelatedIdeasPanel';
import ActionBar from '@/components/post/ActionBar';
import AssetPicker from '@/components/files/AssetPicker';
import type { Tone, PostFormat } from '@/types';

const TONE_OPTIONS: { value: Tone; label: string }[] = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'excited', label: 'Excited' },
];

const FORMAT_OPTIONS: { value: PostFormat; label: string }[] = [
  { value: 'short', label: 'Short' },
  { value: 'long', label: 'Long' },
  { value: 'bullet', label: 'Bullet Points' },
];

export default function PostComposerPage() {
  const {
    topic,
    tone,
    format,
    result,
    generating,
    regenerating,
    accepting,
    error,
    attachedFiles,
    editedContent,
    isEditing,
    setTopic,
    setTone,
    setFormat,
    setResult,
    setGenerating,
    setRegenerating,
    setAccepting,
    setError,
    setCurrentDraft,
    setShowAssetPicker,
    addAttachedFile,
    removeAttachedFile,
    reset,
  } = useComposerStore();

  // Reset on mount
  useEffect(() => {
    reset();
  }, []);

  const handleGenerate = async () => {
    const trimmed = topic.trim();
    if (!trimmed) {
      setError('Please enter a topic');
      return;
    }

    setGenerating(true);
    setError(null);
    setResult(null);

    try {
      const res = await apiGeneratePost(trimmed, tone, format);
      if (res.success && res.data) {
        setResult(res.data);
      } else {
        setError(res.error?.message || 'Failed to generate post');
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerate = async (additionalInstructions?: string) => {
    if (!result) return;

    setRegenerating(true);
    setError(null);

    try {
      const currentContent = editedContent ?? result.content;
      const res = await apiRegeneratePost(
        currentContent,
        topic.trim(),
        tone,
        format,
        additionalInstructions,
      );
      if (res.success && res.data) {
        setResult(res.data);
      } else {
        setError(res.error?.message || 'Failed to regenerate');
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setRegenerating(false);
    }
  };

  const handleAccept = async () => {
    if (!result) return;

    setAccepting(true);
    setError(null);

    try {
      const finalContent = editedContent ?? result.content;
      const selectedLabel = useComposerStore.getState().selectedVariationLabel;

      // Create draft first
      const draftRes = await createDraft({
        userId: 'web-user',
        inputText: topic.trim(),
        tone,
        format,
        generatedContent: result,
      });

      if (!draftRes.success || !draftRes.data) {
        setError(draftRes.error?.message || 'Failed to save draft');
        return;
      }

      // Accept the draft
      const acceptRes = await acceptDraft(
        draftRes.data.id,
        finalContent,
        selectedLabel ?? undefined,
        'web-user',
      );

      if (acceptRes.success) {
        setCurrentDraft(acceptRes.data ?? null);
      } else {
        setError(acceptRes.error?.message || 'Failed to accept draft');
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setAccepting(false);
    }
  };

  const canGenerate = topic.trim().length > 0 && !generating;

  return (
    <div className="max-w-4xl mx-auto space-y-stack-lg">
      {/* Header */}
      <Card>
        <h2 className="font-sora text-headline-lg text-on-surface mb-6">Post Composer</h2>

        {/* Topic input */}
        <div className="mb-4">
          <label className="block text-label-sm text-neon-violet uppercase tracking-widest mb-1 ml-1">
            Topic / Content
          </label>
          <textarea
            className="w-full bg-black/40 border border-glass-border rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-text-muted/50 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/30 min-h-[80px] resize-y"
            placeholder="What do you want to post about?"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={generating || regenerating}
          />
        </div>

        {/* Tone + Format row */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-label-sm text-neon-violet uppercase tracking-widest mb-1 ml-1">
              Tone
            </label>
            <select
              className="w-full bg-black/40 border border-glass-border rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-neon-cyan/50"
              value={tone}
              onChange={(e) => setTone(e.target.value as Tone)}
              disabled={generating || regenerating}
            >
              {TONE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-label-sm text-neon-violet uppercase tracking-widest mb-1 ml-1">
              Format
            </label>
            <select
              className="w-full bg-black/40 border border-glass-border rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-neon-cyan/50"
              value={format}
              onChange={(e) => setFormat(e.target.value as PostFormat)}
              disabled={generating || regenerating}
            >
              {FORMAT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Attached files preview */}
        {attachedFiles.length > 0 && (
          <div className="mb-4">
            <label className="block text-label-sm text-neon-violet uppercase tracking-widest mb-1 ml-1">
              Attached Media ({attachedFiles.length})
            </label>
            <div className="flex flex-wrap gap-2">
              {attachedFiles.map((file) => (
                <span
                  key={file.id}
                  className="inline-flex items-center gap-1 glass-card rounded-lg px-2.5 py-1 text-xs text-on-surface border border-glass-border"
                >
                  {file.name}
                  <button
                    onClick={() => removeAttachedFile(file.id)}
                    className="text-text-muted hover:text-error ml-1"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button onClick={handleGenerate} disabled={!canGenerate} loading={generating}>
            Generate
          </Button>
          <Button variant="secondary" onClick={() => setShowAssetPicker(true)}>
            Attach Media
          </Button>
          {(result || error || attachedFiles.length > 0) && (
            <Button variant="ghost" onClick={reset}>
              Clear
            </Button>
          )}
        </div>
      </Card>

      {/* Loading state */}
      {generating && (
        <Card>
          <Spinner />
        </Card>
      )}

      {/* Error state */}
      {error && !generating && !regenerating && (
        <ErrorAlert
          message={error}
          onRetry={error === 'Please enter a topic' ? undefined : handleGenerate}
        />
      )}

      {/* Result area */}
      {result && !generating && (
        <>
          {/* Current draft accepted indicator */}
          {useComposerStore.getState().currentDraft && (
            <Card className="border-neon-cyan/30">
              <p className="text-sm text-neon-cyan">
                &#10003; Post accepted and saved as draft.
              </p>
            </Card>
          )}

          <GeneratedContent />
          <VariationsPanel />
          <ImprovementsPanel />
          <RelatedIdeasPanel />
          <ActionBar onRegenerate={handleRegenerate} onAccept={handleAccept} />
        </>
      )}

      {/* Asset picker modal */}
      <AssetPicker />
    </div>
  );
}
