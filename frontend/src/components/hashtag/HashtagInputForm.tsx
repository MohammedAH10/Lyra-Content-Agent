'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';

export default function HashtagInputForm({
  onSubmit,
  loading,
}: {
  onSubmit: (content: string) => void;
  loading: boolean;
}) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Post content is required');
      return;
    }
    setError('');
    onSubmit(content);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-label-sm text-neon-violet uppercase tracking-widest ml-1">Post Content</label>
        <textarea
          className="w-full h-40 bg-black/30 border border-glass-border rounded-2xl p-5 font-body-md text-on-surface placeholder:text-text-muted/50 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all resize-none"
          placeholder="Paste your post caption or content here... Amiri will analyze the core themes and sentiment to generate the most effective hashtags for maximum engagement."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        {error && <p className="text-sm text-error ml-1">{error}</p>}
      </div>
      <div className="flex gap-3">
        <Button type="submit" loading={loading}>
          Generate Tags
        </Button>
      </div>
    </form>
  );
}
