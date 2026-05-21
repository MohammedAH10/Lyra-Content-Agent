import { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';

import app from '../src/app';
import logger from '../src/utils/logger';

let connecting = false;
let connected = false;

const connectToDatabase = async (): Promise<void> => {
  if (connected) {
    return;
  }

  if (connecting) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return;
  }

  connecting = true;

  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set.');
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 10000,
    });
    connected = true;
    logger.info('Database connected in serverless function');
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
    if (req.url?.startsWith('/api/')) {
      req.url = req.url.replace(/^\/api/, '');
    }
    app(req, res);
  } catch (error) {
    logger.error('Serverless function error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: (error as Error).message || 'An unexpected error occurred.',
        details: { stack: (error as Error).stack },
      },
    });
  }
};
