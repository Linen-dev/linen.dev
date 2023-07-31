import { task } from '@linen/sitemap';
import { uploadFile } from '@linen/web/services/aws/s3';
import { type JobHelpers } from 'graphile-worker';
import util from 'util';

export const sitemap = async (_: any, helpers: JobHelpers) => {
  const logger = (...args: any) => {
    helpers.logger.info(util.format(...args));
  };
  helpers.logger.info(`sitemap ${process.env.S3_UPLOAD_BUCKET}`);
  await task(uploadFile, logger);
  helpers.logger.info('sitemap...end');
};
