import File from '../models/File';
import { ScoredRecommendation, scoreFiles } from './keywordScoring.service';

const EMPTY_LIBRARY_MESSAGE = 'No approved media files are available in the library.';
const NO_MATCH_MESSAGE = 'No files matched the content of this post.';

export type MediaRecommendationResult = {
  recommendations: ScoredRecommendation[];
  noResultReason: string | null;
};

export const recommendMediaForPost = async (
  postContent: string,
  type?: string,
  limit: number = 5,
): Promise<MediaRecommendationResult> => {
  const approvedFiles = await File.find({ status: 'approved' });

  if (approvedFiles.length === 0) {
    return {
      recommendations: [],
      noResultReason: EMPTY_LIBRARY_MESSAGE,
    };
  }

  if (type) {
    const hasType = approvedFiles.some((f) => f.type === type);
    if (!hasType) {
      return {
        recommendations: [],
        noResultReason: `No approved media files of type "${type}" are available.`,
      };
    }
  }

  const results = scoreFiles(approvedFiles, postContent, type, limit);

  if (results.length === 0) {
    return {
      recommendations: [],
      noResultReason: NO_MATCH_MESSAGE,
    };
  }

  return {
    recommendations: results,
    noResultReason: null,
  };
};
