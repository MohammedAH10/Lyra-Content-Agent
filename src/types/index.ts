import { Document, Types } from 'mongoose';

import { FileStatus, FileType } from '../utils/constants';

export interface FileAttrs {
  name: string;
  type: FileType;
  size: number;
  url: string;
  data?: Buffer;
  tags?: string[];
  uploadDate?: Date;
  status?: FileStatus;
  moderationReason?: string;
}

export interface FileDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  type: FileType;
  size: number;
  url: string;
  data?: Buffer;
  tags: string[];
  uploadDate: Date;
  status: FileStatus;
  moderationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}
