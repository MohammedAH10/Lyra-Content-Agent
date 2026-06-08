import { RequestHandler } from 'express';

import {
  generatePost as generatePostService,
  regeneratePost as regeneratePostService,
  suggestHashtags as suggestHashtagsService,
  suggestImprovements as suggestImprovementsService,
  relatedPostIdeas as relatedPostIdeasService,
} from '../services/ai.service';
import { recommendMediaForPost } from '../services/recommendation.service';

export const recommendMedia: RequestHandler = async (req, res, next) => {
  try {
    const { postContent, type, limit } = req.body;

    const result = await recommendMediaForPost(postContent, type, limit);

    res.status(200).json({
      success: true,
      data: {
        recommendations: result.recommendations,
        noResultReason: result.noResultReason,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const generatePost: RequestHandler = async (req, res, next) => {
  try {
    const { topic, tone, format } = req.body;

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

export const suggestImprovements: RequestHandler = async (req, res, next) => {
  try {
    const { postContent } = req.body;

    const result = await suggestImprovementsService(postContent);

    res.status(200).json({
      success: true,
      data: {
        improvements: result.improvements,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const relatedPostIdeas: RequestHandler = async (req, res, next) => {
  try {
    const { postContent } = req.body;

    const result = await relatedPostIdeasService(postContent);

    res.status(200).json({
      success: true,
      data: {
        relatedIdeas: result.relatedIdeas,
      },
    });
  } catch (error) {
    next(error);
  }
};
