import request from 'superagent';
import { createManyUsers } from 'lib/users';
import { generateRandomWordSlug } from 'utilities/randomWordSlugs';
import {
  UserInfo,
  UserInfoResponseBody,
} from 'types/slackResponses/slackUserInfoInterface';
import { GetMembershipsFnType } from '../syncWrapper';

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

export type ConversationHistoryBody = {
  ok: boolean;
  messages: ConversationHistoryMessage[];
  has_more: boolean;
  pin_count?: number;
  channel_actions_ts?: any;
  channel_actions_count?: number;
  response_metadata?: ResponseMetadata;
};

export type ConversationHistoryMessage = {
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
  files?: MessageFile[];
  reactions?: MessageReaction[];
  app_id?: string;
  attachments?: {
    fallback: string;
    pretext: string;
    author_name: string;
    author_icon: string;
    title: string;
    text: string;
    footer: string;
  }[];
};

export interface MessageReaction {
  name: string;
  users: string[];
  count: number;
}

export interface MessageFile {
  id: string;
  created?: number;
  timestamp?: number;
  name: string;
  title?: string;
  mimetype?: string;
  filetype?: string;
  pretty_type?: string;
  user?: string;
  editable?: boolean;
  size?: number;
  mode?: string;
  is_external?: boolean;
  external_type?: string;
  is_public?: boolean;
  public_url_shared?: boolean;
  display_as_bot?: boolean;
  username?: string;
  url_private: string;
  url_private_download?: string;
  media_display_type?: string;
  thumb_64?: string;
  thumb_80?: string;
  thumb_360?: string;
  thumb_360_w?: number;
  thumb_360_h?: number;
  thumb_480?: string;
  thumb_480_w?: number;
  thumb_480_h?: number;
  thumb_160?: string;
  thumb_720?: string;
  thumb_720_w?: number;
  thumb_720_h?: number;
  thumb_800?: string;
  thumb_800_w?: number;
  thumb_800_h?: number;
  thumb_960?: string;
  thumb_960_w?: number;
  thumb_960_h?: number;
  thumb_1024?: string;
  thumb_1024_w?: number;
  thumb_1024_h?: number;
  original_w?: number;
  original_h?: number;
  thumb_tiny?: string;
  permalink?: string;
  permalink_public?: string;
  is_starred?: boolean;
  has_rich_preview?: boolean;
}

interface MessageBlock {
  team: string;
  channel: string;
  ts: string;
  message: Message;
}

interface Message {
  blocks: Block[];
}

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

export const fetchFile = async (fileUrl: string, token: string) => {
  if (!token) return await request.get(fileUrl);

  const response = await request
    .get(fileUrl)
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
  ts?: string;
  author_id?: string;
  channel_team?: string;
  channel_id?: string;
  channel_name?: string;
  is_msg_unfurl?: boolean;
  is_reply_unfurl?: boolean;
  message_blocks?: MessageBlock[];
  author_name?: string;
  author_link?: string;
  author_icon?: string;
  author_subname?: string;
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
      externalUserId: user.id,
      profileImageUrl,
      accountsId: accountId,
      isBot: user.is_bot,
      isAdmin: user.is_admin || false,
      anonymousAlias: generateRandomWordSlug(),
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

export const getSlackChannels = async (teamId: string, token: string) => {
  const url =
    'https://slack.com/api/conversations.list?exclude_archived=true&limit=999&';

  const response = await request
    .get(url + 'team_id=' + teamId)
    .set('Authorization', 'Bearer ' + token);

  return response;
};

export const getMemberships: GetMembershipsFnType = async (
  channelId: string,
  token: string
) => {
  const members: string[] = [];
  const url = `https://slack.com/api/conversations.members?channel=${channelId}`;

  let cursor;
  do {
    const response: any = await request
      .get(`${url}${!!cursor && `&cursor=${cursor}`}`)
      .set('Authorization', 'Bearer ' + token);
    response?.body?.members && members.push(...response.body.members);
    cursor = response?.body?.response_metadata?.next_cursor;
  } while (!!cursor);

  return members;
};

export const getSlackUser = async (
  userId: string,
  token: string
): Promise<UserInfo> => {
  const url = 'https://slack.com/api/users.info?';

  const response = await request
    .get(url + 'user=' + userId)
    .set('Authorization', 'Bearer ' + token);

  const responseBody = response.body as UserInfoResponseBody;
  return responseBody.user;
};
