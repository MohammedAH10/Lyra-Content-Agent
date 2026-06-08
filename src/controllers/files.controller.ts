import { RequestHandler } from 'express';

import * as filesService from '../services/files.service';
import { FileDocument } from '../types';

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

export const createFileFromUpload: RequestHandler = async (req, res, next) => {
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

    const file = await filesService.createFileFromUploadWithModeration({
      name: storedName,
      type,
      size: uploadedFile.size,
      tags,
      data: uploadedFile.buffer,
      description,
    });

    res.status(201).json({
      success: true,
      data: serializeFile(file),
    });
  } catch (error) {
    next(error);
  }
};

export const listFiles: RequestHandler = async (req, res, next) => {
  try {
    const files = await filesService.listFiles(req.query);
    const data = files.map(serializeFile);

    res.status(200).json({
      success: true,
      data,
      count: data.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getFileById: RequestHandler = async (req, res, next) => {
  try {
    const file = await filesService.getFileById(String(req.params.id));

    res.status(200).json({
      success: true,
      data: serializeFile(file),
    });
  } catch (error) {
    next(error);
  }
};

export const getFileData: RequestHandler = async (req, res, next) => {
  try {
    const file = await filesService.getFileById(String(req.params.id));

    if (!file.data) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'File data not found' },
      });
      return;
    }

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

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', file.data.length);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.end(file.data);
  } catch (error) {
    next(error);
  }
};

export const updateFileStatus: RequestHandler = async (req, res, next) => {
  try {
    const file = await filesService.updateFileStatus(String(req.params.id), req.body);

    res.status(200).json({
      success: true,
      data: serializeFile(file),
    });
  } catch (error) {
    next(error);
  }
};
