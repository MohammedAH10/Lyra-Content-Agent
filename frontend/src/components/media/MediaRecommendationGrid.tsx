import type { MediaRecommendation } from '@/types';
import MediaCard from './MediaCard';

export default function MediaRecommendationGrid({
  recommendations,
}: {
  recommendations: MediaRecommendation[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {recommendations.map((rec, i) => (
        <MediaCard key={`${rec.file.id}-${i}`} recommendation={rec} />
      ))}
    </div>
  );
}
