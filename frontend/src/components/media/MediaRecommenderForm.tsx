'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';

export default function MediaRecommenderForm({
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
    if (content.trim().length < 10) {
      setError('Post content must be at least 10 characters');
      return;
    }
    setError('');
    onSubmit(content);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-label-sm text-neon-violet uppercase tracking-widest ml-1">Describe your post content</label>
        <textarea
          className="w-full h-32 bg-black/30 border border-glass-border rounded-2xl p-5 font-body-md text-on-surface placeholder:text-text-muted/50 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all resize-none"
          placeholder="Product launch marketing campaign announcement for new cloud platform..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        {error && <p className="text-sm text-error ml-1">{error}</p>}
      </div>
      <Button type="submit" loading={loading}>
        Find Matching Media
      </Button>
    </form>
  );
}
