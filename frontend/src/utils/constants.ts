export const FILE_TYPES = ['image', 'video', 'audio', 'document'] as const;
export const FILE_STATUSES = ['upload_initiated', 'scan_in_progress', 'approved', 'rejected'] as const;
export const TONES = ['professional', 'casual', 'hype', 'witty', 'academic'] as const;

export const STATUS_LABELS: Record<string, string> = {
  upload_initiated: 'Upload Initiated',
  scan_in_progress: 'Scan In Progress',
  approved: 'Approved',
  rejected: 'Rejected',
};

export const STATUS_COLORS: Record<string, string> = {
  upload_initiated: 'bg-yellow-100 text-yellow-800',
  scan_in_progress: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export const TONE_LABELS: Record<string, string> = {
  professional: 'Professional',
  casual: 'Casual',
  hype: 'Hype',
  witty: 'Witty',
  academic: 'Academic',
};
