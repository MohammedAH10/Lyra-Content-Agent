import { describe, expect, it } from 'vitest';

import AiLog from '../src/models/AiLog';
import { AI_REQUEST_TYPES } from '../src/utils/constants';

const validLogData = {
  userId: 'user-123',
  requestType: 'generate' as const,
  inputSummary: 'Write a post about AI education',
  modelUsed: 'openai/gpt-oss-120b:free',
  latencyMs: 1234,
  success: true,
};

describe('AiLog model validation', () => {
  it('creates a valid AI log entry', async () => {
    const log = new AiLog(validLogData);

    await expect(log.validate()).resolves.toBeUndefined();
    expect(log.fallbackUsed).toBe(false);
    expect(log.errorMessage).toBeNull();
    expect(log.tokenEstimate).toBeNull();
  });

  it.each(AI_REQUEST_TYPES)('accepts requestType %s', async (requestType) => {
    const log = new AiLog({ ...validLogData, requestType });

    await expect(log.validate()).resolves.toBeUndefined();
  });

  it('rejects unsupported requestType', async () => {
    const log = new AiLog({ ...validLogData, requestType: 'translate' });

    await expect(log.validate()).rejects.toThrow();
  });

  it('records fallback usage', async () => {
    const log = new AiLog({
      ...validLogData,
      fallbackUsed: true,
      modelUsed: 'gpt-oss-20b:free',
    });

    await expect(log.validate()).resolves.toBeUndefined();
    expect(log.fallbackUsed).toBe(true);
  });

  it('records failure with error message', async () => {
    const log = new AiLog({
      ...validLogData,
      success: false,
      errorMessage: 'AI provider returned 503 Service Unavailable',
      latencyMs: 15000,
    });

    await expect(log.validate()).resolves.toBeUndefined();
    expect(log.success).toBe(false);
    expect(log.errorMessage).toContain('503');
  });

  it('records token estimate', async () => {
    const log = new AiLog({
      ...validLogData,
      tokenEstimate: 450,
    });

    await expect(log.validate()).resolves.toBeUndefined();
    expect(log.tokenEstimate).toBe(450);
  });

  it('works without userId', async () => {
    const { userId, ...logWithoutUser } = validLogData;
    const log = new AiLog(logWithoutUser);

    await expect(log.validate()).resolves.toBeUndefined();
    expect(log.userId).toBeNull();
  });

  it('rejects missing required fields', async () => {
    const log = new AiLog({});

    await expect(log.validate()).rejects.toThrow();
  });

  it('rejects negative latencyMs', async () => {
    const log = new AiLog({ ...validLogData, latencyMs: -1 });

    await expect(log.validate()).rejects.toThrow();
  });

  it('rejects negative tokenEstimate', async () => {
    const log = new AiLog({ ...validLogData, tokenEstimate: -100 });

    await expect(log.validate()).rejects.toThrow();
  });

  it('handles recommend request type', async () => {
    const log = new AiLog({
      ...validLogData,
      requestType: 'recommend',
      inputSummary: 'Recommend media for post about student entrepreneurship',
      latencyMs: 567,
    });

    await expect(log.validate()).resolves.toBeUndefined();
    expect(log.requestType).toBe('recommend');
  });

  it('handles improve and related request types', async () => {
    const improveLog = new AiLog({
      ...validLogData,
      requestType: 'improve',
      inputSummary: 'Suggest improvements for post content',
    });
    const relatedLog = new AiLog({
      ...validLogData,
      requestType: 'related',
      inputSummary: 'Suggest related post ideas',
    });

    await expect(improveLog.validate()).resolves.toBeUndefined();
    await expect(relatedLog.validate()).resolves.toBeUndefined();
  });
});