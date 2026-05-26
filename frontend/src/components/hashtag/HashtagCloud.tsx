export default function HashtagCloud({ hashtags }: { hashtags: string[] }) {
  if (!hashtags.length) return null;
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {hashtags.map((tag, i) => {
        const colors = [
          'border-neon-violet/30 text-neon-violet bg-neon-violet/5',
          'border-neon-cyan/30 text-neon-cyan bg-neon-cyan/5',
          'border-neon-pink/30 text-neon-pink bg-neon-pink/5',
        ];
        const color = colors[i % colors.length];
        return (
          <span
            key={tag}
            className={`inline-flex items-center px-4 py-2 rounded-full font-medium border ${color} text-sm hover:scale-105 transition-all cursor-default`}
          >
            {tag}
          </span>
        );
      })}
    </div>
  );
}
