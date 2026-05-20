'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { FILE_TYPES } from '@/utils/constants';

export default function FileUploadForm({
  onSubmit,
  loading,
}: {
  onSubmit: (data: { name: string; type: string; size: string; url: string; tags: string }) => void;
  loading: boolean;
}) {
  const [form, setForm] = useState({
    name: '',
    type: 'image',
    size: '',
    url: '',
    tags: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <Input
        label="Filename"
        placeholder="product-launch.png"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />
      <Select
        label="File Type"
        value={form.type}
        onChange={(e) => setForm({ ...form, type: e.target.value })}
        options={FILE_TYPES.map((t) => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))}
      />
      <Input
        label="Size (bytes)"
        type="number"
        placeholder="204800"
        min={0}
        value={form.size}
        onChange={(e) => setForm({ ...form, size: e.target.value })}
        required
      />
      <Input
        label="Storage URL"
        placeholder="https://s3.example.com/files/product-launch.png"
        value={form.url}
        onChange={(e) => setForm({ ...form, url: e.target.value })}
        required
      />
      <Input
        label="Tags (comma separated)"
        placeholder="product, launch, marketing"
        value={form.tags}
        onChange={(e) => setForm({ ...form, tags: e.target.value })}
      />
      <Button type="submit" loading={loading} className="w-full">
        Create File Record
      </Button>
    </form>
  );
}
