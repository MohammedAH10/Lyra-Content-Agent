import { Router } from 'express';
import { z } from 'zod';

import * as aiController from '../controllers/ai.controller';
import { validate } from '../middleware/validate';

const router = Router();

const recommendMediaSchema = z
  .object({
    postContent: z.string().trim().min(10),
  })
  .strip();

const generatePostSchema = z
  .object({
    topic: z.string().trim().min(5, 'Topic is too short. Please provide more detail.'),
    tone: z.enum(['professional', 'casual', 'excited']).optional().default('professional'),
    format: z.enum(['short', 'long', 'bullet']).optional().default('short'),
    userId: z.string().trim().optional(),
  })
  .strip();

const regeneratePostSchema = z
  .object({
    previousContent: z.string().trim().min(1, 'Previous content is required for regeneration.'),
    topic: z.string().trim().min(5, 'Topic is too short.'),
    tone: z.enum(['professional', 'casual', 'excited']).optional().default('professional'),
    format: z.enum(['short', 'long', 'bullet']).optional().default('short'),
    additionalInstructions: z.string().trim().optional(),
  })
  .strip();

const suggestHashtagsSchema = z
  .object({
    postContent: z.string().trim().min(1),
  })
  .strip();

router.post('/recommend-media', validate({ body: recommendMediaSchema }), aiController.recommendMedia);
router.post('/generate-post', validate({ body: generatePostSchema }), aiController.generatePost);
router.post('/regenerate-post', validate({ body: regeneratePostSchema }), aiController.regeneratePost);
router.post('/suggest-hashtags', validate({ body: suggestHashtagsSchema }), aiController.suggestHashtags);

export default router;
