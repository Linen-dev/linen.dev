import { prisma } from '@linen/database';
import type { JobHelpers, Logger } from 'graphile-worker';
import { slackChatSync } from '@linen/web/services/slack/api/postMessage';
import { processGithubIntegration } from '@linen/integration-github';
import { processEmailIntegration } from '@linen/integration-email';
import { processLinearIntegration } from '@linen/integration-linear';
import { processDiscordIntegration } from '@linen/integration-discord';
import { TwoWaySyncType } from '@linen/types';

export async function twoWaySync(payload: any, helpers: JobHelpers) {
  helpers.logger.info(JSON.stringify(payload));
  const result = await twoWaySyncJob(payload, helpers.logger);
  helpers.logger.info(JSON.stringify(result));
}

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
      if (integration.type === 'LINEAR') {
        return await processLinearIntegration({
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
    if (event !== 'newMessage' && event !== 'newThread') {
      return 'event not supported yet';
    }
    return processDiscordIntegration({
      channelId,
      messageId,
      threadId,
      id,
      event,
    });
  }

  return 'account without authorization';
}
