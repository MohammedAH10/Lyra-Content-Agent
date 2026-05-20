'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { TONES, TONE_LABELS } from '@/utils/constants';

interface PostFormData {
  prompt: string;
  tone: string;
  variations: number;
}

export default function PostGeneratorForm({
  onSubmit,
  loading,
}: {
  onSubmit: (data: PostFormData) => void;
  loading: boolean;
}) {
  const [form, setForm] = useState<PostFormData>({
    prompt: '',
    tone: 'professional',
    variations: 3,
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.prompt.trim().length < 10) {
      setError('Prompt must be at least 10 characters');
      return;
    }
    setError('');
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="What do you want to post about?"
        placeholder="Write a post about our new AI-powered analytics dashboard..."
        value={form.prompt}
        onChange={(e) => setForm({ ...form, prompt: e.target.value })}
        error={error}
      />
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Tone"
          value={form.tone}
          onChange={(e) => setForm({ ...form, tone: e.target.value })}
          options={TONES.map((t) => ({ value: t, label: TONE_LABELS[t] }))}
        />
        <Input
          label="Variations"
          type="number"
          min={1}
          max={5}
          value={form.variations}
          onChange={(e) => setForm({ ...form, variations: parseInt(e.target.value) || 3 })}
        />
      </div>
      <Button type="submit" loading={loading} className="w-full">
        Generate Post
      </Button>
    </form>
  );
}
