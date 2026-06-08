import { RequestHandler } from 'express';

import { getAiLogs } from '../services/auditLog.service';
import { AiLogDocument } from '../types';

const serializeLog = (log: AiLogDocument) => ({
  id: log._id.toString(),
  userId: log.userId,
  requestType: log.requestType,
  inputSummary: log.inputSummary,
  modelUsed: log.modelUsed,
  latencyMs: log.latencyMs,
  success: log.success,
  fallbackUsed: log.fallbackUsed,
  errorMessage: log.errorMessage,
  tokenEstimate: log.tokenEstimate,
  createdAt: log.createdAt,
  updatedAt: log.updatedAt,
});

export const getAiLogsHandler: RequestHandler = async (req, res, next) => {
  try {
    const { userId, requestType, limit, offset, sort } = req.query;

    const result = await getAiLogs({
      userId: userId as string | undefined,
      requestType: requestType as any,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
      sort: sort as 'asc' | 'desc' | undefined,
    });

    res.status(200).json({
      success: true,
      data: {
        logs: result.logs.map(serializeLog),
        total: result.total,
      },
    });
  } catch (error) {
    next(error);
  }
};
