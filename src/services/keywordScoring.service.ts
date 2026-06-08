import { FileDocument } from '../types';

const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'in', 'is', 'it', 'of', 'on', 'or', 'our', 'that', 'the', 'this',
  'to', 'with', 'was', 'were', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'but', 'not', 'so', 'if', 'no', 'up', 'out',
  'all', 'can', 'just', 'more', 'some', 'than', 'then', 'also', 'very',
  'even', 'still', 'already', 'about', 'into', 'over', 'after', 'before',
  'between', 'other', 'such', 'only', 'own', 'same', 'both', 'each',
  'few', 'most', 'any', 'new', 'good', 'first', 'last', 'long', 'great',
  'little', 'much', 'many', 'now', 'here', 'there', 'back', 'high',
  'down', 'off', 'on', 'at', 'to', 'by', 'as', 'of', 'it', 'is', 'be',
  'their', 'them', 'they', 'these', 'those', 'what', 'when', 'where',
  'which', 'who', 'whom', 'why', 'how',
]);

export type ScoredRecommendation = {
  fileId: string;
  name: string;
  type: string;
  score: number;
  reason: string;
};

const extractKeywords = (text: string): string[] => {
  const words = text.toLowerCase().match(/[a-z0-9]+/g);
  if (!words) return [];
  return [...new Set(words.filter((w) => w.length > 1 && !STOPWORDS.has(w)))];
};

export const scoreFileAgainstContent = (
  file: FileDocument,
  postKeywords: string[],
): ScoredRecommendation | null => {
  if (postKeywords.length === 0) return null;

  const searchableText = [
    file.name,
    ...(file.tags || []),
    file.description || '',
    file.type,
  ].join(' ');

  const fileKeywords = extractKeywords(searchableText);
  if (fileKeywords.length === 0) return null;

  const matchedKeywords = postKeywords.filter((kw) => fileKeywords.includes(kw));

  if (matchedKeywords.length === 0) return null;

  const score = Math.round((matchedKeywords.length / postKeywords.length) * 100) / 100;

  return {
    fileId: file._id.toString(),
    name: file.name,
    type: file.type,
    score,
    reason: `Matches ${matchedKeywords.join(', ')}`,
  };
};

export const scoreFiles = (
  files: FileDocument[],
  postContent: string,
  type?: string,
  limit: number = 5,
): ScoredRecommendation[] => {
  const postKeywords = extractKeywords(postContent);
  if (postKeywords.length === 0) return [];

  let candidates = files;
  if (type) {
    candidates = candidates.filter((f) => f.type === type);
  }

  const scored = candidates
    .map((file) => scoreFileAgainstContent(file, postKeywords))
    .filter((r): r is ScoredRecommendation => r !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
};
