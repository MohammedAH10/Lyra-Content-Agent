export const FILE_STATUSES = [
  'upload_initiated',
  'scan_in_progress',
  'approved',
  'rejected',
] as const;

export const FILE_TYPES = ['image', 'video', 'audio', 'document'] as const;

export type FileStatus = (typeof FILE_STATUSES)[number];
export type FileType = (typeof FILE_TYPES)[number];
