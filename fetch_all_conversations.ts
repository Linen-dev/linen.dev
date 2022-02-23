import { channels, messages, Prisma, slackThreads } from '@prisma/client';
import request from 'superagent';
import {
  createManyUsers,
  createMessage,
  findOrCreateThread,
  findUser,
} from './lib/slack';

export const fetchConversations = async (channel: string, token: string) => {
  const url = 'https://slack.com/api/conversations.history';

  const response = await request
    .get(url + '?channel=' + channel)
    .set('Authorization', 'Bearer ' + token);

  return response;
};

export const fetchTeamInfo = async (token) => {
  const url = 'https://slack.com/api/team.info';

  const response = await request
    .get(url)
    .set('Authorization', 'Bearer ' + token);

  return response;
};

export const saveMessages = async (
  messages: any[],
  channelId: string,
  slackChannelId: string
) => {
  const params = messages
    .filter((message) => message.type === 'message')
    .map((message) => {
      return {
        body: message.text,
        sentAt: new Date(parseFloat(message.ts) * 1000),
        channelId: channelId,
        slackThreadTs: message.thread_ts,
        slackUserId: message.user || message.bot_id,
        usersId: null,
      } as any;
    });

  try {
    const messages = [];
    for (let param of params) {
      let threadId: string | null = null;
      if (!!param.slackThreadTs) {
        let thread = await findOrCreateThread({
          slackThreadTs: param.slackThreadTs,
          channelId: channelId,
        });
        threadId = thread.id;
      }
      const user = await findUser(param.slackUserId);
      param.usersId = user?.id;
      param.slackThreadId = threadId;
      messages.push(await createMessage(param));
    }

    return messages;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export async function fetchAndSaveThreadMessages(
  messages: (messages & {
    channel: channels;
    slackThreads: slackThreads | null;
  })[],
  token: string
) {
  const repliesPromises = messages.map((m) => {
    if (!!m.slackThreads?.slackThreadTs) {
      return fetchReplies(
        m.slackThreads.slackThreadTs,
        m.channel.slackChannelId,
        token
      ).then((response) => {
        if (!!response?.body && m.slackThreads?.slackThreadTs) {
          const replyMessages = response?.body;
          return saveThreadedMessages(
            replyMessages,
            m.channel.id,
            m.slackThreads.slackThreadTs
          );
        }
      });
    }
    return null;
  });

  return await Promise.all(repliesPromises);
}

export async function fetchAndSaveUser(slackUserId: string, token) {
  const profile = await getUserProfile(slackUserId, token);
  profile.body;
}

export async function saveThreadedMessages(
  replies: any,
  channelId: string,
  slackThreadTs: string
) {
  const repliesParams = replies.messages.map((m) => {
    return {
      body: m.text,
      sentAt: new Date(parseFloat(m.ts) * 1000),
      slackUserId: m.user || m.bot_id,
      channelId: channelId,
    };
  });

  let thread = await findOrCreateThread({
    slackThreadTs: slackThreadTs,
    channelId: channelId,
  });

  for (let replyParam of repliesParams) {
    const user = await findUser(replyParam.slackUserId);
    replyParam.usersId = user?.id;
    replyParam.slackThreadId = thread.id;
    try {
      await createMessage(replyParam);
    } catch (e) {
      console.log(e);
      continue;
    }
  }
}

export const fetchReplies = async (
  threadTs: string,
  channel: string,
  token: string
) => {
  const url = 'https://slack.com/api/conversations.replies';

  const response = await request
    .get(url + '?channel=' + channel + '&ts=' + threadTs)
    .set('Authorization', 'Bearer ' + token);

  return response;
};

export const saveUsers = async (users: any[], accountId: string) => {
  const params = users.map((user) => {
    const profile = user.profile;
    const name =
      profile.display_name ||
      profile.display_name_normalized ||
      profile.real_name ||
      profile.real_name_normalized;
    const profileImageUrl = profile.image_original;
    return {
      displayName: name,
      slackUserId: user.id,
      profileImageUrl,
      accountsId: accountId,
      isBot: user.is_bot,
      isAdmin: user.is_admin || false,
    };
  });

  const result = await createManyUsers({ data: params, skipDuplicates: true });
};

export const listUsers = async (
  token: string,
  userCursor: string | null = null
) => {
  let url: string = 'https://slack.com/api/users.list';
  if (!!userCursor) {
    url += '?cursor=' + userCursor;
  }

  return await request.get(url).set('Authorization', 'Bearer ' + token);
};

export const getUserProfile = async (userId: string, token: string) => {
  const url = 'https://slack.com/api/users.info?user=' + userId;

  return await request.get(url).set('Authorization', 'Bearer ' + token);
};

export const joinChannel = async (channel: string, token: string) => {
  const url = 'https://slack.com/api/conversations.join';

  const response = await request
    .post(url)
    .send({ channel })
    .set('Authorization', 'Bearer ' + token);

  return response;
};
