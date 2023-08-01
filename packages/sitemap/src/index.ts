import { build } from './build';
import { Logger } from '@linen/types';

export async function task(
  uploadFile: (args: {
    Key: string;
    Body: any;
    CacheControl?: string;
  }) => Promise<any>,
  logger: Logger
) {
  await build(uploadFile, logger);
}
