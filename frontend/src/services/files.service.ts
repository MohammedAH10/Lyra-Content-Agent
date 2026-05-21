import api from './api';
import type {
  ApiResponse,
  FileListResponse,
  FileRecord,
  CreateFilePayload,
  UpdateStatusPayload,
} from '@/types';

export async function fetchFiles(params?: {
  type?: string;
  status?: string;
}): Promise<FileListResponse> {
  return api.get('/files', { params });
}

export async function fetchFileById(id: string): Promise<ApiResponse<FileRecord>> {
  return api.get(`/files/${id}`);
}

export async function createFile(
  payload: CreateFilePayload
): Promise<ApiResponse<FileRecord>> {
  return api.post('/files', payload);
}

export async function updateFileStatus(
  id: string,
  payload: UpdateStatusPayload
): Promise<ApiResponse<FileRecord>> {
  return api.patch(`/files/${id}/status`, payload);
}
