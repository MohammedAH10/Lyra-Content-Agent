import AiLog from '../models/AiLog';
import { AiLogDocument, AiLogAttrs } from '../types';
import { AiRequestType } from '../utils/constants';
import logger from '../utils/logger';

export const logAiRequest = async (attrs: AiLogAttrs): Promise<void> => {
  await AiLog.create(attrs);
  logger.info('AI request logged', {
    requestType: attrs.requestType,
    success: attrs.success,
    fallbackUsed: attrs.fallbackUsed,
    latencyMs: attrs.latencyMs,
  });
};

export type GetLogsParams = {
  userId?: string;
  requestType?: AiRequestType;
  limit?: number;
  offset?: number;
  sort?: 'asc' | 'desc';
};

export type GetLogsResult = {
  logs: AiLogDocument[];
  total: number;
};

export const getAiLogs = async (params: GetLogsParams = {}): Promise<GetLogsResult> => {
  const {
    userId,
    requestType,
    limit = 50,
    offset = 0,
    sort = 'desc',
  } = params;

  const filter: Record<string, unknown> = {};
  if (userId) filter.userId = userId;
  if (requestType) filter.requestType = requestType;

  const [logs, total] = await Promise.all([
    AiLog.find(filter)
      .sort({ createdAt: sort === 'desc' ? -1 : 1 })
      .skip(offset)
      .limit(limit)
      .exec(),
    AiLog.countDocuments(filter),
  ]);

  return { logs, total };
};
