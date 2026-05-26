import { STATUS_COLORS, STATUS_LABELS } from '@/utils/constants';
import type { FileStatus } from '@/types';

export default function FileStatusBadge({ status }: { status: FileStatus }) {
  const colorMap: Record<string, string> = {
    upload_initiated: 'border-yellow-500/30 text-yellow-400 bg-yellow-500/5',
    scan_in_progress: 'border-blue-500/30 text-blue-400 bg-blue-500/5',
    approved: 'border-green-500/30 text-green-400 bg-green-500/5',
    rejected: 'border-red-500/30 text-red-400 bg-red-500/5',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorMap[status] || 'border-glass-border text-text-muted'}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
