import dotenv from 'dotenv';

import app from './app';
import { connectDb } from './config/db';
import logger from './utils/logger';

dotenv.config();

const port = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDb();

    app.listen(port, () => {
      logger.info(`API server listening on port ${port}`);
    });
  } catch (error) {
    logger.error('Failed to start API server', { error });
    process.exit(1);
  }
};

void startServer();
