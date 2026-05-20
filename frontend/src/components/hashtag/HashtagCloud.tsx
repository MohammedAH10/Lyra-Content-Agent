export default function HashtagCloud({ hashtags }: { hashtags: string[] }) {
  if (!hashtags.length) return null;
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {hashtags.map((tag, i) => {
        const sizes = ['text-sm', 'text-base', 'text-lg'];
        const size = sizes[i % sizes.length];
        return (
          <span
            key={tag}
            className={`inline-flex items-center px-4 py-2 rounded-full font-medium bg-gradient-to-r from-lyra-50 to-purple-50 text-lyra-700 border border-lyra-200 ${size}`}
          >
            {tag}
          </span>
        );
      })}
    </div>
  );
}
