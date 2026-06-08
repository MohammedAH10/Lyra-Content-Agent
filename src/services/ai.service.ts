import { AppError } from '../utils/AppError';
import logger from '../utils/logger';
import { callWithFallback, parseAiJson } from './modelRouter.service';
import { fallbackGeneratePost, fallbackSuggestHashtags } from './deterministicTemplates';

export type Tone = 'professional' | 'casual' | 'excited';

export type GeneratePostResult = {
  primary: string;
  variations: string[];
  hashtags: string[];
};

export type SuggestHashtagsResult = {
  hashtags: string[];
};

// ── Prompt Builders ──────────────────────────────────────────

export const buildGeneratePostPrompt = (
  prompt: string,
  tone: Tone,
  variations: number,
): string => {
  return [
    `You are a social media content specialist. Generate a social media post based on the user's prompt.`,
    ``,
    `Tone: ${tone}`,
    `Number of variations: ${variations}`,
    ``,
    `User prompt: "${prompt}"`,
    ``,
    `Respond ONLY with valid JSON in this exact structure, no markdown fences, no explanation:`,
    `{`,
    `  "primary": "The main post text",`,
    `  "variations": ["variation 1", "variation 2"],`,
    `  "hashtags": ["#Hashtag1", "#Hashtag2"]`,
    `}`,
    ``,
    `Rules:`,
    `- "primary" must be a compelling post matching the requested tone.`,
    `- "variations" must contain exactly ${variations} alternative versions.`,
    `- "hashtags" must contain 3-5 relevant hashtags, each starting with #.`,
    `- Every field must be present. Do not include any text outside the JSON object.`,
  ].join('\n');
};

export const buildHashtagPrompt = (postContent: string): string => {
  return [
    `You are a social media hashtag specialist. Generate relevant hashtags for the following post content.`,
    ``,
    `Post content: "${postContent}"`,
    ``,
    `Respond ONLY with valid JSON in this exact structure, no markdown fences, no explanation:`,
    `{`,
    `  "hashtags": ["#Hashtag1", "#Hashtag2", "#Hashtag3"]`,
    `}`,
    ``,
    `Rules:`,
    `- Generate 5-10 relevant hashtags.`,
    `- Each hashtag must start with #.`,
    `- Hashtags should be relevant to the content, mixing broad and niche tags.`,
    `- Do not include any text outside the JSON object.`,
  ].join('\n');
};

export const buildMediaRecommendationPrompt = (
  postContent: string,
  fileMetadataList: { name: string; tags: string[] }[],
): string => {
  const filesDescription = fileMetadataList
    .map((f, i) => `${i + 1}. name: "${f.name}", tags: [${f.tags.join(', ')}]`)
    .join('\n');

  return [
    `You are a media recommendation engine. Given the post content and a list of available media files, rank the files by relevance.`,
    ``,
    `Post content: "${postContent}"`,
    ``,
    `Available files:`,
    filesDescription,
    ``,
    `Respond ONLY with valid JSON in this exact structure, no markdown fences, no explanation:`,
    `{`,
    `  "rankings": [{ "index": 1, "score": 0.95, "reason": "why this file matches" }]`,
    `}`,
    ``,
    `Rules:`,
    `- Rank only files relevant to the post content.`,
    `- Score from 0.0 to 1.0 based on relevance.`,
    `- Sort by score descending.`,
    `- Omit files with no relevance.`,
  ].join('\n');
};

// ── Public Service Methods ───────────────────────────────────

export const generatePost = async (
  prompt: string,
  tone: Tone = 'professional',
  variations: number = 3,
): Promise<GeneratePostResult> => {
  const cappedVariations = Math.min(Math.max(variations, 1), 5);
  const systemPrompt = buildGeneratePostPrompt(prompt, tone, cappedVariations);

  const modelResult = await callWithFallback(systemPrompt);

  if (modelResult) {
    try {
      const parsed = parseAiJson<GeneratePostResult>(modelResult.content);

      if (!parsed.primary || !Array.isArray(parsed.variations) || !Array.isArray(parsed.hashtags)) {
        logger.error('AI response missing expected fields, falling back to template', { parsed });
        return fallbackGeneratePost(prompt, tone, cappedVariations);
      }

      return {
        primary: parsed.primary,
        variations: parsed.variations.slice(0, cappedVariations),
        hashtags: parsed.hashtags,
      };
    } catch {
      logger.warn('Failed to parse AI response, using deterministic template');
      return fallbackGeneratePost(prompt, tone, cappedVariations);
    }
  }

  logger.warn('AI providers unavailable, returning deterministic fallback template');
  return fallbackGeneratePost(prompt, tone, cappedVariations);
};

export const suggestHashtags = async (postContent: string): Promise<SuggestHashtagsResult> => {
  const systemPrompt = buildHashtagPrompt(postContent);

  const modelResult = await callWithFallback(systemPrompt);

  if (modelResult) {
    try {
      const parsed = parseAiJson<SuggestHashtagsResult>(modelResult.content);

      if (!Array.isArray(parsed.hashtags)) {
        logger.error('AI response missing hashtags array, falling back to keyword extraction', { parsed });
        return fallbackSuggestHashtags(postContent);
      }

      return { hashtags: parsed.hashtags };
    } catch {
      logger.warn('Failed to parse AI response, using keyword-based hashtags');
      return fallbackSuggestHashtags(postContent);
    }
  }

  logger.warn('AI providers unavailable, returning keyword-based hashtags');
  return fallbackSuggestHashtags(postContent);
};
