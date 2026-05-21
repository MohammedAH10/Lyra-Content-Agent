import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';

import * as filesController from '../controllers/files.controller';
import { validate } from '../middleware/validate';
import { FILE_STATUSES, FILE_TYPES } from '../utils/constants';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 4 * 1024 * 1024,
  },
});

const createFileSchema = z
  .object({
    name: z.string().trim().min(1),
    type: z.enum(FILE_TYPES),
    size: z.number().int().nonnegative(),
    url: z.string().trim().url(),
    tags: z.array(z.string().trim().min(1)).optional().default([]),
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

router.get('/', validate({ query: listFilesQuerySchema }), filesController.listFiles);
router.get('/:id', validate({ params: updateFileStatusParamsSchema }), filesController.getFileById);
router.post('/', validate({ body: createFileSchema }), filesController.createFile);
router.post('/upload', upload.single('file'), filesController.uploadFile);
router.patch(
  '/:id/status',
  validate({ params: updateFileStatusParamsSchema, body: updateFileStatusSchema }),
  filesController.updateFileStatus,
);

export default router;
