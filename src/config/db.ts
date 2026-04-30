import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import logger from '../utils/logger';

export const connectDb = async (mongoUri = process.env.MONGODB_URI): Promise<typeof mongoose> => {
  const uri = mongoUri;

  if (!uri) {
    logger.warn('MONGODB_URI not set, using in-memory MongoDB');
    const mongoServer = await MongoMemoryServer.create();
    const memoryUri = mongoServer.getUri();
    const connection = await mongoose.connect(memoryUri);
    logger.info('MongoDB connected (in-memory)');
    return connection;
  }

  try {
    const connection = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 30000,
    });
    logger.info('MongoDB connected');
    return connection;
  } catch (error) {
    logger.warn('MongoDB connection failed, falling back to in-memory MongoDB', { error: (error as Error).message });
    const mongoServer = await MongoMemoryServer.create();
    const memoryUri = mongoServer.getUri();
    const connection = await mongoose.connect(memoryUri);
    logger.info('MongoDB connected (in-memory fallback)');
    return connection;
  }
};

export const disconnectDb = async (): Promise<void> => {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
};
