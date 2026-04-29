import { getAiClient, getModelId } from '../utils/aiClient';
import { AppError } from '../utils/AppError';
import logger from '../utils/logger';

type Tone = 'professional' | 'casual' | 'excited';

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

// ── AI Call Wrapper ──────────────────────────────────────────

const callAi = async (systemPrompt: string): Promise<string> => {
  const timeoutMs = Number(process.env.AI_TIMEOUT_MS || 15000);
  const client = getAiClient();
  const model = getModelId();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const startTime = Date.now();

  try {
    logger.info('AI call initiated', {
      model,
      promptLength: systemPrompt.length,
    });

    const response = await client.chat.completions.create(
      {
        model,
        messages: [{ role: 'user', content: systemPrompt }],
        temperature: 0.7,
      },
      { signal: controller.signal },
    );

    const elapsed = Date.now() - startTime;
    logger.info('AI call completed', { model, responseTimeMs: elapsed });

    const content = response.choices?.[0]?.message?.content;

    if (!content) {
      throw new AppError(503, 'AI_UNAVAILABLE', 'AI returned an empty response.');
    }

    return content;
  } catch (error: unknown) {
    const elapsed = Date.now() - startTime;

    if (error instanceof AppError) {
      throw error;
    }

    if (
      error instanceof Error &&
      (error.name === 'AbortError' || error.message?.includes('aborted'))
    ) {
      logger.warn('AI call timed out', { model, timeoutMs, elapsedMs: elapsed });
      throw new AppError(504, 'AI_TIMEOUT', 'The request took too long. Please try again.');
    }

    logger.error('AI call failed', { model, error, elapsedMs: elapsed });
    throw new AppError(
      503,
      'AI_UNAVAILABLE',
      'Content generation is temporarily unavailable. Please try again shortly.',
    );
  } finally {
    clearTimeout(timeoutId);
  }
};

// ── JSON Parser Helper ───────────────────────────────────────

const parseAiJson = <T>(raw: string): T => {
  // Strip markdown code fences if the model wraps them
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    logger.error('Failed to parse AI JSON response', { raw });
    throw new AppError(503, 'AI_UNAVAILABLE', 'AI returned an invalid response format.');
  }
};

// ── Public Service Methods ───────────────────────────────────

export const generatePost = async (
  prompt: string,
  tone: Tone = 'professional',
  variations: number = 3,
): Promise<GeneratePostResult> => {
  const cappedVariations = Math.min(Math.max(variations, 1), 5);
  const systemPrompt = buildGeneratePostPrompt(prompt, tone, cappedVariations);
  const raw = await callAi(systemPrompt);
  const parsed = parseAiJson<GeneratePostResult>(raw);

  // Validate shape
  if (!parsed.primary || !Array.isArray(parsed.variations) || !Array.isArray(parsed.hashtags)) {
    logger.error('AI response missing expected fields', { parsed });
    throw new AppError(503, 'AI_UNAVAILABLE', 'AI returned an incomplete response.');
  }

  return {
    primary: parsed.primary,
    variations: parsed.variations.slice(0, cappedVariations),
    hashtags: parsed.hashtags,
  };
};

export const suggestHashtags = async (postContent: string): Promise<SuggestHashtagsResult> => {
  const systemPrompt = buildHashtagPrompt(postContent);
  const raw = await callAi(systemPrompt);
  const parsed = parseAiJson<SuggestHashtagsResult>(raw);

  if (!Array.isArray(parsed.hashtags)) {
    logger.error('AI response missing hashtags array', { parsed });
    throw new AppError(503, 'AI_UNAVAILABLE', 'AI returned an incomplete response.');
  }

  return { hashtags: parsed.hashtags };
};
