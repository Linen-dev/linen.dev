import { build } from './build';

export async function task(
  uploadFile: (args: { Key: string; Body: any }) => Promise<any>,
  _: any
) {
  await build(uploadFile);
}
