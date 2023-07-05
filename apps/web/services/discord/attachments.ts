import { channels } from '@linen/database';
import { slugify } from '@linen/utilities/string';
import axios from 'axios';
import path from 'path';
import { BUCKET_PREFIX_FOR_ATTACHMENTS, LINEN_STATIC_CDN } from 'config';
import { uploadFile } from 'services/aws/s3';
import { DiscordAttachments } from '@linen/types';
import { v4 as random } from 'uuid';

export async function handleAttachments(
  attachments: DiscordAttachments[],
  channel: channels
): Promise<
  {
    externalId: string;
    name: string;
    sourceUrl: string;
    internalUrl?: string;
    mimetype?: string;
  }[]
> {
  return await Promise.all(
    attachments.map((a) => handleAttachment(a, channel))
  );
}

async function handleAttachment(attach: DiscordAttachments, channel: channels) {
  const ext = path.extname(attach.filename);
  const name = slugify(
    attach.filename.substring(0, attach.filename.indexOf(ext))
  );

  const uploadedFile = await upload({
    attach,
    accountId: channel.accountId,
    channelId: channel.id,
    name,
    ext,
  });

  return {
    externalId: attach.id,
    name,
    sourceUrl: attach.url || attach.proxy_url,
    internalUrl: uploadedFile || attach.url || attach.proxy_url,
    mimetype: attach.content_type,
  };
}

async function upload({
  attach,
  accountId,
  channelId,
  name,
  ext,
}: {
  attach: DiscordAttachments;
  accountId: string | null;
  channelId: string;
  name: string;
  ext: string;
}) {
  try {
    const response = await axios.get(attach.url || attach.proxy_url, {
      responseType: 'arraybuffer',
    });
    if (response.data) {
      const s3Key = [
        BUCKET_PREFIX_FOR_ATTACHMENTS,
        accountId,
        channelId,
        random() + name + ext,
      ]
        .filter((e) => e)
        .join('/');
      await uploadFile({ Key: s3Key, Body: response.data });
      return [LINEN_STATIC_CDN, s3Key].join('/');
    }
  } catch (error) {
    console.error(error);
  }
  return null;
}
