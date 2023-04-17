import { uploadFile } from 'services/aws/s3';
import { BUCKET_PREFIX_FOR_ATTACHMENTS, LINEN_STATIC_CDN } from 'secrets';
import { messages, prisma } from '@linen/database';
import { MessageFile, ConversationHistoryMessage } from '@linen/types';
import { fetchFile } from '../api';
import path from 'path';
import { v4 as random } from 'uuid';
import { slugify } from '@linen/utilities/string';

export async function processAttachments(
  m: ConversationHistoryMessage,
  message: messages,
  token: string
) {
  const promises = [];

  let files: Record<string, string>;
  if (m.files) {
    files = await processLinks(m.files, token, message.channelId);
  }

  if (m.files && m.files.length) {
    promises.push(
      ...m.files
        .filter((file) => !!file.name)
        .map((file) => {
          const serializedFile = {
            messagesId: message.id,
            externalId: file.id,
            name: file.name,
            sourceUrl: file.url_private,
            internalUrl: files[file.id],
            mimetype: file.mimetype,
            permalink: file.permalink,
            title: file.title,
          };
          return prisma.messageAttachments
            .upsert({
              where: {
                messagesId_externalId: {
                  externalId: file.id,
                  messagesId: message.id,
                },
              },
              create: serializedFile,
              update: serializedFile,
            })
            .catch((error) => {
              console.error('attachment failure', error);
            });
        })
    );
  }
  return await Promise.all(promises).catch((error) => {
    console.error(error);
  });
}

/**
 * this function will upload files to s3 and return the fileId and internalUrl (cdn or s3 url)
 * of each as attributes of a key-value object
 * @param files
 * @param token
 * @returns Object { [key]: value, [fileId]: internalUrl }
 */
async function processLinks(
  files: MessageFile[],
  token: string,
  channelId: string
): Promise<Record<string, string>> {
  if (!files || !files.length) return {};

  return (await Promise.all(files.map(processLink(token, channelId)))).reduce(
    arrayToMap,
    {}
  );
}

function processLink(
  token: string,
  channelId: string
): (file: MessageFile) => Promise<{ fileId?: string; internalUrl?: string }> {
  return async function (file: MessageFile) {
    if (!file.url_private) return {};
    try {
      const response = await fetchFile(file.url_private, token);
      const ext = path.extname(file.name);
      const name = slugify(file.name.substring(0, file.name.indexOf(ext)));

      const s3Key = [
        BUCKET_PREFIX_FOR_ATTACHMENTS,
        channelId,
        random() + name + ext,
      ].join('/');

      await uploadFile({
        Key: s3Key,
        Body: Buffer.from(response.text || response.body),
      });
      return {
        fileId: file.id,
        internalUrl: [LINEN_STATIC_CDN, s3Key].join('/'),
      };
    } catch (error) {
      console.error(error);
      return {};
    }
  };
}

function arrayToMapGeneric(key: string, val: string) {
  return (prev: any, curr: any) => {
    return {
      ...prev,
      [curr[key]]: curr[val],
    };
  };
}

const arrayToMap = arrayToMapGeneric('fileId', 'internalUrl');
