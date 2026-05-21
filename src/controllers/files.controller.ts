import { RequestHandler } from 'express';
import { put } from '@vercel/blob';

import * as filesService from '../services/files.service';
import { FileDocument } from '../types';
import { AppError } from '../utils/AppError';
import { FileType } from '../utils/constants';

const serializeFile = (file: FileDocument) => ({
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

const getFileTypeFromName = (name: string): FileType => {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp'].includes(ext)) return 'image';
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return 'video';
  if (['mp3', 'wav', 'ogg', 'aac', 'flac'].includes(ext)) return 'audio';
  return 'document';
};

const getFileExtension = (name: string): string => {
  const index = name.lastIndexOf('.');
  if (index === -1 || index === name.length - 1) return '';
  return name.slice(index).toLowerCase();
};

const buildStoredName = (displayName: string, originalName: string): string => {
  const ext = getFileExtension(originalName);
  const trimmed = displayName.trim();
  const withoutExistingExt = ext && trimmed.toLowerCase().endsWith(ext)
    ? trimmed.slice(0, -ext.length)
    : trimmed;
  return `${withoutExistingExt}${ext}`
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '');
};

const parseTags = (value: unknown): string[] => {
  if (!value || typeof value !== 'string') return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map((tag) => String(tag).trim()).filter(Boolean);
    }
  } catch {
    return value.split(',').map((tag) => tag.trim()).filter(Boolean);
  }

  return [];
};

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

export const uploadFile: RequestHandler = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError(400, 'VALIDATION_ERROR', 'A file is required.');
    }

    const requestedName = String(req.body.name || '').trim();
    if (!requestedName) {
      throw new AppError(400, 'VALIDATION_ERROR', 'A new file name is required.');
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new AppError(
        500,
        'STORAGE_NOT_CONFIGURED',
        'BLOB_READ_WRITE_TOKEN is required to upload media.',
      );
    }

    const storedName = buildStoredName(requestedName, req.file.originalname);
    const blob = await put(`media/${storedName}`, req.file.buffer, {
      access: 'public',
      contentType: req.file.mimetype,
      addRandomSuffix: true,
    });

    const file = await filesService.createFile({
      name: storedName,
      type: getFileTypeFromName(storedName),
      size: req.file.size,
      url: blob.url,
      tags: parseTags(req.body.tags),
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
