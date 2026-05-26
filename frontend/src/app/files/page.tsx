'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import ErrorAlert from '@/components/ui/ErrorAlert';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import FileTable from '@/components/files/FileTable';
import FileFilterBar from '@/components/files/FileFilterBar';
import { fetchFiles } from '@/services/files.service';
import type { FileRecord } from '@/types';

export default function FilesPage() {
  const router = useRouter();
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');

  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: { type?: string; status?: string } = {};
      if (type) params.type = type;
      if (status) params.status = status;
      const res = await fetchFiles(params);
      if (res.success && res.data) {
        setFiles(res.data);
        setCount(res.count);
      } else {
        setError(res.error?.message || 'Failed to load files');
      }
    } catch (err: any) {
      setError(err?.error?.message || err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [type, status]);

  useEffect(() => { loadFiles(); }, [loadFiles]);

  return (
    <div className="space-y-stack-lg">
      <Card>
        <FileFilterBar
          type={type}
          status={status}
          onTypeChange={setType}
          onStatusChange={setStatus}
          onCreateNew={() => router.push('/files/create')}
        />
      </Card>

      {error && <ErrorAlert message={error} onRetry={loadFiles} />}

      {loading && <Card><Spinner /></Card>}

      {!loading && files.length === 0 && (
        <Card>
          <EmptyState
            title="No files found"
            description={type || status ? 'Try changing your filters.' : 'Upload your first file to get started.'}
            action={
              <Button onClick={() => router.push('/files/create')}>Upload File</Button>
            }
          />
        </Card>
      )}

      {!loading && files.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-text-muted">{count} file{count !== 1 ? 's' : ''} found</p>
          </div>
          <FileTable files={files} />
        </Card>
      )}
    </div>
  );
}
