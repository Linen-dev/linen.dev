import { promises as fs, createReadStream } from 'fs';
import * as path from 'path';

const getMimeType = (ext: string) => {
  switch (ext) {
    case '.xml':
      return 'application/xml';
    case '.txt':
      return 'text/plain';
    default:
      return 'application/octet-stream';
  }
};

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

export async function uploadDir(s3: any, s3Path: string, bucketName: string) {
  const files = (await getFiles(s3Path)) as string[];
  const uploads = files.map((filePath) =>
    s3
      .putObject({
        Key: path.relative(s3Path, filePath),
        Bucket: bucketName,
        Body: createReadStream(filePath),
        ContentType: getMimeType(path.extname(filePath)),
      })
      .promise()
  );
  return Promise.all(uploads);
}
