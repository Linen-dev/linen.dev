import type { Message, PartialMessage } from 'discord.js';
import { logger } from '@linen/logger';
import { nonce } from '../utils/constrains';
import { parseChannelAndThread } from '../utils/parse';
import {
  deleteMessage,
  findAccountByExternalId,
  findChannelByAccountIdAndExternalId,
} from '../utils/linen';

export async function onMessageDelete(message: Message | PartialMessage) {
  logger.info('onMessageDelete', message);

  if (message.nonce === nonce) {
    logger.warn('message from linen');
    return;
  }

  if (!message.guildId) {
    logger.warn('message does not have guild id');
    return;
  }

  const linenAccount = await findAccountByExternalId(message.guildId);
  if (!linenAccount) {
    logger.warn('account not found');
    return;
  }

  let { channel } = await parseChannelAndThread(message);

  if (!channel) {
    logger.warn('channel not found');
    return;
  }
  const linenChannel = await findChannelByAccountIdAndExternalId({
    accountId: linenAccount.id,
    externalChannelId: channel.externalChannelId,
  });

  if (!linenChannel) {
    logger.warn('channel not found on linen');
    return;
  }

  await deleteMessage({
    channelId: linenChannel.id,
    externalMessageId: message.id,
  });

  logger.info('onMessageDelete success');
}
