import type { AnyThreadChannel } from 'discord.js';
import {
  createThread,
  findAccountByExternalId,
  findChannelByAccountIdAndExternalId,
  findThreadByExternalId,
  updateThread,
} from '../utils/linen';
import { onMessageCreate } from './onMessageCreate';
import { Logger } from '../utils/logger';

export function onThreadCreate(botId: number) {
  return async (thread: AnyThreadChannel<boolean>) => {
    const logger = new Logger(botId, 'onThreadCreate', thread.id);
    try {
      logger.info({ thread });

      if (!thread.guildId) {
        logger.warn({ cause: 'thread does not have guild id' });
        return;
      }

      const linenAccount = await findAccountByExternalId(thread.guildId);
      if (!linenAccount) {
        logger.warn({ cause: 'account not found' });
        return;
      }

      const externalChannelId = thread.parentId || thread.parent?.id;
      const externalThreadId = thread.id;

      if (!externalChannelId) {
        logger.warn({ cause: 'channel not found' });
        return;
      }

      const linenChannel = await findChannelByAccountIdAndExternalId({
        accountId: linenAccount.id,
        externalChannelId,
      });

      if (!linenChannel) {
        logger.warn({ cause: 'channel not found on linen' });
        return;
      }

      const linenThread = await findThreadByExternalId(
        externalThreadId,
        linenChannel.id
      );

      if (linenThread) {
        if (linenThread.channel.account?.id === linenAccount.id) {
          // lets update slug and name
          await updateThread(linenThread.id, thread.name);
        } else {
          logger.warn({ cause: 'skipped, thread from another account' });
          return;
        }
      } else {
        await createThread({
          thread,
          externalThreadId,
          channelId: linenChannel.id,
        });
        await Promise.all(
          await thread.messages.fetch().then((messages) =>
            messages.map((message) => {
              return onMessageCreate(botId)(message);
            })
          )
        );
      }

      logger.info({ info: 'success' });
    } catch (error) {
      logger.error({ error });
    }
  };
}
