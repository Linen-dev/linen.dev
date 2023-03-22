import S3 from 'aws-sdk/clients/s3';
import path from 'path';
import { awsCredentials } from './credentials';

declare global {
  // eslint-disable-next-line no-var
  var s3Client: S3 | undefined;
}

export const s3Client = global.s3Client || new S3(awsCredentials);

if (process.env.NODE_ENV !== 'production') global.s3Client = s3Client;

const Bucket = process.env.S3_UPLOAD_BUCKET as string;

export async function uploadFile(Key: string, Body: Buffer) {
  try {
    return await s3Client
      .putObject({
        Bucket,
        Key,
        Body,
        ContentType: getMimeType(path.extname(Key)),
      })
      .promise();
  } catch (error) {
    console.error(error);
  }
}

export async function deleteFiles(
  Objects: {
    Key: string;
  }[]
) {
  return await s3Client
    .deleteObjects({
      Bucket,
      Delete: {
        Objects,
        Quiet: true,
      },
    })
    .promise();
}

const getMimeType = (ext: string) => {
  const mimes: Record<string, string> = {
    aac: 'audio/aac',
    avi: 'video/x-msvideo',
    css: 'text/css',
    csv: 'text/csv',
    doc: 'application/msword',
    gif: 'image/gif',
    htm: 'text/html',
    html: 'text/html',
    ico: 'image/x-icon',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    js: 'application/javascript',
    json: 'application/json',
    mpeg: 'video/mpeg',
    mov: 'video/quicktime',
    pdf: 'application/pdf',
    ppt: 'application/vnd.ms-powerpoint',
    rar: 'application/x-rar-compressed',
    rtf: 'application/rtf',
    svg: 'image/svg+xml',
    tar: 'application/x-tar',
    tif: 'image/tiff',
    tiff: 'image/tiff',
    txt: 'text/plain',
    wav: 'audio/x-wav',
    weba: 'audio/webm',
    webm: 'video/webm',
    webp: 'image/webp',
    xhtml: 'application/xhtml+xml',
    xls: 'application/vnd.ms-excel',
    xml: 'application/xml',
    zip: 'application/zip',
    '7z': 'application/x-7z-compressed',
  };
  return mimes[ext] || 'application/octet-stream';
};
