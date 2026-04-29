import OpenAI from 'openai';

import logger from './logger';

const DEFAULT_BASE_URL = 'https://openrouter.ai/api/v1';
const DEFAULT_MODEL = 'openai/gpt-oss-120b:free';

export const getAiClient = (): OpenAI => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    logger.error('OPENAI_API_KEY is not set');
    throw new Error('OPENAI_API_KEY is required');
  }

  return new OpenAI({
    apiKey,
    baseURL: process.env.OPENROUTER_BASE_URL || DEFAULT_BASE_URL,
  });
};

export const getModelId = (): string => {
  return process.env.AI_MODEL || DEFAULT_MODEL;
};
