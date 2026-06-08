import PostDraft from '../models/PostDraft';
import { PostDraftAttrs, PostDraftDocument } from '../types';
import { AppError } from '../utils/AppError';
import logger from '../utils/logger';
import { logAiRequest } from './auditLog.service';

export const createDraft = async (
  attrs: PostDraftAttrs,
): Promise<PostDraftDocument> => {
  const draft = await PostDraft.create(attrs);
  logger.info('Post draft created', { draftId: draft._id, userId: attrs.userId });
  return draft;
};

export const getDraftById = async (id: string): Promise<PostDraftDocument> => {
  const draft = await PostDraft.findById(id);
  if (!draft) {
    throw new AppError(404, 'NOT_FOUND', `Post draft ${id} not found.`);
  }
  return draft;
};

export const updateDraft = async (
  id: string,
  updates: Partial<Pick<PostDraftAttrs, 'generatedContent' | 'tone' | 'format' | 'status'>>,
): Promise<PostDraftDocument> => {
  const draft = await PostDraft.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
  if (!draft) {
    throw new AppError(404, 'NOT_FOUND', `Post draft ${id} not found.`);
  }
  logger.info('Post draft updated', { draftId: id });
  return draft;
};

export const updateDraftContent = async (
  id: string,
  content: string,
  selectedVariation?: string,
): Promise<PostDraftDocument> => {
  const draft = await PostDraft.findById(id);
  if (!draft) {
    throw new AppError(404, 'NOT_FOUND', `Post draft ${id} not found.`);
  }

  if (draft.status !== 'draft') {
    throw new AppError(400, 'INVALID_STATE', `Cannot edit a draft with status "${draft.status}". Only "draft" drafts can be edited.`);
  }

  draft.generatedContent = {
    ...(draft.generatedContent || {
      content: '',
      variations: [],
      improvements: [],
      relatedIdeas: [],
      fallbackUsed: false,
    }),
    content,
  };

  if (selectedVariation) {
    draft.selectedVariation = selectedVariation;
  }

  await draft.save();
  logger.info('Post draft content updated', { draftId: id });
  return draft;
};

export const acceptDraft = async (
  id: string,
  acceptedOutput: string,
  selectedVariation?: string,
  userId?: string,
  modelUsed?: string,
): Promise<PostDraftDocument> => {
  const draft = await PostDraft.findById(id);
  if (!draft) {
    throw new AppError(404, 'NOT_FOUND', `Post draft ${id} not found.`);
  }

  if (draft.status !== 'draft') {
    throw new AppError(400, 'INVALID_STATE', `Cannot accept a draft with status "${draft.status}". Only "draft" drafts can be accepted.`);
  }

  draft.acceptedOutput = acceptedOutput;
  draft.status = 'accepted';
  if (selectedVariation) {
    draft.selectedVariation = selectedVariation;
  }

  await draft.save();

  await logAiRequest({
    userId: userId || draft.userId,
    requestType: 'generate',
    inputSummary: `Accepted draft ${id} — ${draft.inputText.slice(0, 100)}`,
    modelUsed: modelUsed || 'unknown',
    latencyMs: 0,
    success: true,
    fallbackUsed: draft.generatedContent?.fallbackUsed ?? false,
  });

  logger.info('Post draft accepted', { draftId: id });
  return draft;
};

export const deleteDraft = async (id: string): Promise<void> => {
  const draft = await PostDraft.findByIdAndDelete(id);
  if (!draft) {
    throw new AppError(404, 'NOT_FOUND', `Post draft ${id} not found.`);
  }
  logger.info('Post draft deleted', { draftId: id });
};

export const listDrafts = async (
  userId?: string,
  status?: string,
): Promise<PostDraftDocument[]> => {
  const filter: Record<string, unknown> = {};
  if (userId) filter.userId = userId;
  if (status) filter.status = status;

  return PostDraft.find(filter).sort({ updatedAt: -1 }).exec();
};
