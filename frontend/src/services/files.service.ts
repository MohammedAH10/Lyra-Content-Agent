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

export async function uploadFile(formData: FormData): Promise<ApiResponse<FileRecord>> {
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
  const response = await fetch(`${baseURL}/files/upload`, {
    method: 'POST',
    body: formData,
  });
  const result = (await response.json()) as ApiResponse<FileRecord>;

  if (!response.ok || !result.success) {
    throw result;
  }

  return result;
}

export async function updateFileStatus(
  id: string,
  payload: UpdateStatusPayload
): Promise<ApiResponse<FileRecord>> {
  return api.patch(`/files/${id}/status`, payload);
}
