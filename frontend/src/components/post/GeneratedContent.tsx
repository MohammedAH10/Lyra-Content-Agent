'use client';

import { useComposerStore } from '@/store/postComposer.store';
import Card from '@/components/ui/Card';

export default function GeneratedContent() {
  const {
    result,
    selectedVariationLabel,
    editedContent,
    isEditing,
    setEditedContent,
    setEditing,
  } = useComposerStore();

  if (!result) return null;

  const displayContent = (() => {
    if (editedContent !== null) return editedContent;
    if (selectedVariationLabel) {
      const found = result.variations.find((v) => v.label === selectedVariationLabel);
      if (found) return found.content;
    }
    return result.content;
  })();

  if (isEditing) {
    return (
      <Card className="mb-4">
        <h3 className="text-sm font-semibold text-neon-violet uppercase tracking-widest mb-3">
          Editing Content
        </h3>
        <textarea
          className="w-full bg-black/40 border border-glass-border rounded-xl p-4 text-sm text-on-surface focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/30 min-h-[200px] resize-y"
          value={displayContent}
          onChange={(e) => setEditedContent(e.target.value)}
        />
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-neon-violet uppercase tracking-widest">
          {selectedVariationLabel
            ? `Variation: ${selectedVariationLabel}`
            : 'Generated Content'}
        </h3>
        {result.fallbackUsed && (
          <span className="text-[10px] uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
            Fallback
          </span>
        )}
      </div>
      <p className="text-sm text-on-surface whitespace-pre-wrap leading-relaxed">
        {displayContent}
      </p>
      <button
        onClick={() => setEditing(true)}
        className="mt-3 text-xs font-medium text-neon-cyan hover:brightness-125 transition-all"
      >
        &#9998; Edit
      </button>
    </Card>
  );
}
