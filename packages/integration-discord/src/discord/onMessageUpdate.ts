import type { Message, PartialMessage } from 'discord.js';
import { nonce } from '../utils/constrains';
import {
  findAccountByExternalId,
  findChannelByAccountIdAndExternalId,
  findMessageByChannelIdAndExternalId,
  updateMessage,
} from '../utils/linen';
import { parseChannelAndThread, parseMessage } from '../utils/parse';
import { onMessageCreate } from './onMessageCreate';
import { Logger } from '../utils/logger';

export function onMessageUpdate(botId: number) {
  return async (
    message: Message | PartialMessage,
    newMessage: Message | PartialMessage
  ) => {
    const logger = new Logger(botId, 'onMessageUpdate', message.id);

    try {
      logger.info({ message, newMessage });

      if (message.nonce === nonce) {
        logger.warn({ cause: 'message from linen' });
        return;
      }

      if (!message.guildId) {
        logger.warn({ cause: 'message does not have guild id' });
        return;
      }

      const linenAccount = await findAccountByExternalId(message.guildId);
      if (!linenAccount) {
        logger.warn({ cause: 'account not found' });
        return;
      }

      let { channel } = await parseChannelAndThread(message);

      if (!channel) {
        logger.warn({ cause: 'channel not found' });
        return;
      }
      const linenChannel = await findChannelByAccountIdAndExternalId({
        accountId: linenAccount.id,
        externalChannelId: channel.externalChannelId,
      });

      if (!linenChannel) {
        logger.warn({ cause: 'channel not found on linen' });
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
          logger.info({ info: 'success' });
        } else {
          logger.info({ info: 'skipped' });
        }
      } else {
        // create message?
        logger.info({ info: 'message not found' });
        return onMessageCreate(botId)(newMessage as Message);
      }
    } catch (error) {
      logger.error({ error });
    }
  };
}
