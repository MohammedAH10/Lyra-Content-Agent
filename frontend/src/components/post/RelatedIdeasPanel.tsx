'use client';

import { useComposerStore } from '@/store/postComposer.store';
import Card from '@/components/ui/Card';

export default function RelatedIdeasPanel() {
  const { result } = useComposerStore();

  if (!result || result.relatedIdeas.length === 0) return null;

  return (
    <Card className="mb-4">
      <h3 className="text-sm font-semibold text-neon-violet uppercase tracking-widest mb-3">
        Related Ideas
      </h3>
      <ul className="space-y-2">
        {result.relatedIdeas.map((idea, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-on-surface">
            <span className="text-neon-pink mt-0.5 flex-shrink-0">&#9989;</span>
            <span>{idea}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
