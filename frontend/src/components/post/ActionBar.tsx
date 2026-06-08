'use client';

import { useState } from 'react';
import { useComposerStore } from '@/store/postComposer.store';
import Button from '@/components/ui/Button';

interface ActionBarProps {
  onRegenerate: (instructions?: string) => void;
  onAccept: () => void;
}

export default function ActionBar({ onRegenerate, onAccept }: ActionBarProps) {
  const {
    result,
    editedContent,
    isEditing,
    setEditing,
    setEditedContent,
    regenerating,
    accepting,
    error,
  } = useComposerStore();

  const [showInstructions, setShowInstructions] = useState(false);
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  if (!result) return null;

  const handleRegenerate = () => {
    onRegenerate(additionalInstructions || undefined);
    setShowInstructions(false);
    setAdditionalInstructions('');
  };

  return (
    <div className="space-y-3">
      {/* Inline edit controls */}
      {isEditing && (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setEditing(false);
              setEditedContent(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setEditing(false)}
          >
            Done Editing
          </Button>
        </div>
      )}

      {/* Main action buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          size="sm"
          loading={regenerating}
          onClick={() => setShowInstructions(!showInstructions)}
        >
          &#x21bb; Regenerate
        </Button>
        <Button
          variant="primary"
          size="sm"
          loading={accepting}
          onClick={onAccept}
        >
          &#10003; Accept
        </Button>
      </div>

      {/* Regenerate instructions input */}
      {showInstructions && (
        <div className="glass-card rounded-xl p-4 space-y-2">
          <label className="text-xs font-semibold text-neon-violet uppercase tracking-widest">
            Additional Instructions (optional)
          </label>
          <textarea
            className="w-full bg-black/40 border border-glass-border rounded-xl p-3 text-sm text-on-surface focus:outline-none focus:border-neon-cyan/50 min-h-[60px] resize-y"
            placeholder="e.g. Make it more formal, add a call to action..."
            value={additionalInstructions}
            onChange={(e) => setAdditionalInstructions(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowInstructions(false);
                setAdditionalInstructions('');
              }}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleRegenerate}>
              Regenerate
            </Button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-error mt-1">{error}</p>
      )}
    </div>
  );
}
