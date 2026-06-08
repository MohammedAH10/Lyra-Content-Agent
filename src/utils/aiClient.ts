import OpenAI from 'openai';

import logger from './logger';

export type AiProviderConfig = {
  provider: 'openai';
  defaultModel: string;
  fallbackModel: string;
  timeoutMs: number;
  baseUrl: string;
};

export const aiProviderConfig: AiProviderConfig = {
  provider: 'openai',
  defaultModel: process.env.AI_MODEL || 'openai/gpt-oss-120b:free',
  fallbackModel: 'openai/gpt-oss-20b:free',
  timeoutMs: Number(process.env.AI_TIMEOUT_MS || 20000),
  baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
};

export const getAiClient = (): OpenAI => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    logger.error('OPENAI_API_KEY is not set');
    throw new Error('OPENAI_API_KEY is required');
  }

  return new OpenAI({
    apiKey,
    baseURL: aiProviderConfig.baseUrl,
    timeout: aiProviderConfig.timeoutMs,
    maxRetries: 0,
  });
};

export const getDefaultModel = (): string => {
  return aiProviderConfig.defaultModel;
};

export const getFallbackModel = (): string => {
  return aiProviderConfig.fallbackModel;
};
