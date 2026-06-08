import { model, models, Schema, Types } from 'mongoose';

import { PostDraftDocument } from '../types';
import { POST_DRAFT_STATUSES } from '../utils/constants';

const postDraftSchema = new Schema<PostDraftDocument>(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
    },
    inputText: {
      type: String,
      required: true,
      trim: true,
    },
    tone: {
      type: String,
      enum: ['professional', 'casual', 'excited'],
      default: 'professional',
    },
    format: {
      type: String,
      enum: ['short', 'long', 'bullet'],
      default: 'short',
    },
    generatedContent: {
      type: {
        content: { type: String },
        variations: [
          {
            _id: false,
            label: { type: String },
            content: { type: String },
          },
        ],
        improvements: [{ type: String }],
        relatedIdeas: [{ type: String }],
        fallbackUsed: { type: Boolean },
      },
      default: null,
    },
    selectedVariation: {
      type: String,
      default: null,
    },
    acceptedOutput: {
      type: String,
      default: null,
    },
    attachedFileIds: {
      type: [{ type: Schema.Types.ObjectId, ref: 'File' }],
      default: [],
    },
    status: {
      type: String,
      enum: POST_DRAFT_STATUSES,
      default: 'draft',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const PostDraft = models.PostDraft || model<PostDraftDocument>('PostDraft', postDraftSchema);

export default PostDraft;