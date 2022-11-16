import { messages, slackAuthorizations, threads, users } from '@prisma/client';
import { ChannelWithAccountAndAuthorizations } from 'services/sync';
import request from 'superagent';
import prisma from '../../../client';

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
  channel: ChannelWithAccountAndAuthorizations;
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
    throw 'missing scope on slack token';
  }

  const message = await prisma.messages.findUnique({
    where: { id: messageId },
    include: { author: true, threads: true },
  });
  if (!message) {
    throw 'message not found';
  }
  if (!message.threads) {
    throw 'thread is missing from message';
  }
  if (!!message.externalMessageId) {
    return 'message has externalId already';
  }

  const token = slackToken.accessToken;
  const externalChannelId = channel.externalChannelId!;
  const body = message.body;
  const author = message.author;
  const user =
    !!author && isAllowToCustomizeAuthor(slackToken)
      ? ({
          username: author.displayName,
          icon_url: author.profileImageUrl,
        } as AuthorUser)
      : undefined;

  if (isThread) {
    return await newThread(
      threadId,
      token,
      body,
      externalChannelId,
      user,
      message
    );
  }

  if (isReply) {
    return await newReply(message, token, body, externalChannelId, user);
  }
}

async function newReply(
  message: messages & {
    threads: threads | null;
    author: users | null;
  },
  token: string,
  body: string,
  externalChannelId: string,
  user: AuthorUser | undefined
) {
  if (!message.threads?.externalThreadId) {
    throw 'thread external id is missing from message';
  }
  // reply
  const response = await postReply({
    token,
    body,
    externalChannelId,
    externalThreadId: message.threads.externalThreadId,
    user,
  });
  if (response.ok && response.message && response.message.ts) {
    await prisma.messages.update({
      where: { id: message.id },
      data: { externalMessageId: response.message.ts },
    });
    return 'reply sent';
  }
  console.error({ response });
  throw 'something went wrong';
}

async function newThread(
  threadId: string | undefined,
  token: string,
  body: string,
  externalChannelId: string,
  user: AuthorUser | undefined,
  message: messages & {
    threads: threads | null;
    author: users | null;
  }
) {
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
      where: { id: message.threads?.id },
      data: { externalThreadId: response.message.ts },
    });
    await prisma.messages.update({
      where: { id: message.id },
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
