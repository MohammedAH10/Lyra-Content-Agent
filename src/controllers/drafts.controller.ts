import { RequestHandler } from 'express';

import * as postDraftService from '../services/postDraft.service';
import { PostDraftDocument } from '../types';

const serializeDraft = (draft: PostDraftDocument) => ({
  id: draft._id.toString(),
  userId: draft.userId,
  inputText: draft.inputText,
  tone: draft.tone,
  format: draft.format,
  generatedContent: draft.generatedContent,
  selectedVariation: draft.selectedVariation,
  acceptedOutput: draft.acceptedOutput,
  attachedFileIds: draft.attachedFileIds.map((id) => id.toString()),
  status: draft.status,
  createdAt: draft.createdAt,
  updatedAt: draft.updatedAt,
});

export const createDraft: RequestHandler = async (req, res, next) => {
  try {
    const draft = await postDraftService.createDraft(req.body);
    res.status(201).json({ success: true, data: serializeDraft(draft) });
  } catch (error) {
    next(error);
  }
};

export const getDraft: RequestHandler = async (req, res, next) => {
  try {
    const draft = await postDraftService.getDraftById(req.params.id as string);
    res.status(200).json({ success: true, data: serializeDraft(draft) });
  } catch (error) {
    next(error);
  }
};

export const updateDraft: RequestHandler = async (req, res, next) => {
  try {
    const { content, selectedVariation } = req.body;

    const id = req.params.id as string;

    if (content !== undefined) {
      const draft = await postDraftService.updateDraftContent(
        id,
        content,
        selectedVariation,
      );
      res.status(200).json({ success: true, data: serializeDraft(draft) });
      return;
    }

    const { generatedContent, tone, format, status } = req.body;
    const updates: Record<string, unknown> = {};
    if (generatedContent !== undefined) updates.generatedContent = generatedContent;
    if (tone !== undefined) updates.tone = tone;
    if (format !== undefined) updates.format = format;
    if (status !== undefined) updates.status = status;

    const draft = await postDraftService.updateDraft(id, updates);
    res.status(200).json({ success: true, data: serializeDraft(draft) });
  } catch (error) {
    next(error);
  }
};

export const acceptDraft: RequestHandler = async (req, res, next) => {
  try {
    const { acceptedOutput, selectedVariation, userId, modelUsed } = req.body;

    if (!acceptedOutput || typeof acceptedOutput !== 'string' || !acceptedOutput.trim()) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'acceptedOutput is required and must be a non-empty string.' },
      });
      return;
    }

    const draft = await postDraftService.acceptDraft(
      req.params.id as string,
      acceptedOutput,
      selectedVariation,
      userId,
      modelUsed,
    );
    res.status(200).json({ success: true, data: serializeDraft(draft) });
  } catch (error) {
    next(error);
  }
};

export const listDrafts: RequestHandler = async (req, res, next) => {
  try {
    const { userId, status } = req.query;
    const drafts = await postDraftService.listDrafts(
      userId as string | undefined,
      status as string | undefined,
    );
    res.status(200).json({ success: true, data: drafts.map(serializeDraft) });
  } catch (error) {
    next(error);
  }
};
