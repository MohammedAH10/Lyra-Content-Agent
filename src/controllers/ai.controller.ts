import { RequestHandler } from 'express';

import {
  generatePost as generatePostService,
  regeneratePost as regeneratePostService,
  suggestHashtags as suggestHashtagsService,
} from '../services/ai.service';
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

export const generatePost: RequestHandler = async (req, res, next) => {
  try {
    const { topic, tone, format, userId } = req.body;

    const result = await generatePostService(topic, tone, format);

    res.status(200).json({
      success: true,
      data: {
        content: result.content,
        variations: result.variations,
        improvements: result.improvements,
        relatedIdeas: result.relatedIdeas,
        fallbackUsed: result.fallbackUsed,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const regeneratePost: RequestHandler = async (req, res, next) => {
  try {
    const { previousContent, topic, tone, format, additionalInstructions } = req.body;

    const result = await regeneratePostService(
      previousContent,
      topic,
      tone,
      format,
      additionalInstructions,
    );

    res.status(200).json({
      success: true,
      data: {
        content: result.content,
        variations: result.variations,
        improvements: result.improvements,
        relatedIdeas: result.relatedIdeas,
        fallbackUsed: result.fallbackUsed,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const suggestHashtags: RequestHandler = async (req, res, next) => {
  try {
    const { postContent } = req.body;

    const result = await suggestHashtagsService(postContent);

    res.status(200).json({
      success: true,
      data: {
        hashtags: result.hashtags,
      },
    });
  } catch (error) {
    next(error);
  }
};
