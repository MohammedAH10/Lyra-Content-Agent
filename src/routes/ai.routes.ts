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

router.post('/recommend-media', validate({ body: recommendMediaSchema }), aiController.recommendMedia);

export default router;
