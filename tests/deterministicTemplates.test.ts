import { describe, expect, it } from 'vitest';

import { fallbackGeneratePost, fallbackSuggestHashtags } from '../src/services/deterministicTemplates';

describe('fallbackGeneratePost', () => {
  it('returns a structured fallback with all expected fields', () => {
    const result = fallbackGeneratePost('Test topic', 'professional', 'short');

    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('variations');
    expect(result).toHaveProperty('improvements');
    expect(result).toHaveProperty('relatedIdeas');
    expect(result).toHaveProperty('fallbackUsed');
    expect(typeof result.content).toBe('string');
    expect(Array.isArray(result.variations)).toBe(true);
    expect(Array.isArray(result.improvements)).toBe(true);
    expect(Array.isArray(result.relatedIdeas)).toBe(true);
    expect(result.fallbackUsed).toBe(true);
  });

  it('returns exactly 3 variations with labels Short, Professional, Engaging', () => {
    const result = fallbackGeneratePost('Test', 'casual', 'long');

    expect(result.variations.length).toBe(3);
    const labels = result.variations.map((v) => v.label);
    expect(labels).toContain('Short');
    expect(labels).toContain('Professional');
    expect(labels).toContain('Engaging');
  });

  it('each variation has label and content', () => {
    const result = fallbackGeneratePost('Test', 'excited', 'bullet');

    result.variations.forEach((v) => {
      expect(typeof v.label).toBe('string');
      expect(typeof v.content).toBe('string');
      expect(v.label.length).toBeGreaterThan(0);
      expect(v.content.length).toBeGreaterThan(0);
    });
  });

  it('content contains topic and tone', () => {
    const result = fallbackGeneratePost('My custom topic', 'excited', 'short');

    expect(result.content).toContain('My custom topic');
    expect(result.content).toContain('excited');
    expect(result.content).toContain('[Draft');
  });

  it('improvements contains 2 suggestions', () => {
    const result = fallbackGeneratePost('Test', 'professional', 'long');

    expect(result.improvements.length).toBe(2);
    expect(result.improvements[0]).toContain('AI generation unavailable');
  });

  it('relatedIdeas contains 2 ideas', () => {
    const result = fallbackGeneratePost('Test', 'professional', 'bullet');

    expect(result.relatedIdeas.length).toBe(2);
    expect(result.relatedIdeas[0]).toContain('Test');
  });

  it('accepts all formats without error', () => {
    const short = fallbackGeneratePost('Test', 'professional', 'short');
    const long = fallbackGeneratePost('Test', 'professional', 'long');
    const bullet = fallbackGeneratePost('Test', 'professional', 'bullet');

    expect(short.content).toContain('short');
    expect(long.content).toContain('long');
    expect(bullet.content).toContain('bullet');
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
