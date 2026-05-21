'use client';

import { useState, useRef } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import type { FileType } from '@/types';

function getFileTypeFromName(name: string): FileType {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp'].includes(ext)) return 'image';
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return 'video';
  if (['mp3', 'wav', 'ogg', 'aac', 'flac'].includes(ext)) return 'audio';
  if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'].includes(ext)) return 'document';
  return 'document';
}

function getFileExtension(name: string): string {
  const index = name.lastIndexOf('.');
  if (index === -1 || index === name.length - 1) return '';
  return name.slice(index).toLowerCase();
}

function buildStoredName(displayName: string, originalName: string): string {
  const trimmed = displayName.trim();
  const ext = getFileExtension(originalName);
  const withoutExistingExt = ext && trimmed.toLowerCase().endsWith(ext)
    ? trimmed.slice(0, -ext.length)
    : trimmed;
  return `${withoutExistingExt}${ext}`.replace(/\s+/g, '-');
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function FileUploadForm({
  onSubmit,
  loading,
}: {
  onSubmit: (data: { name: string; type: FileType; size: number; url: string; tags: string[] }) => void;
  loading: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newName, setNewName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tags, setTags] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !selectedFile) return;

    const tagList = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const storedName = buildStoredName(newName, selectedFile.name);

    onSubmit({
      name: storedName,
      type: getFileTypeFromName(storedName),
      size: selectedFile.size,
      url: `https://s3.example.com/files/${encodeURIComponent(storedName)}`,
      tags: tagList,
    });
  };

  const storedName = selectedFile && newName.trim() ? buildStoredName(newName, selectedFile.name) : '';
  const type = storedName ? getFileTypeFromName(storedName) : undefined;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <Input
        label="New file name"
        placeholder="product launch"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          File
        </label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-lyra-400 hover:bg-lyra-50/50 transition-colors"
        >
          <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <p className="mt-2 text-sm text-gray-500">
            {selectedFile ? selectedFile.name : 'Click to select a file'}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="hidden"
          />
        </div>
      </div>

      <Input
        label="Tags (comma separated, optional)"
        placeholder="product, launch, marketing"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />

      {storedName && selectedFile && (
        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-1 border border-gray-200">
          <p>Stored name: <span className="text-gray-700">{storedName}</span></p>
          <p>Original extension: <span className="text-gray-700">{getFileExtension(selectedFile.name) || 'none'}</span></p>
          <p>Type: <span className="text-gray-700 capitalize">{type}</span></p>
          <p>Size: <span className="text-gray-700">{formatBytes(selectedFile.size)}</span></p>
        </div>
      )}

      <Button type="submit" loading={loading} disabled={!newName.trim() || !selectedFile} className="w-full">
        Submit for Review
      </Button>
    </form>
  );
}
