import S3 from 'aws-sdk/clients/s3';
import { captureException, flush } from '@sentry/nextjs';
import { awsCredentials } from './credentials';

declare global {
  // eslint-disable-next-line no-var
  var s3Client: S3 | undefined;
}

const s3Client = global.s3Client || new S3(awsCredentials);

if (process.env.NODE_ENV !== 'production') global.s3Client = s3Client;

const Bucket = process.env.S3_UPLOAD_BUCKET as string;

export async function uploadFile(Key: string, Body: Buffer) {
  try {
    return await s3Client
      .putObject({
        Bucket,
        Key,
        Body,
      })
      .promise();
  } catch (error) {
    captureException(error);
    await flush(2000);
    console.error(error);
  }
}
