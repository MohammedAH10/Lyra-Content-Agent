'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import TextArea from '@/components/ui/TextArea';

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
      <TextArea
        label="Describe your post content"
        placeholder="Product launch marketing campaign announcement for new cloud platform..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        error={error}
      />
      <Button type="submit" loading={loading} className="w-full">
        Find Matching Media
      </Button>
    </form>
  );
}
