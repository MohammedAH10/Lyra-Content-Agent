'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import ErrorAlert from '@/components/ui/ErrorAlert';
import SuccessAlert from '@/components/ui/SuccessAlert';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import FileStatusBadge from '@/components/files/FileStatusBadge';
import { fetchFileById, updateFileStatus } from '@/services/files.service';
import { formatFileSize, formatDate } from '@/utils/formatters';
import type { FileRecord } from '@/types';

export default function FileDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [file, setFile] = useState<FileRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadFile = async () => {
      try {
        const res = await fetchFileById(params.id as string);
        if (res.success && res.data) {
          setFile(res.data);
        } else {
          setError(res.error?.message || 'File not found');
        }
      } catch {
        setError('Failed to load file');
      } finally {
        setLoading(false);
      }
    };
    loadFile();
  }, [params.id]);

  const handleApprove = async () => {
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await updateFileStatus(params.id as string, { status: 'approved' });
      if (res.success && res.data) {
        setFile(res.data);
        setActionSuccess('File approved successfully!');
      } else {
        setActionError(res.error?.message || 'Failed to approve file');
      }
    } catch (err: any) {
      setActionError(err?.error?.message || 'Failed to approve file');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setActionError('Rejection reason is required');
      return;
    }
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await updateFileStatus(params.id as string, {
        status: 'rejected',
        moderationReason: rejectReason,
      });
      if (res.success && res.data) {
        setFile(res.data);
        setActionSuccess('File rejected.');
      } else {
        setActionError(res.error?.message || 'Failed to reject file');
      }
    } catch (err: any) {
      setActionError(err?.error?.message || 'Failed to reject file');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Card className="p-6"><Spinner /></Card>;
  if (error) return <ErrorAlert message={error} onRetry={() => router.push('/files')} />;
  if (!file) return <ErrorAlert message="File not found" onRetry={() => router.push('/files')} />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{file.name}</h2>
            <p className="text-sm text-gray-500 mt-1 capitalize">{file.type} · {formatFileSize(file.size)}</p>
          </div>
          <FileStatusBadge status={file.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">ID</span>
            <p className="font-mono text-xs mt-0.5">{file.id}</p>
          </div>
          <div>
            <span className="text-gray-500">Upload Date</span>
            <p className="mt-0.5">{formatDate(file.uploadDate)}</p>
          </div>
          <div>
            <span className="text-gray-500">Updated</span>
            <p className="mt-0.5">{formatDate(file.updatedAt)}</p>
          </div>
        </div>

        {file.tags.length > 0 && (
          <div className="mt-4">
            <span className="text-sm text-gray-500">Tags</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {file.tags.map((tag) => (
                <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {file.moderationReason && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg">
            <span className="text-sm font-medium text-red-700">Moderation Reason:</span>
            <p className="text-sm text-red-600 mt-0.5">{file.moderationReason}</p>
          </div>
        )}
      </Card>

      {(file.status === 'upload_initiated' || file.status === 'scan_in_progress') && (
        <Card className="p-6 space-y-4">
          <h3 className="font-medium text-gray-900">Moderation Action</h3>
          {actionError && <ErrorAlert message={actionError} onRetry={() => setActionError(null)} />}
          {actionSuccess && <SuccessAlert message={actionSuccess} />}

          <div className="flex gap-3">
            <Button onClick={handleApprove} loading={actionLoading} variant="primary">
              Approve
            </Button>
            <Button onClick={() => setShowRejectForm(!showRejectForm)} variant="danger">
              Reject
            </Button>
          </div>

          {showRejectForm && (
            <div className="space-y-3 pt-2">
              <Input
                placeholder="Reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <Button onClick={handleReject} loading={actionLoading} variant="danger" size="sm">
                Confirm Reject
              </Button>
            </div>
          )}
        </Card>
      )}

      <div className="text-center">
        <button onClick={() => router.push('/files')} className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to Files
        </button>
      </div>
    </div>
  );
}
