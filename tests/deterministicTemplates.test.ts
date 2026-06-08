import { describe, expect, it } from 'vitest';

import { fallbackGeneratePost, fallbackSuggestHashtags } from '../src/services/deterministicTemplates';

describe('fallbackGeneratePost', () => {
  it('returns a structured fallback with primary, variations, and hashtags', () => {
    const result = fallbackGeneratePost('Test prompt', 'professional', 3);

    expect(result).toHaveProperty('primary');
    expect(result).toHaveProperty('variations');
    expect(result).toHaveProperty('hashtags');
    expect(typeof result.primary).toBe('string');
    expect(Array.isArray(result.variations)).toBe(true);
    expect(Array.isArray(result.hashtags)).toBe(true);
  });

  it('capped variations at 5', () => {
    const result = fallbackGeneratePost('Test', 'casual', 10);

    expect(result.variations.length).toBe(5);
  });

  it('has minimum 1 variation', () => {
    const result = fallbackGeneratePost('Test', 'excited', 0);

    expect(result.variations.length).toBe(1);
  });

  it('primary contains prompt and tone', () => {
    const result = fallbackGeneratePost('My custom prompt', 'excited', 2);

    expect(result.primary).toContain('My custom prompt');
    expect(result.primary).toContain('excited');
    expect(result.primary).toContain('[Draft');
  });

  it('hashtags include fallback defaults', () => {
    const result = fallbackGeneratePost('Test', 'professional', 1);

    expect(result.hashtags).toContain('#ContentDraft');
    expect(result.hashtags).toContain('#AIUnavailable');
  });
});

describe('fallbackSuggestHashtags', () => {
  it('extracts hashtags from significant words', () => {
    const result = fallbackSuggestHashtags('Exploring new marketing strategies for our brand');

    expect(result.hashtags.length).toBeGreaterThanOrEqual(3);
    expect(result.hashtags[0]).toMatch(/^#/);
  });

  it('returns fallback tags for short input', () => {
    const result = fallbackSuggestHashtags('it is on');

    expect(result.hashtags).toEqual(['#ContentDraft', '#AIUnavailable', '#DraftMode']);
  });

  it('returns fallback tags for input with only stop words', () => {
    const result = fallbackSuggestHashtags('the and for but not you');

    expect(result.hashtags).toEqual(['#ContentDraft', '#AIUnavailable', '#DraftMode']);
  });

  it('deduplicates words', () => {
    const result = fallbackSuggestHashtags('brand brand brand value value');

    const unique = [...new Set(result.hashtags)];
    expect(result.hashtags.length).toBe(unique.length);
  });

  it('capitalizes first letter of each hashtag', () => {
    const result = fallbackSuggestHashtags('exploring marketing strategies');

    result.hashtags.forEach((tag) => {
      expect(tag).toMatch(/^#[A-Z]/);
    });
  });
});
