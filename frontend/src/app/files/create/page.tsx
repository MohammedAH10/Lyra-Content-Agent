'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import ErrorAlert from '@/components/ui/ErrorAlert';
import SuccessAlert from '@/components/ui/SuccessAlert';
import FileUploadForm from '@/components/files/FileUploadForm';
import { createFile } from '@/services/files.service';

export default function CreateFilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const handleSubmit = async (data: { name: string; type: string; size: string; url: string; tags: string }) => {
    setLoading(true);
    setError(null);
    try {
      const tags = data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
      const res = await createFile({
        name: data.name,
        type: data.type as any,
        size: parseInt(data.size),
        url: data.url,
        tags,
      });
      if (res.success && res.data) {
        setCreatedId(res.data.id);
      } else {
        setError(res.error?.message || 'Failed to create file');
      }
    } catch (err: any) {
      setError(err?.error?.message || err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Create File Record</h2>
        <p className="text-sm text-gray-500 mb-4">Simulate uploading a file to S3. The file enters with status &quot;upload_initiated&quot;.</p>
        <FileUploadForm onSubmit={handleSubmit} loading={loading} />
      </Card>

      {error && <ErrorAlert message={error} onRetry={() => setError(null)} />}

      {createdId && (
        <SuccessAlert message={`File created successfully!`} />
      )}

      {createdId && (
        <Card className="p-4 text-center">
          <p className="text-sm text-gray-600 mb-3">File ID: <code className="bg-gray-100 px-2 py-0.5 rounded text-lyra-700">{createdId}</code></p>
          <button
            onClick={() => router.push(`/files/${createdId}`)}
            className="text-sm font-medium text-lyra-600 hover:text-lyra-800"
          >
            View file details →
          </button>
        </Card>
      )}
    </div>
  );
}
