import dotenv from 'dotenv';

import app from './app';
import logger from './utils/logger';

dotenv.config();

const port = process.env.PORT || 3000;

app.listen(port, () => {
  logger.info(`API server listening on port ${port}`);
});
