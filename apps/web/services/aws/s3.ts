import {
  S3Client,
  PutObjectCommand,
  DeleteObjectsCommand,
  type PutObjectCommandInput,
  CopyObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import path from 'path';
import { awsCredentials } from './credentials';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export { CopyObjectCommand, ListObjectsV2Command };

declare global {
  // eslint-disable-next-line no-var
  var s3Client: S3Client | undefined;
}

export const s3Client = global.s3Client || new S3Client(awsCredentials);

if (process.env.NODE_ENV !== 'production') global.s3Client = s3Client;

const Bucket = process.env.S3_UPLOAD_BUCKET as string;

export type UploadFileInput = Pick<
  PutObjectCommandInput,
  'Key' | 'Body' | 'CacheControl'
>;

export async function uploadFile({
  Key,
  Body,
  CacheControl = 'max-age=15557000, stale-if-error=31536000',
}: UploadFileInput) {
  try {
    const command = new PutObjectCommand({
      Bucket,
      Key,
      Body,
      ContentType: getMimeType(path.extname(Key!)),
      CacheControl,
    });
    return await s3Client.send(command);
  } catch (error) {
    console.error(error);
  }
}

export async function deleteFiles(
  Objects: {
    Key: string;
  }[]
) {
  const command = new DeleteObjectsCommand({
    Bucket,
    Delete: {
      Objects,
      Quiet: true,
    },
  });
  return await s3Client.send(command);
}

const getMimeType = (ext: string) => {
  const mimes: Record<string, string> = {
    '.aac': 'audio/aac',
    '.avi': 'video/x-msvideo',
    '.css': 'text/css',
    '.csv': 'text/csv',
    '.doc': 'application/msword',
    '.gif': 'image/gif',
    '.htm': 'text/html',
    '.html': 'text/html',
    '.ico': 'image/x-icon',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.mpeg': 'video/mpeg',
    '.mov': 'video/quicktime',
    '.pdf': 'application/pdf',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.png': 'image/png',
    '.rar': 'application/x-rar-compressed',
    '.rtf': 'application/rtf',
    '.svg': 'image/svg+xml',
    '.tar': 'application/x-tar',
    '.tif': 'image/tiff',
    '.tiff': 'image/tiff',
    '.txt': 'text/plain',
    '.wav': 'audio/x-wav',
    '.weba': 'audio/webm',
    '.webm': 'video/webm',
    '.webp': 'image/webp',
    '.xhtml': 'application/xhtml+xml',
    '.xls': 'application/vnd.ms-excel',
    '.xml': 'application/xml',
    '.zip': 'application/zip',
    '.7z': 'application/x-7z-compressed',
  };
  return mimes[ext] || 'application/octet-stream';
};

export const createPresignedUrl = ({ key }: { key: string }) => {
  const command = new PutObjectCommand({ Bucket, Key: key });
  // @ts-ignore
  return getSignedUrl(s3Client, command, { expiresIn: 1800 });
};
