import { AppError } from '../utils/AppError';
import logger from '../utils/logger';
import { callWithFallback, parseAiJson } from './modelRouter.service';
import { fallbackGeneratePost, fallbackSuggestHashtags } from './deterministicTemplates';

export type Tone = 'professional' | 'casual' | 'excited';
export type PostFormat = 'short' | 'long' | 'bullet';

export type Variation = { label: string; content: string };

export type GeneratePostResult = {
  content: string;
  variations: Variation[];
  improvements: string[];
  relatedIdeas: string[];
  fallbackUsed: boolean;
};

export type SuggestHashtagsResult = {
  hashtags: string[];
};

// ── Prompt Builders ──────────────────────────────────────────

const FORMAT_INSTRUCTIONS: Record<PostFormat, string> = {
  short: 'Keep the post concise — 2-3 short paragraphs max. Punchy, scannable.',
  long: 'Write a detailed, in-depth post. 4-6 paragraphs with rich context and nuance.',
  bullet: 'Use bullet points or numbered lists. Clear, skimmable formatting.',
};

export const buildGeneratePostPrompt = (
  topic: string,
  tone: Tone,
  format: PostFormat,
): string => {
  return [
    `You are a social media content specialist. Generate a post about the given topic.`,
    ``,
    `Topic: "${topic}"`,
    `Tone: ${tone}`,
    `Format: ${format}`,
    `Format instruction: ${FORMAT_INSTRUCTIONS[format]}`,
    ``,
    `Respond ONLY with valid JSON in this exact structure, no markdown fences, no explanation:`,
    `{`,
    `  "content": "The main post content",`,
    `  "variations": [`,
    `    { "label": "Short", "content": "..." },`,
    `    { "label": "Professional", "content": "..." },`,
    `    { "label": "Engaging", "content": "..." }`,
    `  ],`,
    `  "improvements": ["Suggestion to make the post stronger"],`,
    `  "relatedIdeas": ["Another angle or topic to explore"]`,
    `}`,
    ``,
    `Rules:`,
    `- "content" must be a compelling post matching the requested tone and format.`,
    `- "variations" must contain exactly 3 alternatives with different approaches (labels: "Short", "Professional", "Engaging").`,
    `- "improvements" must contain 2-3 actionable suggestions to strengthen the post.`,
    `- "relatedIdeas" must contain 2-3 related angles or follow-up topics.`,
    `- Every field must be present. Do not include any text outside the JSON object.`,
  ].join('\n');
};

export const buildRegeneratePrompt = (
  previousContent: string,
  topic: string,
  tone: Tone,
  format: PostFormat,
  additionalInstructions?: string,
): string => {
  const instructions = additionalInstructions
    ? `\n\nAdditional user instructions: "${additionalInstructions}"`
    : '';

  return [
    `You are a social media content specialist. Regenerate the following post with improvements based on the instructions.`,
    ``,
    `Topic: "${topic}"`,
    `Tone: ${tone}`,
    `Format: ${format}`,
    `Format instruction: ${FORMAT_INSTRUCTIONS[format]}`,
    ``,
    `Previous version:`,
    `"""`,
    previousContent,
    `"""`,
    instructions,
    ``,
    `Respond ONLY with valid JSON in this exact structure, no markdown fences, no explanation:`,
    `{`,
    `  "content": "The improved main post content",`,
    `  "variations": [`,
    `    { "label": "Short", "content": "..." },`,
    `    { "label": "Professional", "content": "..." },`,
    `    { "label": "Engaging", "content": "..." }`,
    `  ],`,
    `  "improvements": ["Suggestion to make the post stronger"],`,
    `  "relatedIdeas": ["Another angle or topic to explore"]`,
    `}`,
    ``,
    `Rules:`,
    `- "content" must retain the core message but incorporate the requested improvements.`,
    `- "variations" must contain exactly 3 alternatives with different approaches (labels: "Short", "Professional", "Engaging").`,
    `- "improvements" must contain 2-3 actionable suggestions to strengthen the post.`,
    `- "relatedIdeas" must contain 2-3 related angles or follow-up topics.`,
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

// ── Validation ───────────────────────────────────────────────

const VALID_VARIATION_LABELS = ['Short', 'Professional', 'Engaging'];

const isValidVariations = (variations: unknown): variations is Variation[] => {
  if (!Array.isArray(variations) || variations.length === 0) return false;
  return variations.every(
    (v) =>
      v &&
      typeof v === 'object' &&
      typeof (v as Variation).label === 'string' &&
      typeof (v as Variation).content === 'string' &&
      VALID_VARIATION_LABELS.includes((v as Variation).label),
  );
};

const isValidGeneratePostResult = (data: unknown): data is GeneratePostResult => {
  if (!data || typeof data !== 'object') return false;

  const d = data as Record<string, unknown>;

  if (typeof d.content !== 'string' || !d.content.trim()) return false;
  if (!isValidVariations(d.variations)) return false;

  if (!Array.isArray(d.improvements)) return false;
  if (!Array.isArray(d.relatedIdeas)) return false;

  return true;
};

// ── Public Service Methods ───────────────────────────────────

export const generatePost = async (
  topic: string,
  tone: Tone = 'professional',
  format: PostFormat = 'short',
): Promise<GeneratePostResult> => {
  const systemPrompt = buildGeneratePostPrompt(topic, tone, format);

  const modelResult = await callWithFallback(systemPrompt);

  if (modelResult) {
    try {
      const parsed = parseAiJson<GeneratePostResult>(modelResult.content);

      if (!isValidGeneratePostResult(parsed)) {
        logger.error('AI response missing expected fields, falling back to template', { parsed });
        return fallbackGeneratePost(topic, tone, format);
      }

      return {
        content: parsed.content,
        variations: parsed.variations,
        improvements: parsed.improvements,
        relatedIdeas: parsed.relatedIdeas,
        fallbackUsed: modelResult.fallbackUsed,
      };
    } catch {
      logger.warn('Failed to parse AI response, using deterministic template');
      return fallbackGeneratePost(topic, tone, format);
    }
  }

  logger.warn('AI providers unavailable, returning deterministic fallback template');
  return fallbackGeneratePost(topic, tone, format);
};

export const regeneratePost = async (
  previousContent: string,
  topic: string,
  tone: Tone = 'professional',
  format: PostFormat = 'short',
  additionalInstructions?: string,
): Promise<GeneratePostResult> => {
  const systemPrompt = buildRegeneratePrompt(
    previousContent,
    topic,
    tone,
    format,
    additionalInstructions,
  );

  const modelResult = await callWithFallback(systemPrompt);

  if (modelResult) {
    try {
      const parsed = parseAiJson<GeneratePostResult>(modelResult.content);

      if (!isValidGeneratePostResult(parsed)) {
        logger.error('AI response missing expected fields, falling back to template', { parsed });
        return fallbackGeneratePost(topic, tone, format);
      }

      return {
        content: parsed.content,
        variations: parsed.variations,
        improvements: parsed.improvements,
        relatedIdeas: parsed.relatedIdeas,
        fallbackUsed: modelResult.fallbackUsed,
      };
    } catch {
      logger.warn('Failed to parse AI response, using deterministic template');
      return fallbackGeneratePost(topic, tone, format);
    }
  }

  logger.warn('AI providers unavailable, returning deterministic fallback template');
  return fallbackGeneratePost(topic, tone, format);
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
