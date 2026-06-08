import File from '../models/File';
import { ScoredRecommendation, scoreFiles } from './keywordScoring.service';
import { logAiRequest } from './auditLog.service';

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
  userId?: string,
): Promise<MediaRecommendationResult> => {
  const startTime = Date.now();
  const approvedFiles = await File.find({ status: 'approved' });

  if (approvedFiles.length === 0) {
    await logAiRequest({
      userId, requestType: 'recommend', inputSummary: `Recommend: "${postContent.slice(0, 80)}..."`,
      modelUsed: 'keyword-scoring', latencyMs: Date.now() - startTime,
      success: true, fallbackUsed: false,
    });
    return {
      recommendations: [],
      noResultReason: EMPTY_LIBRARY_MESSAGE,
    };
  }

  if (type) {
    const hasType = approvedFiles.some((f) => f.type === type);
    if (!hasType) {
      await logAiRequest({
        userId, requestType: 'recommend', inputSummary: `Recommend(type=${type}): "${postContent.slice(0, 80)}..."`,
        modelUsed: 'keyword-scoring', latencyMs: Date.now() - startTime,
        success: true, fallbackUsed: false,
      });
      return {
        recommendations: [],
        noResultReason: `No approved media files of type "${type}" are available.`,
      };
    }
  }

  const results = scoreFiles(approvedFiles, postContent, type, limit);

  if (results.length === 0) {
    await logAiRequest({
      userId, requestType: 'recommend', inputSummary: `Recommend: "${postContent.slice(0, 80)}..."`,
      modelUsed: 'keyword-scoring', latencyMs: Date.now() - startTime,
      success: true, fallbackUsed: false,
    });
    return {
      recommendations: [],
      noResultReason: NO_MATCH_MESSAGE,
    };
  }

  await logAiRequest({
    userId, requestType: 'recommend', inputSummary: `Recommend: "${postContent.slice(0, 80)}..."`,
    modelUsed: 'keyword-scoring', latencyMs: Date.now() - startTime,
    success: true, fallbackUsed: false,
  });

  return {
    recommendations: results,
    noResultReason: null,
  };
};
