import type { AnyThreadChannel } from 'discord.js';
import { logger } from '@linen/logger';
import {
  createThread,
  findAccountByExternalId,
  findChannelByAccountIdAndExternalId,
  findThreadByExternalId,
  updateThread,
} from '../utils/linen';
import { onMessageCreate } from './onMessageCreate';

export async function onThreadCreate(thread: AnyThreadChannel<boolean>) {
  logger.info('onThreadCreate', thread);

  if (!thread.guildId) {
    logger.warn('thread does not have guild id');
    return;
  }

  const linenAccount = await findAccountByExternalId(thread.guildId);
  if (!linenAccount) {
    logger.warn('account not found');
    return;
  }

  const externalChannelId = thread.parentId || thread.parent?.id;
  const externalThreadId = thread.id;

  if (!externalChannelId) {
    logger.warn('channel not found');
    return;
  }

  const linenChannel = await findChannelByAccountIdAndExternalId({
    accountId: linenAccount.id,
    externalChannelId,
  });

  if (!linenChannel) {
    logger.warn('channel not found on linen');
    return;
  }

  const linenThread = await findThreadByExternalId(externalThreadId);

  if (linenThread) {
    if (linenThread.channel.account?.id === linenAccount.id) {
      // lets update slug and name
      await updateThread(linenThread.id, thread.name);
    } else {
      logger.info('onThreadCreate skipped, thread from another account');
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
          return onMessageCreate(message);
        })
      )
    );
  }

  logger.info('onThreadCreate success');
}
