import type { MediaRecommendation } from '@/types';
import { formatFileSize, formatDate } from '@/utils/formatters';

export default function MediaCard({ recommendation }: { recommendation: MediaRecommendation }) {
  const { file, score, matchReason } = recommendation;
  const typeIcons: Record<string, string> = {
    image: '🖼️',
    video: '🎬',
    audio: '🎵',
    document: '📄',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
          {typeIcons[file.type] || '📁'}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate">{file.name}</h4>
          <p className="text-xs text-gray-500 mt-0.5">
            {file.type} · {formatFileSize(file.size)}
          </p>
          {file.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {file.tags.map((tag) => (
                <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-lg font-bold text-lyra-600">{score}</div>
          <div className="text-xs text-gray-400">score</div>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
        {matchReason}
      </p>
      <p className="text-xs text-gray-400 mt-1">Uploaded {formatDate(file.uploadDate)}</p>
    </div>
  );
}
