import mongoose from 'mongoose';

import logger from '../utils/logger';

export const connectDb = async (mongoUri = process.env.MONGODB_URI): Promise<typeof mongoose> => {
  if (!mongoUri) {
    throw new Error('MONGODB_URI is required');
  }

  try {
    const connection = await mongoose.connect(mongoUri);
    logger.info('MongoDB connected');
    return connection;
  } catch (error) {
    logger.error('MongoDB connection failed', { error });
    throw error;
  }
};

export const disconnectDb = async (): Promise<void> => {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
};
