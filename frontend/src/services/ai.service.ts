import api from './api';
import type {
  ApiResponse,
  GeneratePostResult,
  SuggestHashtagsResult,
  RecommendMediaResult,
  Tone,
} from '@/types';

export async function generatePost(
  prompt: string,
  tone?: Tone,
  variations?: number
): Promise<ApiResponse<GeneratePostResult>> {
  return api.post('/ai/generate-post', { prompt, tone, variations });
}

export async function suggestHashtags(
  postContent: string
): Promise<ApiResponse<SuggestHashtagsResult>> {
  return api.post('/ai/suggest-hashtags', { postContent });
}

export async function recommendMedia(
  postContent: string
): Promise<ApiResponse<RecommendMediaResult>> {
  return api.post('/ai/recommend-media', { postContent });
}
