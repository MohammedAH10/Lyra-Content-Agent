import { STATUS_COLORS, STATUS_LABELS } from '@/utils/constants';
import { cn } from '@/utils/formatters';
import type { FileStatus } from '@/types';

export default function FileStatusBadge({ status }: { status: FileStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        STATUS_COLORS[status]
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
