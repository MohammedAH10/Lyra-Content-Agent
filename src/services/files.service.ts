import File from '../models/File';
import { FileAttrs, FileDocument } from '../types';

type CreateFileInput = Omit<FileAttrs, 'status' | 'uploadDate' | 'moderationReason'>;

export const createFile = async (input: CreateFileInput): Promise<FileDocument> => {
  return File.create({
    ...input,
    status: 'upload_initiated',
  });
};
