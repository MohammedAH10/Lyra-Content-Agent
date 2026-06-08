import api from './api';
import type {
  ApiResponse,
  FileRecord,
  GeneratePostResult,
  SuggestHashtagsResult,
  SuggestImprovementsResult,
  RelatedIdeasResult,
  MediaRecommendationResult,
  Tone,
  PostFormat,
  DraftRecord,
} from '@/types';

export async function generatePost(
  topic: string,
  tone?: Tone,
  format?: PostFormat,
  userId?: string,
): Promise<ApiResponse<GeneratePostResult>> {
  return api.post('/ai/generate-post', { topic, tone, format, userId });
}

export async function regeneratePost(
  previousContent: string,
  topic: string,
  tone?: Tone,
  format?: PostFormat,
  additionalInstructions?: string,
  userId?: string,
): Promise<ApiResponse<GeneratePostResult>> {
  return api.post('/ai/regenerate-post', {
    previousContent,
    topic,
    tone,
    format,
    additionalInstructions,
    userId,
  });
}

export async function suggestHashtags(
  postContent: string,
  userId?: string,
): Promise<ApiResponse<SuggestHashtagsResult>> {
  return api.post('/ai/suggest-hashtags', { postContent, userId });
}

export async function suggestImprovements(
  postContent: string,
  userId?: string,
): Promise<ApiResponse<SuggestImprovementsResult>> {
  return api.post('/ai/suggest-improvements', { postContent, userId });
}

export async function relatedPostIdeas(
  postContent: string,
  userId?: string,
): Promise<ApiResponse<RelatedIdeasResult>> {
  return api.post('/ai/related-post-ideas', { postContent, userId });
}

export async function recommendMedia(
  postContent: string,
  type?: string,
  limit?: number,
  userId?: string,
): Promise<ApiResponse<MediaRecommendationResult>> {
  return api.post('/ai/recommend-media', { postContent, type, limit, userId });
}

// Drafts
export async function createDraft(payload: {
  userId: string;
  inputText: string;
  tone: Tone;
  format: PostFormat;
  generatedContent?: GeneratePostResult;
  status?: string;
}): Promise<ApiResponse<DraftRecord>> {
  return api.post('/posts/drafts', payload);
}

export async function getDraft(id: string): Promise<ApiResponse<DraftRecord>> {
  return api.get(`/posts/drafts/${id}`);
}

export async function listDrafts(params?: {
  userId?: string;
  status?: string;
}): Promise<ApiResponse<DraftRecord[]>> {
  return api.get('/posts/drafts', { params });
}

export async function updateDraftContent(
  id: string,
  content: string,
  selectedVariation?: string,
): Promise<ApiResponse<DraftRecord>> {
  return api.patch(`/posts/drafts/${id}`, { content, selectedVariation });
}

export async function acceptDraft(
  id: string,
  acceptedOutput: string,
  selectedVariation?: string,
  userId?: string,
  modelUsed?: string,
): Promise<ApiResponse<DraftRecord>> {
  return api.post(`/posts/drafts/${id}/accept`, {
    acceptedOutput,
    selectedVariation,
    userId,
    modelUsed,
  });
}

// Files
export async function fetchFiles(params?: {
  type?: string;
  status?: string;
}): Promise<{ success: boolean; data?: FileRecord[]; count: number; error?: { code: string; message: string } }> {
  return api.get('/files', { params });
}


