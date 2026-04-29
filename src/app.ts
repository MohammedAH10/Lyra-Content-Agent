import express, { Request, Response } from 'express';

import { errorHandler } from './middleware/errorHandler';
import aiRoutes from './routes/ai.routes';
import filesRoutes from './routes/files.routes';
import logger from './utils/logger';

const app = express();

app.use(express.json());

app.use((req, _res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString(),
  });
  next();
});

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy',
  });
});

app.use('/files', filesRoutes);
app.use('/ai', aiRoutes);

app.use(errorHandler);

export default app;
