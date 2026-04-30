import { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';

import app from '../src/app';
import { connectDb } from '../src/config/db';
import logger from '../src/utils/logger';

let connecting = false;
let connected = false;

const connectToDatabase = async (): Promise<void> => {
  if (connected) {
    return;
  }

  if (connecting) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return;
  }

  connecting = true;

  try {
    await connectDb();
    connected = true;
  } catch (error) {
    logger.error('Database connection failed in serverless function', {
      error: (error as Error).message,
    });
    throw error;
  } finally {
    connecting = false;
  }
};

export default async (req: VercelRequest, res: VercelResponse): Promise<void> => {
  try {
    await connectToDatabase();
    app(req, res);
  } catch (error) {
    logger.error('Serverless function error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: (error as Error).message || 'An unexpected error occurred.',
        details: {},
      },
    });
  }
};
