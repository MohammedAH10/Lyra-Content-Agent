import { model, models, Schema } from 'mongoose';

import { FileDocument } from '../types';
import { FILE_STATUSES, FILE_TYPES } from '../utils/constants';

const fileSchema = new Schema<FileDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: FILE_TYPES,
      required: true,
    },
    size: {
      type: Number,
      required: true,
      min: 0,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: FILE_STATUSES,
      default: 'upload_initiated',
      required: true,
    },
    moderationReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const File = models.File || model<FileDocument>('File', fileSchema);

export default File;
