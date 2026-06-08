import { afterEach, describe, expect, it, vi } from 'vitest';

import { parseAiJson } from '../src/services/modelRouter.service';

describe('parseAiJson', () => {
  it('parses plain JSON', () => {
    const result = parseAiJson<{ key: string }>('{"key": "value"}');
    expect(result.key).toBe('value');
  });

  it('strips markdown code fences', () => {
    const result = parseAiJson<{ key: string }>('```json\n{"key": "value"}\n```');
    expect(result.key).toBe('value');
  });

  it('strips code fences without json label', () => {
    const result = parseAiJson<{ key: string }>('```\n{"key": "value"}\n```');
    expect(result.key).toBe('value');
  });

  it('strips whitespace around JSON', () => {
    const result = parseAiJson<{ key: string }>('\n  {"key": "value"}  \n');
    expect(result.key).toBe('value');
  });

  it('throws AppError on invalid JSON', () => {
    expect(() => parseAiJson('not json')).toThrow();
  });

  it('throws AppError on empty string', () => {
    expect(() => parseAiJson('')).toThrow();
  });
});
