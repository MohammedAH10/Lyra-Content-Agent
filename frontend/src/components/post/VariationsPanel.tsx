'use client';

import { useComposerStore } from '@/store/postComposer.store';
import Card from '@/components/ui/Card';
import { cn } from '@/utils/formatters';

export default function VariationsPanel() {
  const { result, selectedVariationLabel, setSelectedVariation } = useComposerStore();

  if (!result || result.variations.length === 0) return null;

  return (
    <Card className="mb-4">
      <h3 className="text-sm font-semibold text-neon-violet uppercase tracking-widest mb-3">
        Variations
      </h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {result.variations.map((v) => (
          <button
            key={v.label}
            onClick={() => setSelectedVariation(v.label)}
            className={cn(
              'text-left rounded-xl p-4 border transition-all',
              selectedVariationLabel === v.label
                ? 'border-neon-cyan bg-neon-cyan/10'
                : 'border-glass-border bg-black/20 hover:border-neon-cyan/30',
            )}
          >
            <span className="text-xs font-bold uppercase tracking-wider text-neon-cyan mb-1 block">
              {v.label}
            </span>
            <p className="text-sm text-text-muted line-clamp-4">{v.content}</p>
          </button>
        ))}
      </div>
    </Card>
  );
}
