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
 * [x] implement it for premium communities
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
import { cleanUpDomain } from '../../utilities/domain';
import util from 'util';

const pipeline = util.promisify(stream.pipeline);

const sitemapCache = new NodeCache({ stdTTL: 86400 });

const s3Client = new S3({
  credentials: {
    accessKeyId: process.env.AWS_UPLOADER_AK as string,
    secretAccessKey: process.env.AWS_UPLOADER_SK as string,
  },
  maxRetries: 10,
});

const S3_BUCKET = 'linen-assets';

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
  _id: string | undefined;
  _domain: string | undefined;
  _mapper: any;
  constructor(id?: string, domain?: string) {
    super();
    this._id = id ? id : undefined;
    this._domain = domain;
    this._mapper = id ? mapper['customDomain'] : mapper['linen.dev'];
  }

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
            ...(!this._id && { premium: false }),
            ...(this._id && { id: this._id }),
          },
        },
      },
      orderBy: {
        incrementId: 'asc',
      },
      take: this.take,
      skip: this.myCursor,
    });
    this.push(this._mapper(results));
    console.log(
      this._domain,
      ':: page ::',
      this.times++,
      ':: results ::',
      results.length
    );
    if (results.length === 0 || results.length < this.take) {
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

const mapper = {
  customDomain: (threads: any[]) =>
    threads
      .map((thread) =>
        encodeURI(['t', thread.incrementId, thread.slug || 'topic'].join('/'))
      )
      .join(os.EOL),
  'linen.dev': (threads: any[]) =>
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
      .join(os.EOL),
};

function buildSitemapAndIndexStream(domain: string) {
  const hostname = 'https://' + domain;
  return new SitemapAndIndexStream({
    limit: 50000,
    // @ts-expect-error
    getSitemapStream: (i) => {
      const sitemapStream = new SitemapStream({
        hostname,
      });
      const ws = sitemapStream
        .pipe(zlib.createGzip())
        .pipe(new UploaderStream(`sitemap_${i}_chunk.xml`, domain));
      return [
        new URL(`sitemap/${i}/chunk.xml`, hostname).toString(),
        sitemapStream,
        ws,
      ];
    },
  });
}

class UploaderStream extends stream.Writable {
  data = Buffer.from('');
  fileName: string;
  _domain: string; // domain is a attribute of stream.Writable

  constructor(fileName: string, _domain: string) {
    super();
    this.fileName = fileName;
    this._domain = _domain;
  }

  _write(c: any, e: BufferEncoding, cb: (error?: Error | null) => void): void {
    const buffer = Buffer.isBuffer(c) ? c : Buffer.from(c);
    this.data = Buffer.concat([this.data, buffer]);
    cb();
  }

  _final(cb: (error?: Error | null) => void): void {
    s3Uploader(this._domain, this.fileName, this.data, cb);
  }
}

async function s3Uploader(
  domain: string,
  key: string,
  body: string | Buffer,
  cb: (error?: Error | null) => void
) {
  await s3Client
    .putObject({
      Bucket: S3_BUCKET,
      Key: ['sitemap', domain, key].join('/'),
      Body: Buffer.from(body),
      ContentType: 'application/xml',
      ContentEncoding: 'gzip',
    })
    .promise()
    .then((e) => {
      console.log(domain, ':: putObject ::', key, e);
      cb();
    });
}

/**
 * on empty domain, it will process all free tier account with linen.dev domain
 * @param domain (optional) domain without protocol, fi: linen.dev
 * @param id (option) account id
 */
async function processLinenSitemap(domain: string, id?: string) {
  console.log('account ::', domain);
  return await pipeline(
    new GetThreadsStream(id, domain),
    lineSeparatedURLsToSitemapOptions,
    buildSitemapAndIndexStream(domain),
    zlib.createGzip(),
    new UploaderStream('sitemap.xml', domain)
  );
}

function awsErrorHandler(url: string) {
  return (error: any) => {
    if (error.status === 403) {
      throw '[ERROR] File Not found: ' + url;
    } else {
      console.error(error);
      throw 'Unknown error, please check our logs';
    }
  };
}

async function downloadS3File(url: string) {
  let isCached = sitemapCache.get(url);
  if (!isCached) {
    isCached = await superagent
      .get(url)
      .then((response) => response.body)
      .catch(awsErrorHandler(url));
    sitemapCache.set(url, isCached);
  }
  return isCached;
}

async function downloadSitemapMain(domain: string) {
  return downloadS3File(
    `https://${S3_BUCKET}.s3.amazonaws.com/sitemap/${domain}/sitemap.xml`
  );
}

async function downloadSitemapChunk(domain: string, chunk: number) {
  return downloadS3File(
    `https://${S3_BUCKET}.s3.amazonaws.com/sitemap/${domain}/sitemap_${chunk}_chunk.xml`
  );
}

async function buildSiteMap() {
  const premiumAccounts = await prisma.accounts.findMany({
    select: { redirectDomain: true, id: true },
    where: {
      redirectDomain: { not: { equals: null } },
      premium: true,
      channels: {
        some: {
          slackThreads: {
            some: {
              messages: { some: { id: { not: undefined } } },
            },
          },
        },
      },
    },
  });
  const jobs = [];
  for (let account of premiumAccounts) {
    if (account.redirectDomain) {
      jobs.push(
        processLinenSitemap(cleanUpDomain(account.redirectDomain), account.id)
      );
    }
  }
  jobs.push(processLinenSitemap(cleanUpDomain('linen.dev')));
  await Promise.all(jobs);
}

export { downloadSitemapChunk, downloadSitemapMain, buildSiteMap };
