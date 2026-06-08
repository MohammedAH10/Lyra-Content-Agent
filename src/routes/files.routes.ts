import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';

import * as filesController from '../controllers/files.controller';
import { validate } from '../middleware/validate';
import { FILE_STATUSES, FILE_TYPES } from '../utils/constants';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

const createFileSchema = z
  .object({
    name: z.string().trim().min(1),
    type: z.enum(FILE_TYPES),
    size: z.number().int().nonnegative(),
    url: z.string().trim().url(),
    tags: z.array(z.string().trim().min(1)).optional().default([]),
    description: z.string().trim().optional().default(''),
    mimeType: z.string().trim().optional().default(''),
    ownerId: z.string().trim().optional(),
    visibility: z.enum(['private', 'public']).optional().default('private'),
  })
  .strip();

const listFilesQuerySchema = z
  .object({
    type: z.enum(FILE_TYPES).optional(),
    status: z.enum(FILE_STATUSES).optional(),
  })
  .strip();

const updateFileStatusParamsSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid file ID'),
});

const updateFileStatusSchema = z
  .object({
    status: z.enum(['approved', 'rejected']),
    moderationReason: z.string().trim().min(1).optional(),
  })
  .strip()
  .superRefine((data, ctx) => {
    if (data.status === 'rejected' && !data.moderationReason) {
      ctx.addIssue({
        code: 'custom',
        path: ['moderationReason'],
        message: 'moderationReason is required when status is rejected',
      });
    }
  });

const uploadBodySchema = z
  .object({
    name: z.string().trim().min(1, 'File name is required'),
    tags: z.string().optional().default(''),
    description: z.string().trim().optional().default(''),
    type: z.enum(FILE_TYPES).optional(),
  })
  .strip();

router.get('/', validate({ query: listFilesQuerySchema }), filesController.listFiles);
router.get('/:id', validate({ params: updateFileStatusParamsSchema }), filesController.getFileById);
router.get('/:id/data', validate({ params: updateFileStatusParamsSchema }), filesController.getFileData);
router.post('/', validate({ body: createFileSchema }), filesController.createFile);
router.post(
  '/upload',
  upload.single('file'),
  validate({ body: uploadBodySchema }),
  filesController.createFileFromUpload,
);
router.patch(
  '/:id/status',
  validate({ params: updateFileStatusParamsSchema, body: updateFileStatusSchema }),
  filesController.updateFileStatus,
);

export default router;
