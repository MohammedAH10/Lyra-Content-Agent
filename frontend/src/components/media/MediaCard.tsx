'use client';

import { useState } from 'react';
import type { MediaRecommendation } from '@/types';
import { formatFileSize, formatDate } from '@/utils/formatters';

export default function MediaCard({ recommendation }: { recommendation: MediaRecommendation }) {
  const { file, score, matchReason } = recommendation;
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = file.type === 'image' && !imageFailed;

  return (
    <div className="glass-card rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-500 group">
      {showImage ? (
        <div className="relative aspect-video">
          <img
            src={file.url}
            alt={file.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={() => setImageFailed(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-neon-cyan/20 backdrop-blur-md border border-neon-cyan text-neon-cyan font-bold text-label-sm flex items-center gap-1">
            {score}% Match
          </div>
        </div>
      ) : (
        <div className="h-32 bg-black/30 flex items-center justify-center text-text-muted">
          <span className="text-3xl font-bold">[image]</span>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-on-surface truncate">{file.name}</h4>
            <p className="text-xs text-text-muted mt-0.5">
              {file.type} / {formatFileSize(file.size)}
            </p>
            {file.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {file.tags.map((tag) => (
                  <span key={tag} className="text-xs glass-card px-2 py-0.5 rounded text-text-muted">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="text-right flex-shrink-0 ml-3">
            <div className="text-lg font-bold text-neon-cyan">{score}</div>
            <div className="text-xs text-text-muted">score</div>
          </div>
        </div>
        <p className="text-xs text-text-muted mt-3 pt-3 border-t border-glass-border">
          {matchReason}
        </p>
        <p className="text-xs text-text-muted/60 mt-1">Uploaded {formatDate(file.uploadDate)}</p>
      </div>
    </div>
  );
}
