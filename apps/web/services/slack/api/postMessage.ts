import {
  accounts,
  channels,
  channelsIntegration,
  discordAuthorizations,
  slackAuthorizations,
  prisma,
} from '@linen/database';
import request from 'superagent';
import { replaceMentionsWithDisplayName } from './utilities/mentions';
import { Logger } from '@linen/types';

type AuthorUser = {
  username: string;
  icon_url?: string;
  icon_emoji?: string;
};

async function postMessage({
  token,
  externalChannelId,
  body,
  user,
  logger,
}: {
  token: string;
  externalChannelId: string;
  body: string;
  user?: AuthorUser;
  logger: Logger;
}) {
  try {
    const url = 'https://slack.com/api/chat.postMessage';
    const res = await request
      .post(url)
      .send({
        channel: externalChannelId,
        text: body,
        ...(!!user && { ...user }),
      })
      .set('Authorization', 'Bearer ' + token);
    // res.body, res.headers, res.status
    return res.body;
  } catch (err: any) {
    // err.message, err.response
    logger.error({ response: err.response, message: err.message });
    throw err;
  }
}

async function postReply({
  token,
  externalChannelId,
  externalThreadId,
  body,
  user,
  logger,
}: {
  token: string;
  externalChannelId: string;
  externalThreadId: string;
  body: string;
  user?: AuthorUser;
  logger: Logger;
}) {
  try {
    const url = 'https://slack.com/api/chat.postMessage';
    const res = await request
      .post(url)
      .send({
        channel: externalChannelId,
        thread_ts: externalThreadId,
        text: body,
        ...(!!user && { ...user }),
      })
      .set('Authorization', 'Bearer ' + token);
    // res.body, res.headers, res.status
    return res.body;
  } catch (err: any) {
    // err.message, err.response
    logger.error({ response: err.response, message: err.message });
    throw err;
  }
}

export async function slackChatSync({
  channel,
  threadId,
  messageId,
  isThread,
  isReply,
  logger,
}: {
  channel:
    | channels & {
        channelsIntegration: channelsIntegration[];
        account:
          | (accounts & {
              slackAuthorizations: slackAuthorizations[];
              discordAuthorizations: discordAuthorizations[];
            })
          | null;
      };
  threadId?: string;
  messageId: string;
  isThread?: boolean;
  isReply?: boolean;
  logger: Logger;
}) {
  logger.log({ threadId, messageId });
  // check if has enough permissions
  const slackToken = channel.account?.slackAuthorizations.find((s) =>
    isAllowToSendMessages(s)
  );
  if (!slackToken?.accessToken) {
    return 'missing scope on slack token';
  }

  const message = await prisma.messages.findUnique({
    where: { id: messageId },
    include: {
      author: true,
      threads: true,
      attachments: true,
      mentions: {
        include: {
          users: true,
        },
      },
    },
  });
  if (!message) {
    return 'message not found';
  }
  if (!message.threads) {
    return 'thread is missing from message';
  }
  if (!!message.externalMessageId) {
    return 'message has externalId already';
  }

  const token = slackToken.accessToken;
  const externalChannelId = channel.externalChannelId!;

  const body = [
    replaceMentionsWithDisplayName(message.body, message.mentions),
    ...message.attachments.map((a) => a.internalUrl),
  ].join('\n');

  const author = message.author;
  const user =
    !!author && isAllowToCustomizeAuthor(slackToken)
      ? ({
          username: author.displayName,
          icon_url: author.profileImageUrl,
        } as AuthorUser)
      : undefined;

  if (isThread) {
    return await newThread({
      threadId,
      token,
      body,
      externalChannelId,
      user,
      messageId: message.id,
      logger,
    });
  }

  if (isReply) {
    return await newReply({
      messageId: message.id,
      token,
      body,
      externalChannelId,
      user,
      externalThreadId: message.threads.externalThreadId,
      logger,
    });
  }
}

async function newReply({
  messageId,
  token,
  body,
  externalChannelId,
  user,
  externalThreadId,
  logger,
}: {
  messageId: string;
  token: string;
  body: string;
  externalChannelId: string;
  user: AuthorUser | undefined;
  externalThreadId: string | null;
  logger: Logger;
}) {
  if (!externalThreadId) {
    return 'thread external id is missing from message';
  }
  // reply
  const response = await postReply({
    token,
    body,
    externalChannelId,
    externalThreadId,
    user,
    logger,
  });
  if (response.ok && response.message && response.message.ts) {
    await prisma.messages.update({
      where: { id: messageId },
      data: { externalMessageId: response.message.ts },
    });
    return 'reply sent';
  }
  logger.error({ response });
  throw 'something went wrong';
}

async function newThread({
  threadId,
  token,
  body,
  externalChannelId,
  user,
  messageId,
  logger,
}: {
  threadId: string | undefined;
  token: string;
  body: string;
  externalChannelId: string;
  user: AuthorUser | undefined;
  messageId: string;
  logger: Logger;
}) {
  const thread = await prisma.threads.findUnique({ where: { id: threadId } });
  if (!thread) {
    return 'thread not found';
  }
  // new thread
  const response = await postMessage({
    token,
    body,
    externalChannelId,
    user,
    logger,
  });
  if (response.ok && response.message && response.message.ts) {
    await prisma.threads.update({
      where: { id: threadId },
      data: { externalThreadId: response.message.ts },
    });
    await prisma.messages.update({
      where: { id: messageId },
      data: { externalMessageId: response.message.ts },
    });
    return 'thread created';
  }
  if (!response.ok && response.error === 'channel_not_found') {
    return { slackResponse: response.error };
  }
  logger.error({ response });
  throw 'something went wrong';
}

function isAllowToSendMessages(s: slackAuthorizations): boolean {
  return s.scope.indexOf('chat:write') > -1;
}

function isAllowToCustomizeAuthor(slackToken: slackAuthorizations): boolean {
  return slackToken.scope.indexOf('chat:write.customize') > -1;
}
