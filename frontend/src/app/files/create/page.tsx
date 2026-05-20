'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import ErrorAlert from '@/components/ui/ErrorAlert';
import SuccessAlert from '@/components/ui/SuccessAlert';
import Button from '@/components/ui/Button';
import FileUploadForm from '@/components/files/FileUploadForm';
import { createFile } from '@/services/files.service';

export default function CreateFilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const handleSubmit = async (data: {
    name: string;
    type: string;
    size: number;
    url: string;
    tags: string[];
  }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await createFile({
        name: data.name,
        type: data.type as any,
        size: data.size,
        url: data.url,
        tags: data.tags,
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload File</h2>
        <p className="text-sm text-gray-500 mb-4">
          Select a file from your computer. The file name, type, and size will be detected automatically.
        </p>
        <FileUploadForm onSubmit={handleSubmit} loading={loading} />
      </Card>

      {error && <ErrorAlert message={error} onRetry={() => setError(null)} />}

      {createdId && (
        <SuccessAlert message="File uploaded successfully" />
      )}

      {createdId && (
        <Card className="p-4 text-center">
          <p className="text-sm text-gray-600 mb-3">
            File ID: <code className="bg-gray-100 px-2 py-0.5 rounded text-lyra-700 text-xs">{createdId}</code>
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push(`/files/${createdId}`)}
          >
            View file details
          </Button>
        </Card>
      )}
    </div>
  );
}
