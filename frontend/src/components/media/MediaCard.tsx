import type { MediaRecommendation } from '@/types';
import { formatFileSize, formatDate } from '@/utils/formatters';
import { Icon } from '@/components/ui/Icons';

export default function MediaCard({ recommendation }: { recommendation: MediaRecommendation }) {
  const { file, score, matchReason } = recommendation;
  const typeColors: Record<string, string> = {
    image: 'bg-blue-100 text-blue-600',
    video: 'bg-purple-100 text-purple-600',
    audio: 'bg-green-100 text-green-600',
    document: 'bg-amber-100 text-amber-600',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColors[file.type] || 'bg-gray-100 text-gray-600'}`}>
          <Icon name={file.type === 'document' ? 'folder' : 'image'} className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate">{file.name}</h4>
          <p className="text-xs text-gray-500 mt-0.5">
            {file.type} / {formatFileSize(file.size)}
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
