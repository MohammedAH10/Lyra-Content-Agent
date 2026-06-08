import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';

import * as workflowController from '../controllers/workflow.controller';
import { validate } from '../middleware/validate';
import { FILE_TYPES } from '../utils/constants';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

const initiateUploadBodySchema = z
  .object({
    name: z.string().trim().min(1, 'File name is required'),
    tags: z.string().optional().default(''),
    description: z.string().trim().optional().default(''),
    type: z.enum(FILE_TYPES).optional(),
    ownerId: z.string().trim().optional(),
  })
  .strip();

const moderationResultSchema = z
  .object({
    moderationScore: z.number().min(0).max(100),
    moderationCategories: z.array(z.string()).optional().default([]),
  })
  .strip();

const s3KeyQuerySchema = z
  .object({
    s3Key: z.string().trim().min(1, 's3Key query parameter is required'),
  })
  .strip();

router.post(
  '/files/initiate-upload',
  upload.single('file'),
  validate({ body: initiateUploadBodySchema }),
  workflowController.initiateS3Upload,
);

router.patch(
  '/workflow/files/:id/moderation-result',
  validate({ body: moderationResultSchema }),
  workflowController.processModerationResult,
);

router.get(
  '/files/s3-data',
  validate({ query: s3KeyQuerySchema }),
  workflowController.serveFileByS3Key,
);

export default router;
