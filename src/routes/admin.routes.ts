import { Router } from 'express';
import { z } from 'zod';

import { getAiLogsHandler } from '../controllers/admin.controller';
import { validate } from '../middleware/validate';

const router = Router();

const getAiLogsQuerySchema = z
  .object({
    userId: z.string().optional(),
    requestType: z.enum(['generate', 'regenerate', 'hashtags', 'recommend', 'improve', 'related']).optional(),
    limit: z.coerce.number().int().min(1).max(200).optional().default(50),
    offset: z.coerce.number().int().min(0).optional().default(0),
    sort: z.enum(['asc', 'desc']).optional().default('desc'),
  })
  .strip();

router.get('/logs/ai', validate({ query: getAiLogsQuerySchema }), getAiLogsHandler);

export default router;
