'use client';

import { useEffect, useState, useCallback } from 'react';
import { useComposerStore } from '@/store/postComposer.store';
import { fetchFiles, recommendMedia } from '@/services/ai.service';
import type { FileRecord, ScoredRecommendation, FileType } from '@/types';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { formatFileSize } from '@/utils/formatters';

const FILE_TABS: { label: string; value: FileType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Images', value: 'image' },
  { label: 'Videos', value: 'video' },
  { label: 'Audio', value: 'audio' },
  { label: 'Documents', value: 'document' },
];

export default function AssetPicker() {
  const {
    showAssetPicker,
    setShowAssetPicker,
    attachedFiles,
    addAttachedFile,
    removeAttachedFile,
    recommendations,
    setRecommendations,
    recomNoResultReason,
    setGenerating,
    generating: isGenerating,
    topic,
  } = useComposerStore();

  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<FileType | 'all'>('all');
  const [error, setError] = useState<string | null>(null);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = { status: 'approved' };
      if (activeTab !== 'all') params.type = activeTab;
      const res = await fetchFiles(params);
      if (res.success && res.data) {
        setFiles(res.data);
      } else {
        setFiles([]);
        setError(res.error?.message ?? 'Failed to load files');
      }
    } catch {
      setError('Failed to load files');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  const loadRecommendations = useCallback(async () => {
    if (!topic.trim()) return;
    try {
      const res = await recommendMedia(topic);
      if (res.success && res.data) {
        setRecommendations(res.data.recommendations, res.data.noResultReason);
      }
    } catch {
      // silent
    }
  }, [topic, setRecommendations]);

  useEffect(() => {
    if (showAssetPicker) {
      loadFiles();
      loadRecommendations();
    }
  }, [showAssetPicker, loadFiles, loadRecommendations]);

  const isAttached = (id: string) => attachedFiles.some((f) => f.id === id);

  const previewUrl = (file: FileRecord) => {
    if (file.type === 'image') return file.url;
    return null;
  };

  if (!showAssetPicker) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-card rounded-2xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-glass-border">
          <h2 className="text-lg font-semibold text-on-surface">Attach Media</h2>
          <button
            onClick={() => setShowAssetPicker(false)}
            className="text-text-muted hover:text-on-surface text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Recommendation bar */}
        {recommendations.length > 0 && (
          <div className="px-4 py-3 border-b border-glass-border bg-neon-violet/5">
            <p className="text-xs font-semibold text-neon-violet uppercase tracking-widest mb-2">
              AI Recommended
            </p>
            <div className="flex flex-wrap gap-2">
              {recommendations.map((r: ScoredRecommendation) => (
                <button
                  key={r.fileId}
                  onClick={() => {
                    const file = files.find((f) => f.id === r.fileId);
                    if (file) {
                      if (isAttached(file.id)) removeAttachedFile(file.id);
                      else addAttachedFile(file);
                    }
                  }}
                  className="text-xs glass-card rounded-lg px-2.5 py-1.5 border border-glass-border hover:border-neon-cyan/50 transition-all"
                >
                  {r.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {recomNoResultReason && recommendations.length === 0 && (
          <div className="px-4 py-2 border-b border-glass-border">
            <p className="text-xs text-text-muted">{recomNoResultReason}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 px-4 py-3 border-b border-glass-border overflow-x-auto">
          {FILE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab.value
                  ? 'bg-neon-violet/20 text-neon-violet'
                  : 'text-text-muted hover:text-on-surface hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* File grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <Spinner />
          ) : error ? (
            <p className="text-sm text-error text-center py-8">{error}</p>
          ) : files.length === 0 ? (
            <EmptyState
              title="No files found"
              description="Upload files from the Library page first."
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {files.map((file) => (
                <button
                  key={file.id}
                  onClick={() => {
                    if (isAttached(file.id)) removeAttachedFile(file.id);
                    else addAttachedFile(file);
                  }}
                  className={`glass-card rounded-xl p-3 text-left border transition-all ${
                    isAttached(file.id)
                      ? 'border-neon-cyan bg-neon-cyan/10'
                      : 'border-glass-border hover:border-neon-cyan/30'
                  }`}
                >
                  {previewUrl(file) ? (
                    <img
                      src={previewUrl(file) as string}
                      alt={file.name}
                      className="w-full h-20 object-cover rounded-lg mb-2"
                    />
                  ) : (
                    <div className="w-full h-20 glass-card rounded-lg mb-2 flex items-center justify-center text-2xl text-text-muted">
                      {file.type === 'video' ? '&#9654;' : file.type === 'audio' ? '&#9835;' : '&#128196;'}
                    </div>
                  )}
                  <p className="text-xs font-medium text-on-surface truncate">{file.name}</p>
                  <p className="text-[10px] text-text-muted">{formatFileSize(file.size)}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-glass-border">
          <span className="text-xs text-text-muted">
            {attachedFiles.length} file{attachedFiles.length !== 1 ? 's' : ''} attached
          </span>
          <Button size="sm" onClick={() => setShowAssetPicker(false)}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
