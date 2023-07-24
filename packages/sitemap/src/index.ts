import { build } from './build';

export async function task(
  uploadFile: (args: {
    Key: string;
    Body: any;
    CacheControl?: string;
  }) => Promise<any>,
  _: any
) {
  await build(uploadFile);
}
