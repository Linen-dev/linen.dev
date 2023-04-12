import type { Message, PartialMessage } from 'discord.js';
import { logger } from '@linen/logger';
import { nonce } from '../utils/constrains';
import {
  findAccountByExternalId,
  findChannelByAccountIdAndExternalId,
  findMessageByChannelIdAndExternalId,
  updateMessage,
} from '../utils/linen';
import { parseChannelAndThread, parseMessage } from '../utils/parse';
import { onMessageCreate } from './onMessageCreate';

export async function onMessageUpdate(
  message: Message | PartialMessage,
  newMessage: Message | PartialMessage
) {
  logger.info('onMessageUpdate', message, newMessage);

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

  const parsedMessage = parseMessage({
    ...newMessage,
    content: newMessage.content || newMessage.toString(),
  });
  const channelId = linenChannel.id;
  const externalMessageId = parsedMessage.externalMessageId;

  const existMessage = await findMessageByChannelIdAndExternalId({
    channelId,
    externalMessageId,
  });

  if (existMessage) {
    // if body are distinct
    if (existMessage.body !== parsedMessage.body) {
      // update body
      // TODO: mentions and slug
      await updateMessage({
        id: existMessage.id,
        body: parsedMessage.body,
      });
      logger.info('onMessageUpdate success');
    } else {
      logger.info('onMessageUpdate skipped');
    }
  } else {
    // create message?
    logger.info('onMessageUpdate message not found');
    return onMessageCreate(newMessage as Message);
  }
}
