import { DynamoDB } from 'aws-sdk';
import { gzipSync, gunzipSync } from 'zlib';
import * as Sentry from '@sentry/nextjs';

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var DocumentClient: DynamoDB.DocumentClient | undefined;
  var localCache: Record<string, any> | undefined;
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

export const serialize = (...paramsArray: any[]) =>
  paramsArray
    .map((params) => {
      if (typeof params !== 'object') {
        return params;
      }
      return Object.entries(params)
        .map(([key, value]) => `${key}=${value}`)
        .join(',');
    })
    .join(',');

function log(...args: any) {
  if (process.env.LOG === 'true') {
    console.log(...args);
  }
}

/**
 * this variable will work as local cache to avoid duplicate requests
 * this cache will live the same time as lambda, between 15 min and a few hours
 */
let localCache: Record<string, any> = global.localCache || {};
function setLocalCache(key: string, data: any) {
  localCache[key] = data;
}
function getLocalCache(key: string) {
  return localCache[key];
}
function hasLocalCache(key: string) {
  return !!localCache[key];
}

if (process.env.NODE_ENV !== 'production') global.localCache = localCache;

async function getCache(pk: string, sk: string) {
  if (hasLocalCache(pk + sk)) {
    log('hit internal ::', pk, sk);
    return getLocalCache(pk + sk);
  }
  try {
    const response = await DocumentClient.get({
      Key: { pk, sk },
      TableName,
    }).promise();
    if (response.Item) {
      log('hit external ::', pk, sk);
      setLocalCache(pk + sk, decompressObject(response.Item.data));
      return getLocalCache(pk + sk);
    } else {
      return null;
    }
  } catch (error) {
    console.error(error);
    Sentry.captureException(error);
    return null;
  }
}

async function setCache(pk: string, sk: string, obj: any) {
  if (!obj || obj === '') return;
  try {
    await DocumentClient.put({
      TableName,
      Item: {
        pk,
        sk,
        data: compressObject(obj),
        ttl: buildTimeToLive(),
      },
    }).promise();
    setLocalCache(pk + sk, obj);
  } catch (error) {
    Sentry.captureException(error);
    console.error(error);
  }
}

/**
 * this function only accepts one parameter, if you need more then one
 * you should convert parameters to destructured object
 *
 * @param fn function to be executed
 * @param params parameters to be used in the function
 * @returns cached version of request
 */
export function memoize<R, T extends (...args: any[]) => Promise<R>>(fn: T): T {
  const g = async (...args: any[]) => {
    const qs = serialize(...args) as string;
    let result = await getCache(fn.name, qs);
    if (!result) {
      result = await fn(...args);
      if (!!result) {
        await setCache(fn.name, qs, result);
      }
    }
    return result;
  };
  return g as T;
}
