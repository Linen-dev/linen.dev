import {
  accounts,
  channels,
  channelsIntegration,
  discordAuthorizations,
  messages,
  slackAuthorizations,
  threads,
  users,
  prisma,
  mentions,
} from '@linen/database';
import request from 'superagent';

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
}: {
  token: string;
  externalChannelId: string;
  body: string;
  user?: AuthorUser;
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
    console.error(err.response, err.message);
    throw err;
  }
}

async function postReply({
  token,
  externalChannelId,
  externalThreadId,
  body,
  user,
}: {
  token: string;
  externalChannelId: string;
  externalThreadId: string;
  body: string;
  user?: AuthorUser;
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
    console.error(err.response, err.message);
    throw err;
  }
}

export async function slackChatSync({
  channel,
  threadId,
  messageId,
  isThread,
  isReply,
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
}) {
  console.log({ threadId, messageId });
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

  // to get best matching format
  // it would be better to parse the message and
  // stringify it to the slack format
  // we don't have a slack stringifier yet due to time constraints
  // so let's make a naive id replace
  function replaceMentionsWithDisplayName(text: string, mentions: any[]) {
    if (!mentions || mentions.length === 0) {
      return text;
    }
    let body = text;
    mentions.forEach((mention) => {
      body = body.replace(
        `@${mention.usersId}`,
        mention.users.displayName || mention.users.id
      );
    });
    return body;
  }

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
}: {
  messageId: string;
  token: string;
  body: string;
  externalChannelId: string;
  user: AuthorUser | undefined;
  externalThreadId: string | null;
}) {
  if (!externalThreadId) {
    throw 'thread external id is missing from message';
  }
  // reply
  const response = await postReply({
    token,
    body,
    externalChannelId,
    externalThreadId,
    user,
  });
  if (response.ok && response.message && response.message.ts) {
    await prisma.messages.update({
      where: { id: messageId },
      data: { externalMessageId: response.message.ts },
    });
    return 'reply sent';
  }
  console.error({ response });
  throw 'something went wrong';
}

async function newThread({
  threadId,
  token,
  body,
  externalChannelId,
  user,
  messageId,
}: {
  threadId: string | undefined;
  token: string;
  body: string;
  externalChannelId: string;
  user: AuthorUser | undefined;
  messageId: string;
}) {
  const thread = await prisma.threads.findUnique({ where: { id: threadId } });
  if (!thread) {
    throw 'thread not found';
  }
  // new thread
  const response = await postMessage({
    token,
    body,
    externalChannelId,
    user,
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
  console.error({ response });
  throw 'something went wrong';
}

function isAllowToSendMessages(s: slackAuthorizations): boolean {
  return s.scope.indexOf('chat:write') > -1;
}

function isAllowToCustomizeAuthor(slackToken: slackAuthorizations): boolean {
  return slackToken.scope.indexOf('chat:write.customize') > -1;
}
