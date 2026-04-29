import { RequestHandler } from 'express';

import {
  MediaRecommendation,
  recommendMediaForPost,
} from '../services/recommendation.service';
import { FileDocument } from '../types';

const serializeFile = (file: FileDocument) => ({
  id: file._id.toString(),
  name: file.name,
  type: file.type,
  size: file.size,
  url: file.url,
  tags: file.tags,
  uploadDate: file.uploadDate,
  status: file.status,
  moderationReason: file.moderationReason,
  createdAt: file.createdAt,
  updatedAt: file.updatedAt,
});

const serializeRecommendation = (recommendation: MediaRecommendation) => ({
  file: serializeFile(recommendation.file),
  score: recommendation.score,
  matchReason: recommendation.matchReason,
});

export const recommendMedia: RequestHandler = async (req, res, next) => {
  try {
    const result = await recommendMediaForPost(req.body.postContent);

    if ('message' in result) {
      res.status(200).json({
        success: true,
        data: result,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        recommendations: result.recommendations.map(serializeRecommendation),
        totalMatched: result.totalMatched,
      },
    });
  } catch (error) {
    next(error);
  }
};
