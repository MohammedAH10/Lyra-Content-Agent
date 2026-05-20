import api from './api';
import type {
  ApiResponse,
  FileRecord,
  CreateFilePayload,
  UpdateStatusPayload,
} from '@/types';

export async function fetchFiles(params?: {
  type?: string;
  status?: string;
}): Promise<ApiResponse<{ data: FileRecord[]; count: number }>> {
  return api.get('/files', { params });
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
