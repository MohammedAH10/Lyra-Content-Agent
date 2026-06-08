import { describe, expect, it } from 'vitest';

import PostDraft from '../src/models/PostDraft';
import { POST_DRAFT_STATUSES } from '../src/utils/constants';

const validDraftData = {
  userId: 'user-123',
  inputText: 'Write a post about our new AI-powered education platform',
};

describe('PostDraft model validation', () => {
  it('creates a valid draft with default values', async () => {
    const draft = new PostDraft(validDraftData);

    await expect(draft.validate()).resolves.toBeUndefined();
    expect(draft.status).toBe('draft');
    expect(draft.tone).toBe('professional');
    expect(draft.format).toBe('short');
    expect(draft.attachedFileIds).toEqual([]);
    expect(draft.generatedContent).toBeNull();
    expect(draft.selectedVariation).toBeNull();
    expect(draft.acceptedOutput).toBeNull();
  });

  it.each(POST_DRAFT_STATUSES)('accepts status %s', async (status) => {
    const draft = new PostDraft({ ...validDraftData, status });

    await expect(draft.validate()).resolves.toBeUndefined();
  });

  it('rejects unsupported statuses', async () => {
    const draft = new PostDraft({ ...validDraftData, status: 'published' });

    await expect(draft.validate()).rejects.toThrow();
  });

  it('accepts tone and format', async () => {
    const draft = new PostDraft({
      ...validDraftData,
      tone: 'casual',
      format: 'long',
    });

    await expect(draft.validate()).resolves.toBeUndefined();
    expect(draft.tone).toBe('casual');
    expect(draft.format).toBe('long');
  });

  it('rejects unknown tone values', async () => {
    const draft = new PostDraft({ ...validDraftData, tone: 'aggressive' });

    await expect(draft.validate()).rejects.toThrow();
  });

  it('stores generated content with variations, improvements, and related ideas', async () => {
    const draft = new PostDraft({
      ...validDraftData,
      generatedContent: {
        content: 'We are excited to launch our AI-powered education platform!',
        variations: [
          { label: 'Short', content: 'Introducing our AI education platform.' },
          { label: 'Professional', content: 'We are pleased to announce the launch.' },
        ],
        improvements: ['Add a call to action', 'Mention the target audience'],
        relatedIdeas: ['Post about student success stories', 'Post about platform features'],
        fallbackUsed: false,
      },
    });

    await expect(draft.validate()).resolves.toBeUndefined();
    expect(draft.generatedContent?.content).toContain('AI-powered education');
    expect(draft.generatedContent?.variations).toHaveLength(2);
    expect(draft.generatedContent?.improvements).toHaveLength(2);
    expect(draft.generatedContent?.relatedIdeas).toHaveLength(2);
    expect(draft.generatedContent?.fallbackUsed).toBe(false);
  });

  it('tracks accepted output and selected variation', async () => {
    const draft = new PostDraft({
      ...validDraftData,
      generatedContent: {
        content: 'Original content',
        variations: [],
        improvements: [],
        relatedIdeas: [],
        fallbackUsed: false,
      },
      selectedVariation: 'We have selected this variation for the final post.',
      acceptedOutput: 'We have selected this variation for the final post.',
      status: 'accepted',
    });

    await expect(draft.validate()).resolves.toBeUndefined();
    expect(draft.selectedVariation).toBeTruthy();
    expect(draft.acceptedOutput).toBeTruthy();
    expect(draft.status).toBe('accepted');
  });

  it('rejects empty userId', async () => {
    const draft = new PostDraft({ ...validDraftData, userId: '' });

    await expect(draft.validate()).rejects.toThrow();
  });

  it('rejects empty inputText', async () => {
    const draft = new PostDraft({ ...validDraftData, inputText: '' });

    await expect(draft.validate()).rejects.toThrow();
  });
});