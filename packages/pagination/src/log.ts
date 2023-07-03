import { logger } from '@linen/logger';

logger.level = process.env.LOG_LEVEL || 'error';

export { logger };
