import { Document, Types } from 'mongoose';

import {
  AiRequestType,
  FileStatus,
  FileType,
  FileVisibility,
  PostDraftStatus,
} from '../utils/constants';

export interface FileAttrs {
  name: string;
  type: FileType;
  mimeType?: string;
  description?: string;
  size: number;
  url: string;
  data?: Buffer;
  tags?: string[];
  s3Key?: string;
  s3Bucket?: string;
  s3Url?: string;
  ownerId?: string;
  visibility?: FileVisibility;
  uploadDate?: Date;
  status?: FileStatus;
  moderationReason?: string;
}

export interface FileDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  type: FileType;
  mimeType: string;
  description: string;
  size: number;
  url: string;
  data?: Buffer;
  tags: string[];
  s3Key?: string;
  s3Bucket?: string;
  s3Url?: string;
  ownerId?: string;
  visibility: FileVisibility;
  uploadDate: Date;
  status: FileStatus;
  moderationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostDraftAttrs {
  userId: string;
  inputText: string;
  tone?: 'professional' | 'casual' | 'excited';
  format?: 'short' | 'long' | 'bullet';
  generatedContent?: {
    content: string;
    variations: { label: string; content: string }[];
    improvements: string[];
    relatedIdeas: string[];
    fallbackUsed: boolean;
  };
  selectedVariation?: string;
  acceptedOutput?: string;
  attachedFileIds?: Types.ObjectId[];
  status?: PostDraftStatus;
}

export interface PostDraftDocument extends Document {
  _id: Types.ObjectId;
  userId: string;
  inputText: string;
  tone: 'professional' | 'casual' | 'excited';
  format: 'short' | 'long' | 'bullet';
  generatedContent: {
    content: string;
    variations: { label: string; content: string }[];
    improvements: string[];
    relatedIdeas: string[];
    fallbackUsed: boolean;
  } | null;
  selectedVariation: string | null;
  acceptedOutput: string | null;
  attachedFileIds: Types.ObjectId[];
  status: PostDraftStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface AiLogAttrs {
  userId?: string;
  requestType: AiRequestType;
  inputSummary: string;
  modelUsed: string;
  latencyMs: number;
  success: boolean;
  fallbackUsed?: boolean;
  errorMessage?: string;
  tokenEstimate?: number;
}

export interface AiLogDocument extends Document {
  _id: Types.ObjectId;
  userId: string | null;
  requestType: AiRequestType;
  inputSummary: string;
  modelUsed: string;
  latencyMs: number;
  success: boolean;
  fallbackUsed: boolean;
  errorMessage: string | null;
  tokenEstimate: number | null;
  createdAt: Date;
  updatedAt: Date;
}
