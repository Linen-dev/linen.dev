import { task } from '@linen/sitemap';
import { s3Client } from 'services/aws/s3';
import { type JobHelpers } from 'graphile-worker';
import util from 'util';

export const sitemap = async (_: any, helpers: JobHelpers) => {
  const logger = (...args: any) => {
    helpers.logger.info(util.format(...args));
  };
  helpers.logger.info(`sitemap ${process.env.S3_UPLOAD_BUCKET}`);
  await task(s3Client, process.env.S3_UPLOAD_BUCKET!, logger);
  helpers.logger.info('sitemap...end');
};
