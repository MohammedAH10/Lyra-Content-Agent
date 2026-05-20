'use client';

import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { FILE_TYPES, FILE_STATUSES, STATUS_LABELS } from '@/utils/constants';

export default function FileFilterBar({
  type,
  status,
  onTypeChange,
  onStatusChange,
  onCreateNew,
}: {
  type: string;
  status: string;
  onTypeChange: (t: string) => void;
  onStatusChange: (s: string) => void;
  onCreateNew: () => void;
}) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Select
        value={type}
        onChange={(e) => onTypeChange(e.target.value)}
        options={[
          { value: '', label: 'All Types' },
          ...FILE_TYPES.map((t) => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) })),
        ]}
        className="w-40"
      />
      <Select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        options={[
          { value: '', label: 'Approved Only' },
          ...FILE_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] })),
        ]}
        className="w-44"
      />
      <div className="ml-auto">
        <Button onClick={onCreateNew} size="sm">
          + New File
        </Button>
      </div>
    </div>
  );
}
