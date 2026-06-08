'use client';

import { useComposerStore } from '@/store/postComposer.store';
import Card from '@/components/ui/Card';

export default function ImprovementsPanel() {
  const { result } = useComposerStore();

  if (!result || result.improvements.length === 0) return null;

  return (
    <Card className="mb-4">
      <h3 className="text-sm font-semibold text-neon-violet uppercase tracking-widest mb-3">
        Improvements
      </h3>
      <ul className="space-y-2">
        {result.improvements.map((imp, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-on-surface">
            <span className="text-neon-cyan mt-0.5 flex-shrink-0">&#9654;</span>
            <span>{imp}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
