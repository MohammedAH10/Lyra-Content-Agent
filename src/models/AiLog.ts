import { model, models, Schema } from 'mongoose';

import { AiLogDocument } from '../types';
import { AI_REQUEST_TYPES } from '../utils/constants';

const aiLogSchema = new Schema<AiLogDocument>(
  {
    userId: {
      type: String,
      default: null,
      trim: true,
    },
    requestType: {
      type: String,
      enum: AI_REQUEST_TYPES,
      required: true,
    },
    inputSummary: {
      type: String,
      required: true,
      trim: true,
    },
    modelUsed: {
      type: String,
      required: true,
      trim: true,
    },
    latencyMs: {
      type: Number,
      required: true,
      min: 0,
    },
    success: {
      type: Boolean,
      required: true,
    },
    fallbackUsed: {
      type: Boolean,
      default: false,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    tokenEstimate: {
      type: Number,
      default: null,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

const AiLog = models.AiLog || model<AiLogDocument>('AiLog', aiLogSchema);

export default AiLog;