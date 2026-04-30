import mongoose from 'mongoose';

import logger from '../utils/logger';

export const connectDb = async (mongoUri = process.env.MONGODB_URI): Promise<typeof mongoose> => {
  if (!mongoUri) {
    try {
      logger.warn('MONGODB_URI not set, using in-memory MongoDB');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const memoryUri = mongoServer.getUri();
      const connection = await mongoose.connect(memoryUri);
      logger.info('MongoDB connected (in-memory)');
      return connection;
    } catch (fallbackError) {
      logger.error('In-memory MongoDB fallback failed', { error: fallbackError });
      throw new Error('MONGODB_URI is required and could not connect to the provided URI. In-memory fallback is only available locally.');
    }
  }

  try {
    const connection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 30000,
    });
    logger.info('MongoDB connected');
    return connection;
  } catch (error) {
    logger.error('MongoDB connection failed', { error: (error as Error).message });
    throw error;
  }
};

export const disconnectDb = async (): Promise<void> => {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
};
