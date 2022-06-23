import { DynamoDB } from 'aws-sdk';
import { gzipSync, gunzipSync } from 'zlib';
import * as Sentry from '@sentry/nextjs';

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var DocumentClient: DynamoDB.DocumentClient | undefined;
}

const DocumentClient =
  global.DocumentClient ||
  new DynamoDB.DocumentClient({
    region: process.env.S3_UPLOAD_REGION as string,
    credentials: {
      accessKeyId: process.env.S3_UPLOAD_KEY as string,
      secretAccessKey: process.env.S3_UPLOAD_SECRET as string,
    },
  });

if (process.env.NODE_ENV !== 'production')
  global.DocumentClient = DocumentClient;

const TableName = process.env.CACHE_TABLE as string;

function buildTimeToLive() {
  return Math.floor(new Date().getTime() / 1000) + 86400;
}

function compressObject(obj: any) {
  if (typeof obj !== 'string') {
    obj = JSON.stringify(obj);
  }
  return gzipSync(obj);
}

function decompressObject(data: any) {
  const content = gunzipSync(data).toString();
  try {
    return JSON.parse(content);
  } catch (error) {
    return content;
  }
}

async function getCache(key: string) {
  return await DocumentClient.get({ Key: { pk: key }, TableName })
    .promise()
    .then((response) => {
      if (response.Item) {
        return decompressObject(response.Item.data);
      } else {
        return null;
      }
    })
    .catch((e) => {
      console.error(e);
      Sentry.captureException(e);
      return null;
    });
}

async function setCache(key: string, obj: any) {
  return await DocumentClient.put({
    TableName,
    Item: {
      pk: key,
      data: compressObject(obj),
      ttl: buildTimeToLive(),
    },
  })
    .promise()
    .catch((e) => {
      Sentry.captureException(e);
      console.error(e);
    });
}

export { getCache, setCache };
