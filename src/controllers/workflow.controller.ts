import { RequestHandler } from 'express';

import * as filesService from '../services/files.service';
import { generateS3Reference } from '../services/s3Reference.service';
import { FileDocument } from '../types';
import logger from '../utils/logger';

const serializeFile = (file: FileDocument) => ({
  id: file._id.toString(),
  name: file.name,
  type: file.type,
  mimeType: file.mimeType,
  description: file.description,
  size: file.size,
  url: file.url,
  tags: file.tags,
  s3Key: file.s3Key || null,
  s3Bucket: file.s3Bucket || null,
  s3Url: file.s3Url || null,
  ownerId: file.ownerId || null,
  visibility: file.visibility,
  uploadDate: file.uploadDate,
  status: file.status,
  moderationReason: file.moderationReason || null,
  createdAt: file.createdAt,
  updatedAt: file.updatedAt,
});

function getFileTypeFromName(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp'].includes(ext)) return 'image';
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return 'video';
  if (['mp3', 'wav', 'ogg', 'aac', 'flac'].includes(ext)) return 'audio';
  if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'].includes(ext)) return 'document';
  return 'document';
}

export const initiateS3Upload: RequestHandler = async (req, res, next) => {
  try {
    const uploadedFile = (req as any).file;
    if (!uploadedFile) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'No file provided' },
      });
      return;
    }

    const storedName = req.body.name?.trim();
    if (!storedName) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'File name is required' },
      });
      return;
    }

    const mimeType = uploadedFile.mimetype || '';
    const type = (req.body.type || getFileTypeFromName(storedName)) as any;
    const tags = req.body.tags
      ? String(req.body.tags).split(',').map((t: string) => t.trim()).filter(Boolean)
      : [];
    const description = req.body.description?.trim() || '';
    const ownerId = req.body.ownerId?.trim() || null;

    const s3Ref = generateS3Reference(storedName);

    const file = await filesService.initiateS3Upload({
      name: storedName,
      type,
      mimeType,
      size: uploadedFile.size,
      tags,
      description,
      data: uploadedFile.buffer,
      s3Bucket: s3Ref.s3Bucket,
      s3Key: s3Ref.s3Key,
      s3Url: s3Ref.s3Url,
      ownerId,
    });

    logger.info('S3 upload initiated', {
      fileId: file._id.toString(),
      s3Key: file.s3Key,
      s3Bucket: file.s3Bucket,
    });

    res.status(201).json({
      success: true,
      data: serializeFile(file),
    });
  } catch (error) {
    next(error);
  }
};

export const processModerationResult: RequestHandler = async (req, res, next) => {
  try {
    const fileId = String(req.params.id);
    const { moderationScore, moderationCategories } = req.body;

    if (moderationScore === undefined || typeof moderationScore !== 'number') {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'moderationScore is required (number 0-100)' },
      });
      return;
    }

    if (moderationScore < 0 || moderationScore > 100) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'moderationScore must be between 0 and 100' },
      });
      return;
    }

    const file = await filesService.processModerationResult(fileId, {
      score: moderationScore,
      categories: moderationCategories || [],
    });

    logger.info('Moderation result processed', {
      fileId: file._id.toString(),
      status: file.status,
      score: moderationScore,
    });

    res.status(200).json({
      success: true,
      data: serializeFile(file),
    });
  } catch (error) {
    next(error);
  }
};

export const serveFileByS3Key: RequestHandler = async (req, res, next) => {
  try {
    const s3Key = String(req.query.s3Key);
    if (!s3Key) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 's3Key query parameter is required' },
      });
      return;
    }

    const file = await filesService.getFileByS3Key(s3Key);

    if (!file.data) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'File data not available' },
      });
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const mimeTypes: Record<string, string> = {
      png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
      gif: 'image/gif', svg: 'image/svg+xml', webp: 'image/webp',
      bmp: 'image/bmp', mp4: 'video/mp4', mov: 'video/quicktime',
      avi: 'video/x-msvideo', mkv: 'video/x-matroska', webm: 'video/webm',
      mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg',
      aac: 'audio/aac', flac: 'audio/flac', pdf: 'application/pdf',
      doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ppt: 'application/vnd.ms-powerpoint', pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      txt: 'text/plain',
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', file.data.length);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('x-amz-request-id', `simulated-${Date.now()}`);
    res.setHeader('x-amz-id-2', `simulated-host-id-${file._id.toString()}`);
    res.end(file.data);
  } catch (error) {
    next(error);
  }
};
