import { Router } from 'express';
import { z } from 'zod';

import * as filesController from '../controllers/files.controller';
import { validate } from '../middleware/validate';
import { FILE_STATUSES, FILE_TYPES } from '../utils/constants';

const router = Router();

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

router.get('/', validate({ query: listFilesQuerySchema }), filesController.listFiles);
router.post('/', validate({ body: createFileSchema }), filesController.createFile);

export default router;
