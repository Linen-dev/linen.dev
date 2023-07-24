import { promises as fs, createReadStream } from 'fs';
import * as path from 'path';

async function getFiles(dir: string): Promise<string | string[]> {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map((dirent) => {
      const res = path.resolve(dir, dirent.name);
      return dirent.isDirectory() ? getFiles(res) : res;
    })
  );
  return Array.prototype.concat(...files);
}

export async function uploadDir(
  uploadFile: (args: {
    Key: string;
    Body: any;
    CacheControl?: string;
  }) => Promise<any>,
  s3Path: string
) {
  const files = (await getFiles(s3Path)) as string[];
  const uploads = files.map(async (filePath) =>
    uploadFile({
      Key: path.relative(s3Path, filePath),
      Body: createReadStream(filePath),
      CacheControl: 'max-age=86400',
    })
  );
  return Promise.all(uploads);
}
