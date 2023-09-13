import { task } from '@linen/sitemap';
import { uploadFile } from '@linen/web/services/aws/s3';
import { type JobHelpers } from 'graphile-worker';
import { KeepAlive } from '../helpers/keep-alive';
import { Logger } from '../helpers/logger';

export const sitemap = async (_: any, helpers: JobHelpers) => {
  const keepAlive = new KeepAlive(helpers);
  keepAlive.start();

  const logger = new Logger(helpers.logger);

  logger.info({ sitemap: process.env.S3_UPLOAD_BUCKET });
  try {
    await task(uploadFile, logger);
    logger.info({ sitemap: 'finished' });
  } finally {
    keepAlive.end();
  }
};
