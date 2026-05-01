import { ErrorRequestHandler } from 'express';

import { AppError } from '../utils/AppError';
import logger from '../utils/logger';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    logger.warn('Application error', {
      code: err.code,
      message: err.message,
      details: err.details,
    });

    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  logger.error('Unhandled application error', {
    message: (err as Error).message,
    stack: (err as Error).stack,
    name: (err as Error).name,
  });

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: (err as Error).message || 'An unexpected error occurred.',
      details: {
        stack: (err as Error).stack,
        name: (err as Error).name,
      },
    },
  });
};
