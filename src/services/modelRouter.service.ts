import { getAiClient, getDefaultModel, getFallbackModel, aiProviderConfig } from '../utils/aiClient';
import { AppError } from '../utils/AppError';
import logger from '../utils/logger';

const DEFAULT_TIMEOUT_MS = aiProviderConfig.timeoutMs;

export interface ModelCallResult {
  content: string;
  modelUsed: string;
  latencyMs: number;
  fallbackUsed: boolean;
}

interface ModelCallError {
  code: 'AI_TIMEOUT' | 'AI_UNAVAILABLE' | 'AI_EMPTY_RESPONSE';
  message: string;
  latencyMs: number;
}

export type AiServiceResult<T> =
  | { success: true; data: T; modelUsed: string; fallbackUsed: boolean }
  | { success: false; error: ModelCallError };

const callSingleModel = async (
  model: string,
  systemPrompt: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<ModelCallResult> => {
  const client = getAiClient();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const startTime = Date.now();

  try {
    logger.info('AI model call initiated', { model, promptLength: systemPrompt.length });

    const response = await client.chat.completions.create(
      {
        model,
        messages: [{ role: 'user', content: systemPrompt }],
        temperature: 0.7,
      },
      { signal: controller.signal },
    );

    const elapsed = Date.now() - startTime;
    logger.info('AI model call completed', { model, responseTimeMs: elapsed });

    const content = response.choices?.[0]?.message?.content;

    if (!content) {
      throw new AppError(503, 'AI_UNAVAILABLE', 'AI returned an empty response.');
    }

    return { content, modelUsed: model, latencyMs: elapsed, fallbackUsed: false };
  } catch (error: unknown) {
    const elapsed = Date.now() - startTime;

    if (
      error instanceof Error &&
      (error.name === 'AbortError' || error.message?.includes('aborted'))
    ) {
      logger.warn('AI model call timed out', { model, timeoutMs, elapsedMs: elapsed });
      throw new AppError(504, 'AI_TIMEOUT', `Model ${model} timed out after ${timeoutMs}ms.`);
    }

    if (error instanceof AppError) {
      throw error;
    }

    logger.error('AI model call failed', { model, error: (error as Error).message, elapsedMs: elapsed });
    throw new AppError(
      503,
      'AI_UNAVAILABLE',
      `Model ${model} is unavailable.`,
    );
  } finally {
    clearTimeout(timeoutId);
  }
};

export const callWithFallback = async (
  systemPrompt: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<ModelCallResult | null> => {
  const primaryModel = getDefaultModel();
  const fallbackModel = getFallbackModel();

  // Step 1: Try primary model
  try {
    const result = await callSingleModel(primaryModel, systemPrompt, timeoutMs);
    return { ...result, fallbackUsed: false };
  } catch (primaryError) {
    logger.warn('Primary model failed, attempting fallback', {
      primaryModel,
      fallbackModel,
      error: (primaryError as Error).message,
    });
  }

  // Step 2: Try fallback model
  try {
    const result = await callSingleModel(fallbackModel, systemPrompt, timeoutMs);
    return { ...result, fallbackUsed: true };
  } catch (fallbackError) {
    logger.error('Fallback model also failed, using deterministic template', {
      fallbackModel,
      error: (fallbackError as Error).message,
    });
  }

  // Step 3: Both failed — return null, caller uses deterministic template
  return null;
};

export const parseAiJson = <T>(raw: string): T => {
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
