import { RequestHandler } from 'express';

import * as filesService from '../services/files.service';

const serializeFile = (file: Awaited<ReturnType<typeof filesService.createFile>>) => ({
  id: file._id.toString(),
  name: file.name,
  type: file.type,
  size: file.size,
  url: file.url,
  tags: file.tags,
  uploadDate: file.uploadDate,
  status: file.status,
  moderationReason: file.moderationReason,
  createdAt: file.createdAt,
  updatedAt: file.updatedAt,
});

export const createFile: RequestHandler = async (req, res, next) => {
  try {
    const file = await filesService.createFile(req.body);

    res.status(201).json({
      success: true,
      data: serializeFile(file),
    });
  } catch (error) {
    next(error);
  }
};
