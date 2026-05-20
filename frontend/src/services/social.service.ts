import type { SocialPlatform, ApiResponse } from '@/types';

export async function publishPost(params: {
  content: string;
  mediaUrls?: string[];
  platforms: SocialPlatform[];
}): Promise<ApiResponse<{ results: Record<SocialPlatform, { success: boolean; error?: string }> }>> {
  const response = await fetch('/api/social/publish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return response.json();
}

export const platformLinks: Record<SocialPlatform, { name: string; color: string; icon: string }> = {
  twitter: { name: 'Twitter (X)', color: 'bg-black', icon: '𝕏' },
  instagram: { name: 'Instagram', color: 'bg-pink-600', icon: '📷' },
  linkedin: { name: 'LinkedIn', color: 'bg-blue-700', icon: '💼' },
};
