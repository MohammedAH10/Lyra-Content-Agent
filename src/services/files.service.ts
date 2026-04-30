import File from '../models/File';
import { FileAttrs, FileDocument } from '../types';
import { FileStatus, FileType } from '../utils/constants';
import { AppError } from '../utils/AppError';
import logger from '../utils/logger';

type CreateFileInput = Omit<FileAttrs, 'status' | 'uploadDate' | 'moderationReason'>;

type ListFilesFilters = {
  type?: FileType;
  status?: FileStatus;
};

type UpdateFileStatusInput = {
  status: 'approved' | 'rejected';
  moderationReason?: string;
};

export const createFile = async (input: CreateFileInput): Promise<FileDocument> => {
  try {
    return File.create({
      ...input,
      status: 'upload_initiated',
    });
  } catch (error: unknown) {
    if (error instanceof Error && (error as any).name === 'MongoServerError') {
      throw new AppError(500, 'DB_ERROR', 'Failed to save file record to database.', {
        originalError: error.message,
      });
    }
    throw error;
  }
};

export const listFiles = async (filters: ListFilesFilters = {}): Promise<FileDocument[]> => {
  const query: Partial<Pick<FileAttrs, 'type' | 'status'>> = {};

  if (filters.type) {
    query.type = filters.type;
  }

  if (filters.status) {
    query.status = filters.status;
  } else {
    query.status = 'approved';
  }

  let files: FileDocument[];
  try {
    files = await File.find(query).sort({ uploadDate: -1 });
  } catch (error: unknown) {
    if (error instanceof Error && (error as any).name === 'MongoServerError') {
      throw new AppError(500, 'DB_ERROR', 'Failed to retrieve files from database.', {
        originalError: error.message,
      });
    }
    throw error;
  }

  if (!filters.status) {
    try {
      const filteredCount = await File.countDocuments({
        ...(filters.type ? { type: filters.type } : {}),
        status: { $ne: 'approved' },
      });

      if (filteredCount > 0) {
        logger.warn('Non-approved files filtered from list response', {
          filteredCount,
          type: filters.type,
        });
      }
    } catch (error: unknown) {
      if (error instanceof Error && (error as any).name === 'MongoServerError') {
        throw new AppError(500, 'DB_ERROR', 'Failed to count files in database.', {
          originalError: error.message,
        });
      }
      throw error;
    }
  }

  return files;
};

export const updateFileStatus = async (
  fileId: string,
  input: UpdateFileStatusInput,
): Promise<FileDocument> => {
  const update = {
    status: input.status,
    moderationReason: input.status === 'rejected' ? input.moderationReason : undefined,
  };

  let file: FileDocument | null;
  try {
    file = await File.findByIdAndUpdate(fileId, update, {
      returnDocument: 'after',
      runValidators: true,
    });
  } catch (error: unknown) {
    if (error instanceof Error && (error as any).name === 'MongoServerError') {
      throw new AppError(500, 'DB_ERROR', 'Failed to update file status in database.', {
        originalError: error.message,
      });
    }
    throw error;
  }

  if (!file) {
    throw new AppError(404, 'NOT_FOUND', 'File not found');
  }

  logger.info('File status updated', {
    fileId: file._id.toString(),
    status: file.status,
  });

  return file;
};
