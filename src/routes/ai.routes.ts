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
    prompt: z.string().trim().min(10, 'Prompt is too short to generate meaningful content. Please provide more detail.'),
    tone: z.enum(['professional', 'casual', 'excited']).optional().default('professional'),
    variations: z.coerce.number().int().min(1).optional().default(3),
  })
  .strip();

const suggestHashtagsSchema = z
  .object({
    postContent: z.string().trim().min(1),
  })
  .strip();

router.post('/recommend-media', validate({ body: recommendMediaSchema }), aiController.recommendMedia);
router.post('/generate-post', validate({ body: generatePostSchema }), aiController.generatePost);
router.post('/suggest-hashtags', validate({ body: suggestHashtagsSchema }), aiController.suggestHashtags);

export default router;
