export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface FileListResponse extends ApiResponse<FileRecord[]> {
  count: number;
}

export type FileType = 'image' | 'video' | 'audio' | 'document';
export type FileStatus = 'upload_initiated' | 'scan_in_progress' | 'approved' | 'rejected';
export type Tone = 'professional' | 'casual' | 'hype' | 'witty' | 'academic';

export interface FileRecord {
  id: string;
  name: string;
  type: FileType;
  size: number;
  url: string;
  tags: string[];
  uploadDate: string;
  status: FileStatus;
  moderationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratePostResult {
  primary: string;
  variations: string[];
  hashtags: string[];
}

export interface MediaRecommendation {
  file: FileRecord;
  score: number;
  matchReason: string;
}

export interface RecommendMediaResult {
  recommendations: MediaRecommendation[];
  totalMatched: number;
  message?: string;
}

export interface SuggestHashtagsResult {
  hashtags: string[];
}

export interface CreateFilePayload {
  name: string;
  type: FileType;
  size: number;
  url: string;
  tags?: string[];
}

export interface UpdateStatusPayload {
  status: 'approved' | 'rejected';
  moderationReason?: string;
}
