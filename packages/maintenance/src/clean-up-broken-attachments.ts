import { cleanEnv, str } from 'envalid';
import { prisma, slackAuthorizations } from '@linen/database';
import sharp, { Metadata } from 'sharp';
import axios from 'axios';
import fs from 'fs/promises';
import { resolve, extname } from 'path';
import { config } from 'dotenv';
import { slugify } from '@linen/utilities/string';
import { uploadFile } from '@linen/web/services/aws/s3';
import {
  BUCKET_PREFIX_FOR_ATTACHMENTS,
  LINEN_STATIC_CDN,
} from '@linen/web/config';
import os from 'os';

config({ path: '../../apps/web/.env' });

cleanEnv(process.env, {
  LINEN_STATIC_CDN: str(),
  DATABASE_URL: str(),
  S3_UPLOAD_BUCKET: str(),
  S3_UPLOAD_KEY: str(),
  S3_UPLOAD_SECRET: str(),
});

const random = () => (Math.random() + 1).toString(36).substring(2);

async function run() {
  await fs.mkdir('.local', { recursive: true });

  let last = await fs
    .readFile(`.local/last`, { encoding: 'utf-8' })
    .catch((e) => {
      return new Date().toISOString();
    });

  const workDir = resolve('./tmp-images');
  await fs.mkdir(workDir, { recursive: true });

  do {
    const attachments = await prisma.messageAttachments.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        messages: {
          select: {
            channel: {
              select: {
                id: true,
                accountId: true,
                account: {
                  select: {
                    slackAuthorizations: true,
                  },
                },
              },
            },
          },
        },
      },
      where: {
        AND: [
          {
            sourceUrl: {
              not: { startsWith: 'https://linen-assets.s3' },
            },
          },
          {
            sourceUrl: {
              not: {
                startsWith: 'https://static.main.linendev.com/attachments',
              },
            },
          },
          { mimetype: { startsWith: 'image' } },
          { createdAt: { lt: last } },
        ],
      },
    });

    for (const attachment of attachments) {
      console.log(attachment.internalUrl);

      const accountId = attachment.messages?.channel.accountId;
      const channelId = attachment.messages?.channel.id;
      if (!accountId || !channelId) {
        continue; // TODO: should remove attach
      }
      // const fileName = attachment.id || attachment.externalId || v4();
      // const extension = extname(attachment.internalUrl!);
      // console.log('extension', extension);

      // const filePath = `${workDir}/${accountId}/${channelId}/${fileName}`;
      // await fs.mkdir(filePath, { recursive: true });

      const image = await getImage(attachment);

      if (!image) {
        console.log('removing...');
        await fs.appendFile(
          `.local/removed`,
          attachment.messages?.channel.accountId! + os.EOL
        );
        // we will delete it, user can recovery it if hit sync again
        await prisma.messageAttachments.delete({
          where: {
            messagesId_externalId: {
              messagesId: attachment.messagesId,
              externalId: attachment.externalId,
            },
          },
        });
        continue; // it can fail due missing scope
      } else {
        if (image.mustUpload) {
          await processUpload(attachment, accountId, channelId, image);
        } else {
          console.log('ok');
        }
      }

      // await fs.writeFile(
      //   `${filePath}/${size.width}x${size.height}${extension}`,
      //   await sharpStream.toBuffer()
      // );

      // await sharpStream
      //   .resize(undefined, 128, {
      //     withoutEnlargement: true,
      //   })
      //   .toBuffer()
      //   .then(async (buffer) => {
      //     const size = await sharp(buffer).metadata().then(getNormalSize);
      //     // upload to s3
      //     return fs.writeFile(
      //       `${filePath}/${size.width}x${size.height}${extension}`,
      //       buffer
      //     );
      //   });
    }

    if (!attachments.length) {
      process.exit(0);
    }

    last = attachments[attachments.length - 1].createdAt.toISOString();
    await fs.writeFile(`.local/last`, last);
  } while (true);
}

async function processUpload(
  attachment: {
    externalId: string;
    messagesId: string;
    name: string;
  },
  accountId: string,
  channelId: string,
  image: {
    sharpStream: sharp.Sharp;
    size: { width: number | undefined; height: number | undefined };
    mustUpload: boolean;
  }
) {
  const ext = extname(attachment.name);
  const name = slugify(
    attachment.name.substring(0, attachment.name.indexOf(ext))
  );

  const s3Key = [
    BUCKET_PREFIX_FOR_ATTACHMENTS,
    accountId,
    channelId,
    random() + name + ext,
  ].join('/');

  await uploadFile({
    Key: s3Key,
    Body: await image.sharpStream.toBuffer(),
  });

  const internalUrl = [LINEN_STATIC_CDN, s3Key].join('/');
  console.log('recovered!!! ' + internalUrl);
  await prisma.messageAttachments.update({
    where: {
      messagesId_externalId: {
        messagesId: attachment.messagesId,
        externalId: attachment.externalId,
      },
    },
    data: {
      internalUrl,
    },
  });
}

async function download(url: string, token?: string) {
  const sharpStream = sharp({ failOn: 'none' });
  await axios({
    method: 'get',
    url: url,
    responseType: 'stream',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }).then(function (response) {
    response.data.pipe(sharpStream);
  });

  return sharpStream;
}

async function getImage(attachment: {
  externalId: string;
  internalUrl: string | null;
  sourceUrl: string;
  messages: {
    channel: {
      account: {
        slackAuthorizations: slackAuthorizations[];
      } | null;
    };
  } | null;
}) {
  try {
    const sharpStream = await download(attachment.internalUrl!);
    const size = await sharpStream?.metadata().then(getNormalSize);
    return { sharpStream, size, mustUpload: false };
  } catch (error) {
    console.log('error', error);
    if (attachment.messages?.channel.account?.slackAuthorizations.length) {
      for (const auth of attachment.messages?.channel.account
        ?.slackAuthorizations) {
        try {
          const sharpStream = await download(
            attachment.sourceUrl!,
            auth.accessToken
          );
          const size = await sharpStream?.metadata().then(getNormalSize);

          // upload to s3
          return { sharpStream, size, mustUpload: true };
        } catch (error) {
          console.log('error', error);
        }
      }
    }
    return null;
  }
}

function getNormalSize({ width, height, orientation }: Metadata) {
  return (orientation || 0) >= 5
    ? { width: height, height: width }
    : { width, height };
}

run();
