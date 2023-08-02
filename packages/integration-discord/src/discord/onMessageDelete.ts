import type { Message, PartialMessage } from 'discord.js';
import { nonce } from '../utils/constrains';
import { parseChannelAndThread } from '../utils/parse';
import {
  deleteMessage,
  findAccountByExternalId,
  findChannelByAccountIdAndExternalId,
} from '../utils/linen';
import { Logger } from '../utils/logger';

export function onMessageDelete(botId: number) {
  return async (message: Message | PartialMessage) => {
    const logger = new Logger(botId, 'onMessageDelete', message.id);

    try {
      logger.info({ message });

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

      await deleteMessage({
        channelId: linenChannel.id,
        externalMessageId: message.id,
      });

      logger.info({ info: 'success' });
    } catch (error) {
      logger.error({ error });
    }
  };
}
