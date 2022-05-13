import { channels, messages, Prisma, slackThreads } from '@prisma/client';
import request from 'superagent';
import {
  createManyUsers,
  createMessage,
  createOrUpdateMessage,
  findOrCreateThread,
  findUser,
} from './lib/models';

export const fetchConversations = async (
  channel: string,
  token: string,
  userCursor: string | null = null
) => {
  let url = 'https://slack.com/api/conversations.history?channel=' + channel;
  if (!!userCursor) {
    url += '&cursor=' + userCursor;
  }

  const response = await request
    .get(url)
    .set('Authorization', 'Bearer ' + token);

  return response;
};

type ConversationHistoryBody = {
  ok: boolean;
  messages: ConvesrationHistoryMessage[];
  has_more: boolean;
  pin_count: number;
  channel_actions_ts: any;
  channel_actions_count: number;
  response_metadata?: ResponseMetadata;
};

export type ConvesrationHistoryMessage = {
  type: string;
  subtype?: string;
  ts: string;
  user?: string;
  text: string;
  bot_id?: string;
  bot_link?: string;
  client_msg_id?: string;
  team?: string;
  blocks?: Block[];
  thread_ts?: string;
  reply_count?: number;
  reply_users_count?: number;
  latest_reply?: string;
  reply_users?: string[];
  is_locked?: boolean;
  subscribed?: boolean;
  inviter?: string;
};

type Block = {
  type: string;
  block_id: string;
  elements: Element[];
};

type Element = {
  type: string;
  elements: Element2[];
};

type Element2 = {
  type: string;
  text: string;
};

type ResponseMetadata = {
  next_cursor: string;
};

export const fetchConversationsTyped = async (
  channel: string,
  token: string,
  userCursor: string | null = null
): Promise<ConversationHistoryBody> => {
  let url = 'https://slack.com/api/conversations.history?channel=' + channel;
  if (!!userCursor) {
    url += '&cursor=' + userCursor;
  }

  const response = await request
    .get(url)
    .set('Authorization', 'Bearer ' + token);

  return response.body;
};

export const fetchMessage = async (
  channel: string,
  token: string,
  messageTs: string
) => {
  let url =
    'https://slack.com/api/conversations.history?channel=' +
    channel +
    '&latest=' +
    messageTs +
    '&limit=1';

  const response = await request
    .get(url)
    .set('Authorization', 'Bearer ' + token);

  return response;
};

export const fetchTeamInfo = async (token: string) => {
  const url = 'https://slack.com/api/team.info';

  const response = await request
    .get(url)
    .set('Authorization', 'Bearer ' + token);

  return response;
};

export const saveMessages = async (
  messages: any[],
  channelId: string,
  slackChannelId: string,
  accountId: string
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
      const user = await findUser(param.slackUserId, accountId);
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
  token: string,
  accountId: string
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
            m.slackThreads.slackThreadTs,
            accountId
          );
        }
      });
    }
    return null;
  });

  return await Promise.all(repliesPromises);
}

export async function fetchAndSaveUser(slackUserId: string, token: string) {
  const profile = await getUserProfile(slackUserId, token);
  profile.body;
}

export async function saveThreadedMessages(
  replies: any,
  channelId: string,
  slackThreadTs: string,
  accountId: string
) {
  const repliesParams = replies.messages.map((m: any) => {
    return {
      body: m.text,
      sentAt: new Date(parseFloat(m.ts) * 1000),
      slackMessageId: m.ts,
      slackUserId: m.user || m.bot_id,
      channelId: channelId,
    };
  });

  let thread = await findOrCreateThread({
    slackThreadTs: slackThreadTs,
    channelId: channelId,
  });

  for (let replyParam of repliesParams) {
    const user = await findUser(replyParam.slackUserId, accountId);
    replyParam.usersId = user?.id;
    replyParam.slackThreadId = thread.id;
    try {
      await createOrUpdateMessage(replyParam);
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

export interface ConversationRepliesBody {
  ok: boolean;
  messages: ConversationRepliesMessage[];
  has_more: boolean;
}

export interface ConversationRepliesMessage {
  client_msg_id?: string;
  type: string;
  text: string;
  user?: string;
  ts: string;
  team?: string;
  blocks?: Block[];
  thread_ts: string;
  reply_count?: number;
  reply_users_count?: number;
  latest_reply?: string;
  reply_users?: string[];
  is_locked?: boolean;
  subscribed?: boolean;
  parent_user_id?: string;
  subtype?: string;
  username?: string;
  icons?: Icons;
  bot_id?: string;
  attachments?: Attachment[];
}

export interface Style {
  code: boolean;
}

export interface Icons {
  image_48: string;
}

export interface Attachment {
  title: string;
  title_link?: string;
  text: string;
  fallback: string;
  from_url?: string;
  service_name?: string;
  id: number;
  original_url?: string;
  footer?: string;
  footer_icon?: string;
  color?: string;
  mrkdwn_in?: string[];
  bot_id?: string;
  app_unfurl_url?: string;
  is_app_unfurl?: boolean;
  app_id?: string;
}

export const fetchRepliesTyped = async (
  threadTs: string,
  channel: string,
  token: string
): Promise<ConversationRepliesBody> => {
  const url = 'https://slack.com/api/conversations.replies';

  const response = await request
    .get(url + '?channel=' + channel + '&ts=' + threadTs)
    .set('Authorization', 'Bearer ' + token);

  return response.body;
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
