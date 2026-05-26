export function PostResultCard({ content }: { content: string }) {
  return (
    <div className="glass-card rounded-xl p-4">
      <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
  );
}

export function VariationCard({ content, index }: { content: string; index: number }) {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-medium text-text-muted">Variant {index + 1}</span>
      </div>
      <p className="text-sm text-on-surface leading-relaxed">{content}</p>
    </div>
  );
}

export function HashtagList({ hashtags }: { hashtags: string[] }) {
  if (!hashtags.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {hashtags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border border-neon-violet/30 text-neon-violet bg-neon-violet/5"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
