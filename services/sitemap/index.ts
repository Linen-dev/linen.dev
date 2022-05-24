/**
 * if crawler access linen through customer domain, we will serve their sitemap from s3
 *    the file will be persisted on: s3://bucket/sitemaps/<community>/sitemap-index.xml
 *
 * if crawler access our own domain, <community.linen.dev> or <linen.dev/{s,d}/community>,
 * we will serve all free tiers sitemap from s3
 *    the file will be persisted on: s3://bucket/sitemaps/linen.dev/sitemap-index.xml
 *
 * our next sitemap.xml page must identify if crawler comes from custom domain or not
 * and return the correct s3 file, the same must happen for our sitemap pagination
 * sitemap has a limit of 50k urls, so we are split the files in 45k, the sequence files will be sitemap-N.xml
 *
 * the process to create the s3 files will be triggered by a cronjob, every day at 0:00 gmt-0
 *
 * TODO:
 * [x] next page serving the s3 file
 * [x] test in staging database
 * [x] upload to s3
 * [x] next page identify linen.dev
 * [x] cache s3 file locally
 * [x] gzip
 * [ ] implement it for premium communities
 */

import superagent from 'superagent';
import prisma from '../../client';
import {
  lineSeparatedURLsToSitemapOptions,
  SitemapAndIndexStream,
  SitemapStream,
} from 'sitemap';
import stream from 'stream';
import os from 'os';
import zlib from 'zlib';
import S3 from 'aws-sdk/clients/s3';
import NodeCache from 'node-cache';

const sitemapCache = new NodeCache({ stdTTL: 86400 });

const s3Client = new S3({
  credentials: {
    accessKeyId: process.env.AWS_UPLOADER_AK as string,
    secretAccessKey: process.env.AWS_UPLOADER_SK as string,
  },
  maxRetries: 10,
});

const CONSTRAINS = {
  HOSTNAME: 'https://linen.dev' as const,
  S3_BUCKET: 'linen-assets' as const,
  S3_KEY_PREFIX: 'sitemap/linen.dev/' as const,
};

const communityTypeMap: Record<string, string> = {
  discord: 'd',
  slack: 's',
};

type Result = {
  channel: {
    account: {
      discordServerId: string | null;
      slackDomain: string | null;
    } | null;
  };
  incrementId: number;
  slug: string | null;
};

class GetThreadsStream extends stream.Readable {
  myCursor = 0;
  times = 0;
  take = 2000;
  async _read() {
    const results = await prisma.slackThreads.findMany({
      select: {
        incrementId: true,
        slug: true,
        channel: {
          select: {
            account: {
              select: {
                discordServerId: true,
                slackDomain: true,
              },
            },
          },
        },
      },
      where: {
        messageCount: { gt: 1 },
        channel: {
          account: {
            premium: false,
          },
        },
      },
      orderBy: {
        incrementId: 'asc',
      },
      take: this.take,
      skip: this.myCursor,
    });
    this.push(JSON.stringify(results));
    console.log(this.times++);
    if (results.length < this.take) {
      this.push(null);
    }
    this.myCursor += this.take;
  }
}

function identifyCommunityType(thread: Result) {
  return communityTypeMap[
    thread?.channel?.account?.discordServerId ? 'discord' : 'slack'
  ];
}

function identifyCommunityName(thread: Result) {
  return encodeURI(
    thread?.channel?.account?.slackDomain ||
      thread?.channel?.account?.discordServerId ||
      ''
  );
}

const threadUriTransform = new stream.Transform({
  writableObjectMode: true,
  transform(chunk, encoding, callback) {
    const threads: Result[] = JSON.parse(chunk);
    callback(
      null,
      threads
        .map((thread) =>
          encodeURI(
            [
              identifyCommunityType(thread),
              identifyCommunityName(thread),
              't',
              thread.incrementId,
              thread.slug || 'topic',
            ].join('/')
          )
        )
        .join(os.EOL)
    );
  },
});

function buildSitemapAndIndexStream() {
  return new SitemapAndIndexStream({
    limit: 50000,
    // @ts-expect-error
    getSitemapStream: (i) => {
      const sitemapStream = new SitemapStream({
        hostname: CONSTRAINS.HOSTNAME,
      });
      const ws = sitemapStream
        .pipe(zlib.createGzip())
        .pipe(new UploaderStream(`sitemap_${i}_chunk.xml`));
      return [
        new URL(`sitemap/${i}/chunk.xml`, CONSTRAINS.HOSTNAME).toString(),
        sitemapStream,
        ws,
      ];
    },
  });
}

class UploaderStream extends stream.Writable {
  data = Buffer.from('');
  fileName: string;

  constructor(fileName: string) {
    super();
    this.fileName = fileName;
  }

  _write(c: any, e: BufferEncoding, cb: (error?: Error | null) => void): void {
    const buffer = Buffer.isBuffer(c) ? c : Buffer.from(c);
    this.data = Buffer.concat([this.data, buffer]);
    cb();
  }

  async _final(cb: (error?: Error | null) => void): Promise<void> {
    console.time(this.fileName + 's3Uploader');
    await s3Uploader(this.fileName, this.data);
    console.timeEnd(this.fileName + 's3Uploader');
    cb();
  }
}

async function s3Uploader(key: string, body: string | Buffer) {
  await s3Client
    .putObject({
      Bucket: CONSTRAINS.S3_BUCKET,
      Key: CONSTRAINS.S3_KEY_PREFIX + key,
      Body: Buffer.from(body),
      ContentType: 'application/xml',
      ContentEncoding: 'gzip',
    })
    .promise();
}

function processLinenSitemap() {
  const threadsStream = new GetThreadsStream();
  const transformStream = threadsStream.pipe(threadUriTransform);
  const splitStream = lineSeparatedURLsToSitemapOptions(transformStream);
  const sms = buildSitemapAndIndexStream();
  splitStream
    .pipe(sms)
    .pipe(zlib.createGzip())
    .pipe(new UploaderStream('sitemap.xml'));
}

async function downloadS3File(url: string) {
  let isCached = sitemapCache.get(url);
  if (!isCached) {
    isCached = await superagent.get(url).then((response) => response.body);
    sitemapCache.set(url, isCached);
  }
  return isCached;
}

async function downloadSitemapMain() {
  return downloadS3File(
    `https://${CONSTRAINS.S3_BUCKET}.s3.amazonaws.com/${CONSTRAINS.S3_KEY_PREFIX}sitemap.xml`
  );
}

async function downloadSitemapChunk(chunk: number) {
  return downloadS3File(
    `https://${CONSTRAINS.S3_BUCKET}.s3.amazonaws.com/${CONSTRAINS.S3_KEY_PREFIX}sitemap_${chunk}_chunk.xml`
  );
}

export { processLinenSitemap, downloadSitemapChunk, downloadSitemapMain };

// processLinenSitemap()
