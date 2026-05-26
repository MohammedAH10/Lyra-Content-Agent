'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-label-sm text-neon-violet uppercase tracking-widest ml-1">The Prompt</label>
        <textarea
          className="w-full min-h-[150px] bg-black/40 border border-glass-border rounded-2xl p-5 font-body-lg text-on-surface placeholder:text-text-muted/50 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/30 transition-all resize-none"
          placeholder="What do you want to post about? Describe your topic, goal, or share a rough draft..."
          value={form.prompt}
          onChange={(e) => setForm({ ...form, prompt: e.target.value })}
        />
        {error && <p className="text-sm text-error ml-1">{error}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-label-sm text-neon-violet uppercase tracking-widest ml-1">Variations</label>
            <span className="text-body-md text-neon-cyan font-bold">{form.variations}</span>
          </div>
          <div className="px-1">
            <input
              type="range"
              min={1}
              max={5}
              value={form.variations}
              onChange={(e) => setForm({ ...form, variations: parseInt(e.target.value) || 3 })}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-neon-cyan"
            />
            <div className="flex justify-between text-[10px] text-text-muted mt-2 font-label-sm">
              <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-label-sm text-neon-violet uppercase tracking-widest ml-1">Engine Tone</label>
          <div className="flex flex-wrap gap-2">
            {TONES.map((tone) => (
              <button
                key={tone}
                type="button"
                onClick={() => setForm({ ...form, tone })}
                className={`px-4 py-2 rounded-full border transition-all text-xs font-label-sm ${
                  form.tone === tone
                    ? 'border-neon-cyan bg-neon-cyan/10 text-neon-cyan'
                    : 'border-glass-border text-text-muted hover:border-neon-cyan/50'
                }`}
              >
                {TONE_LABELS[tone]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button type="submit" loading={loading} className="w-full md:w-auto px-12 py-4 text-lg gap-3">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
        Generate Post
      </Button>
    </form>
  );
}
