import { Router } from 'express';
import { z } from 'zod';

import * as draftsController from '../controllers/drafts.controller';
import { validate } from '../middleware/validate';

const router = Router();

const createDraftSchema = z
  .object({
    userId: z.string().trim().min(1, 'userId is required.'),
    inputText: z.string().trim().min(1, 'inputText is required.'),
    tone: z.enum(['professional', 'casual', 'excited']).optional().default('professional'),
    format: z.enum(['short', 'long', 'bullet']).optional().default('short'),
    generatedContent: z
      .object({
        content: z.string(),
        variations: z.array(z.object({ label: z.string(), content: z.string() })),
        improvements: z.array(z.string()),
        relatedIdeas: z.array(z.string()),
        fallbackUsed: z.boolean(),
      })
      .optional(),
    status: z.enum(['draft', 'accepted', 'discarded']).optional().default('draft'),
  })
  .strip();

const updateDraftSchema = z
  .object({
    content: z.string().optional(),
    selectedVariation: z.string().optional(),
    generatedContent: z
      .object({
        content: z.string(),
        variations: z.array(z.object({ label: z.string(), content: z.string() })),
        improvements: z.array(z.string()),
        relatedIdeas: z.array(z.string()),
        fallbackUsed: z.boolean(),
      })
      .optional(),
    tone: z.enum(['professional', 'casual', 'excited']).optional(),
    format: z.enum(['short', 'long', 'bullet']).optional(),
    status: z.enum(['draft', 'accepted', 'discarded']).optional(),
  })
  .strip();

const acceptDraftSchema = z
  .object({
    acceptedOutput: z.string().trim().min(1, 'acceptedOutput is required.'),
    selectedVariation: z.string().optional(),
    userId: z.string().optional(),
    modelUsed: z.string().optional(),
  })
  .strip();

const listDraftsQuerySchema = z
  .object({
    userId: z.string().optional(),
    status: z.enum(['draft', 'accepted', 'discarded']).optional(),
  })
  .strip();

router.post('/drafts', validate({ body: createDraftSchema }), draftsController.createDraft);
router.get('/drafts', validate({ query: listDraftsQuerySchema }), draftsController.listDrafts);
router.get('/drafts/:id', draftsController.getDraft);
router.patch('/drafts/:id', validate({ body: updateDraftSchema }), draftsController.updateDraft);
router.post('/drafts/:id/accept', validate({ body: acceptDraftSchema }), draftsController.acceptDraft);

export default router;
