import { prisma } from '@linen/database';
import type { JobHelpers, Logger } from 'graphile-worker';
import { slackChatSync } from 'services/slack/api/postMessage';
import { processGithubIntegration } from 'services/integrations/processGithubIntegration';
import { processEmailIntegration } from '@linen/integration-email';

export async function twoWaySync(payload: any, helpers: JobHelpers) {
  helpers.logger.info(JSON.stringify(payload));
  const result = await twoWaySyncJob(payload, helpers.logger);
  helpers.logger.info(JSON.stringify(result));
}

export type TwoWaySyncEvent =
  | 'newMessage'
  | 'newThread'
  | 'threadReopened'
  | 'threadClosed'
  | 'threadUpdated';

export type TwoWaySyncType = {
  event: TwoWaySyncEvent;
  id: string;
  channelId?: string;
  threadId?: string;
  messageId?: string;
};

async function twoWaySyncJob(
  { channelId, messageId, threadId, id, event }: TwoWaySyncType,
  logger: Logger
) {
  logger.info(JSON.stringify(event));

  const channel = await prisma.channels.findFirst({
    where: {
      id: channelId,
    },
    include: {
      account: {
        include: { slackAuthorizations: true, discordAuthorizations: true },
      },
      channelsIntegration: true,
    },
  });

  if (!channel) {
    return 'channel not found';
  }
  if (!channel.account) {
    return 'account not found';
  }

  // integration by channel
  if (channel.channelsIntegration.length) {
    for (const integration of channel.channelsIntegration) {
      if (integration.type === 'GITHUB') {
        return await processGithubIntegration({
          channelId,
          messageId,
          threadId,
          event,
          integration,
          id,
        });
      }
      if (integration.type === 'EMAIL') {
        return await processEmailIntegration({
          channelId,
          messageId,
          threadId,
          event,
          integration,
          id,
        });
      }
    }
  }

  // check if is slack
  if (channel.account.slackAuthorizations.length) {
    if (event !== 'newMessage' && event !== 'newThread') {
      return 'event not supported yet';
    }
    return slackChatSync({
      channel,
      threadId,
      messageId: messageId!,
      isThread: event === 'newThread',
      isReply: event === 'newMessage',
    });
  }
  // check if is discord
  if (channel.account.discordAuthorizations.length) {
    return 'discord is not implemented yet';
  }

  return 'account without authorization';
}
