'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import ErrorAlert from '@/components/ui/ErrorAlert';
import SuccessAlert from '@/components/ui/SuccessAlert';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import FileUploadForm from '@/components/files/FileUploadForm';
import FileStatusBadge from '@/components/files/FileStatusBadge';
import { createFile, updateFileStatus } from '@/services/files.service';
import { formatFileSize } from '@/utils/formatters';
import type { FileRecord, FileType } from '@/types';
import { upload } from '@vercel/blob/client';

export default function CreateFilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [file, setFile] = useState<FileRecord | null>(null);

  const handleSubmit = async (data: {
    name: string;
    type: FileType;
    size: number;
    tags: string[];
    file: File;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const blob = await upload(`media/${data.name}`, data.file, {
        access: 'public',
        handleUploadUrl: '/blob-upload',
      });

      const res = await createFile({
        name: data.name,
        type: data.type,
        size: data.size,
        url: blob.url,
        tags: data.tags,
      });
      if (res.success && res.data) {
        setFile(res.data);
        setRejectReason('');
        setShowRejectForm(false);
      } else {
        setError(res.error?.message || 'Failed to create file');
      }
    } catch (err: any) {
      setError(err?.error?.message || err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!file) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await updateFileStatus(file.id, { status: 'approved' });
      if (res.success && res.data) {
        setFile(res.data);
      } else {
        setActionError(res.error?.message || 'Failed to approve file');
      }
    } catch (err: any) {
      setActionError(err?.error?.message || err?.message || 'Failed to approve file');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!file) return;
    if (!rejectReason.trim()) {
      setActionError('Rejection reason is required');
      return;
    }
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await updateFileStatus(file.id, {
        status: 'rejected',
        moderationReason: rejectReason,
      });
      if (res.success && res.data) {
        setFile(res.data);
        setShowRejectForm(false);
      } else {
        setActionError(res.error?.message || 'Failed to reject file');
      }
    } catch (err: any) {
      setActionError(err?.error?.message || err?.message || 'Failed to reject file');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload File</h2>
        <p className="text-sm text-gray-500 mb-4">
          Select a file and enter the name you want stored. The original extension and file size are detected automatically.
        </p>
        <FileUploadForm onSubmit={handleSubmit} loading={loading} />
      </Card>

      {error && <ErrorAlert message={error} onRetry={() => setError(null)} />}

      {file && file.status === 'upload_initiated' && (
        <SuccessAlert message="File submitted. Review it before it becomes available for media recommendations." />
      )}

      {file && (
        <Card className="p-4 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-500 capitalize">{file.type} · {formatFileSize(file.size)}</p>
            </div>
            <FileStatusBadge status={file.status} />
          </div>

          {file.status === 'upload_initiated' && (
            <div className="space-y-3">
              {actionError && <ErrorAlert message={actionError} onRetry={() => setActionError(null)} />}
              <div className="flex gap-3">
                <Button onClick={handleApprove} loading={actionLoading} size="sm">
                  Approve
                </Button>
                <Button onClick={() => setShowRejectForm(!showRejectForm)} variant="danger" size="sm">
                  Reject
                </Button>
              </div>
              {showRejectForm && (
                <div className="space-y-3">
                  <Input
                    placeholder="Reason for rejection"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                  <Button onClick={handleReject} loading={actionLoading} variant="danger" size="sm">
                    Confirm Reject
                  </Button>
                </div>
              )}
            </div>
          )}

          {file.status === 'approved' && (
            <SuccessAlert message="File approved. It can now be used for media recommendations." />
          )}

          {file.status === 'rejected' && (
            <ErrorAlert message={`File rejected${file.moderationReason ? `: ${file.moderationReason}` : '.'}`} />
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push(`/files/${file.id}`)}
          >
            View file details
          </Button>
        </Card>
      )}
    </div>
  );
}
