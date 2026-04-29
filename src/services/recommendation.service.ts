import File from '../models/File';
import { FileDocument } from '../types';

const EMPTY_LIBRARY_MESSAGE = 'No approved media files are available in the library.';
const NO_MATCH_MESSAGE = 'No files matched the content of this post.';

const STOPWORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'for',
  'from',
  'in',
  'is',
  'it',
  'of',
  'on',
  'or',
  'our',
  'that',
  'the',
  'this',
  'to',
  'with',
]);

export type MediaRecommendation = {
  file: FileDocument;
  score: number;
  matchReason: string;
};

export type MediaRecommendationResult =
  | {
      recommendations: MediaRecommendation[];
      totalMatched: number;
    }
  | {
      recommendations: [];
      message: string;
    };

export const extractKeywords = (content: string): string[] => {
  const words = content
    .toLowerCase()
    .match(/[a-z0-9]+/g);

  if (!words) {
    return [];
  }

  return Array.from(new Set(words.filter((word) => word.length > 1 && !STOPWORDS.has(word))));
};

const getSearchableTerms = (file: FileDocument): Set<string> => {
  const fileTerms = extractKeywords([file.name, ...file.tags].join(' '));
  return new Set(fileTerms);
};

export const recommendMediaForPost = async (
  postContent: string,
  limit = Number(process.env.MAX_RECOMMENDATIONS || 5),
): Promise<MediaRecommendationResult> => {
  const approvedFiles = await File.find({ status: 'approved' });

  if (approvedFiles.length === 0) {
    return {
      recommendations: [],
      message: EMPTY_LIBRARY_MESSAGE,
    };
  }

  const keywords = extractKeywords(postContent);

  const recommendations = approvedFiles
    .map((file) => {
      const searchableTerms = getSearchableTerms(file);
      const matches = keywords.filter((keyword) => searchableTerms.has(keyword));

      return {
        file,
        score: matches.length,
        matchReason: `File tags/name match post keywords: ${matches.join(', ')}`,
      };
    })
    .filter((recommendation) => recommendation.score > 0)
    .sort((first, second) => second.score - first.score)
    .slice(0, limit);

  if (recommendations.length === 0) {
    return {
      recommendations: [],
      message: NO_MATCH_MESSAGE,
    };
  }

  return {
    recommendations,
    totalMatched: recommendations.length,
  };
};
