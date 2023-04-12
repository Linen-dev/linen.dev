import type { AnyThreadChannel } from 'discord.js';
import { logger } from '@linen/logger';
import {
  findAccountByExternalId,
  findChannelByAccountIdAndExternalId,
  findThreadByExternalId,
  updateThread,
} from '../utils/linen';

export async function onThreadUpdate(
  _: any,
  thread: AnyThreadChannel<boolean>
) {
  logger.info('onThreadUpdate', thread);

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
      logger.info('onThreadUpdate skipped, thread from another account');
      return;
    }
  }

  logger.info('onThreadUpdate success');
}
