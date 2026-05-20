export function PostResultCard({ content }: { content: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
  );
}

export function VariationCard({ content, index }: { content: string; index: number }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-medium text-gray-400">Variant {index + 1}</span>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{content}</p>
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
          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-lyra-50 text-lyra-700"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
