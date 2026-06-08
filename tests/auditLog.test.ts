import { describe, expect, it, vi } from 'vitest';

import { logAiRequest } from '../src/services/auditLog.service';

const mockCreate = vi.fn();

vi.mock('../src/models/AiLog', () => ({
  default: {
    create: (...args: unknown[]) => mockCreate(...args),
    find: vi.fn(() => ({
      sort: vi.fn(() => ({
        skip: vi.fn(() => ({
          limit: vi.fn(() => ({
            exec: vi.fn().mockResolvedValue([]),
          })),
        })),
      })),
    })),
    countDocuments: vi.fn().mockResolvedValue(0),
  },
}));

vi.mock('../src/utils/logger', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

describe('logAiRequest', () => {
  it('creates an AiLog entry with the given attributes', async () => {
    mockCreate.mockResolvedValueOnce({});

    await logAiRequest({
      userId: 'user-123',
      requestType: 'generate',
      inputSummary: 'Generate: topic="test", tone=professional',
      modelUsed: 'test-model',
      latencyMs: 150,
      success: true,
      fallbackUsed: false,
    });

    expect(mockCreate).toHaveBeenCalledWith({
      userId: 'user-123',
      requestType: 'generate',
      inputSummary: 'Generate: topic="test", tone=professional',
      modelUsed: 'test-model',
      latencyMs: 150,
      success: true,
      fallbackUsed: false,
    });
  });

  it('accepts optional errorMessage and tokenEstimate', async () => {
    mockCreate.mockResolvedValueOnce({});

    await logAiRequest({
      requestType: 'hashtags',
      inputSummary: 'Hashtags: "post content"',
      modelUsed: 'none',
      latencyMs: 5000,
      success: false,
      fallbackUsed: true,
      errorMessage: 'All AI providers unavailable',
      tokenEstimate: 0,
    });

    expect(mockCreate).toHaveBeenCalledWith({
      requestType: 'hashtags',
      inputSummary: 'Hashtags: "post content"',
      modelUsed: 'none',
      latencyMs: 5000,
      success: false,
      fallbackUsed: true,
      errorMessage: 'All AI providers unavailable',
      tokenEstimate: 0,
    });
  });
});
