import type { ScoredRecommendation } from '@/types';
import MediaCard from './MediaCard';

export default function MediaRecommendationGrid({
  recommendations,
}: {
  recommendations: ScoredRecommendation[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {recommendations.map((rec, i) => (
        <MediaCard key={`${rec.fileId}-${i}`} recommendation={rec} />
      ))}
    </div>
  );
}
