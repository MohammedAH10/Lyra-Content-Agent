import { GeneratePostResult, SuggestHashtagsResult } from './ai.service';

const FALLBACK_HASHTAGS = ['#ContentDraft', '#AIUnavailable', '#DraftMode'];

export const fallbackGeneratePost = (
  prompt: string,
  tone: string,
  variations: number,
): GeneratePostResult => {
  const cappedVariations = Math.min(Math.max(variations, 1), 5);

  const primary = [
    `[Draft — AI generation unavailable]`,
    ``,
    `${prompt}`,
    ``,
    `Tone: ${tone}`,
    `---`,
    `This is a placeholder draft. AI generation is temporarily unavailable.`,
    `You can edit this content directly or try again later.`,
  ].join('\n');

  const variationsList: string[] = [];
  for (let i = 1; i <= cappedVariations; i++) {
    variationsList.push(
      `Variation ${i}: ${prompt} [Tone: ${tone}, Draft: AI unavailable]`,
    );
  }

  return {
    primary,
    variations: variationsList,
    hashtags: [...FALLBACK_HASHTAGS],
  };
};

export const fallbackSuggestHashtags = (postContent: string): SuggestHashtagsResult => {
  const words = postContent
    .toLowerCase()
    .match(/\b[a-z]{3,}\b/g) || [];

  const uniqueWords = [...new Set(words)];
  const significantWords = uniqueWords.filter(
    (w) => !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'has', 'was', 'had', 'our', 'its', 'from', 'with', 'that', 'this', 'have', 'been', 'will', 'were', 'what', 'when', 'where', 'which', 'their', 'them', 'than', 'then', 'also', 'just', 'very', 'well', 'even', 'still', 'already', 'about', 'into', 'over', 'after', 'before', 'between', 'other', 'more', 'such', 'only', 'own', 'same', 'both', 'each', 'few', 'most', 'some', 'any', 'new', 'good', 'first', 'last', 'long', 'great', 'little', 'much', 'many', 'now', 'here', 'there', 'back', 'high', 'down', 'up', 'off', 'out', 'on', 'in', 'at', 'to', 'by', 'as', 'of', 'it', 'is', 'be', 'do', 'so'].includes(w),
  );

  const hashtags = significantWords.length >= 3
    ? significantWords.slice(0, 6).map((w) => `#${w.charAt(0).toUpperCase() + w.slice(1)}`)
    : FALLBACK_HASHTAGS;

  return { hashtags };
};
