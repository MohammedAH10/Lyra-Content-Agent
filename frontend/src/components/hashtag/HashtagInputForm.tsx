'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import TextArea from '@/components/ui/TextArea';

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
      <TextArea
        label="Paste your post content"
        placeholder="We are launching a revolutionary new cloud platform that helps teams collaborate in real-time..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        error={error}
      />
      <Button type="submit" loading={loading} className="w-full">
        Suggest Hashtags
      </Button>
    </form>
  );
}
