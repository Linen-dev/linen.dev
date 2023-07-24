import {
  s3Client,
  CopyObjectCommand,
  ListObjectsV2Command,
} from '@linen/web/services/aws/s3';
import fs from 'fs/promises';
import os from 'os';
import { appendFileSync } from 'fs';

const Bucket = process.env.S3_UPLOAD_BUCKET;
const Prefix = 'attachments';
const filePrefix = `.local/s3-cache-control/${Prefix}`;
let count = 0;

async function run() {
  await fs.mkdir(`${filePrefix}`, { recursive: true });
  let ContinuationToken = await fs
    .readFile(`${filePrefix}/token`, {
      encoding: 'utf-8',
    })
    .catch((e) => {
      return undefined;
    });

  do {
    ContinuationToken = await job(ContinuationToken);
    if (!ContinuationToken) {
      break;
    }
  } while (true);
}

run();

async function job(ContinuationToken: any) {
  const response = await s3Client.send(
    new ListObjectsV2Command({
      Bucket,
      Prefix,
      ...(ContinuationToken && { ContinuationToken }),
    })
  );
  ContinuationToken = response.NextContinuationToken;
  ContinuationToken &&
    (await fs.writeFile(`${filePrefix}/token`, String(ContinuationToken)));

  await fs.appendFile(
    `${filePrefix}/content`,
    response.Contents!?.map((c) => c.Key).join(os.EOL) + os.EOL
  );

  const jobs = await Promise.allSettled(
    response.Contents?.filter((c) => {
      if (c.Key !== encodeURI(c.Key!)) {
        appendFileSync(`${filePrefix}/bad-input`, c.Key + os.EOL);
        return false;
      } else {
        return true;
      }
    }).map((file) =>
      s3Client.send(
        new CopyObjectCommand({
          Bucket,
          CopySource: Bucket + '/' + file.Key,
          Key: file.Key,
          MetadataDirective: 'REPLACE',
          CacheControl: 'max-age=15557000, stale-if-error=31536000',
        })
      )
    ) || []
  );
  count += jobs.length;
  console.log(count);
  const rejected = jobs.filter((j) => j.status === 'rejected');
  if (rejected.length) {
    await fs.appendFile(
      `${filePrefix}/failures`,
      JSON.stringify(rejected, null, 2) + os.EOL
    );
  }
  return ContinuationToken;
}
