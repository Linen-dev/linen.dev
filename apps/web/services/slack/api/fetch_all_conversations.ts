import request from 'superagent';
import { createManyUsers } from 'services/users';
import { generateRandomWordSlug } from '@linen/utilities/randomWordSlugs';
import {
  BotInfo,
  UserInfo,
  UserInfoResponseBody,
  ConversationRepliesBody,
  ConversationHistoryBody,
} from '@linen/types';
import { FetchRepliesResponseType, GetMembershipsFnType } from '../types';
import { qs } from '@linen/utilities/url';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

interface RetryConfig extends AxiosRequestConfig {
  retry: number;
}

const instance = axios.create({ baseURL: 'https://slack.com' });

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config } = error;
    const response = (error?.response as AxiosResponse) ?? {};
    const delay =
      Number(
        response?.headers['Retry-After'] ??
          response?.headers['retry-after'] ??
          10
      ) * 1000;

    if (!config || !config.retry || [404, 403, 401].includes(response.status)) {
      return Promise.reject(error);
    }
    config.retry -= 1;
    const delayRetryRequest = new Promise<void>((resolve) => {
      setTimeout(() => {
        console.warn({ retry: config.retry, delay, url: config.url });
        resolve();
      }, delay);
    });
    return delayRetryRequest.then(() => instance(config));
  }
);

const callApi = async <T>(url: string, token: string) => {
  const retryConfig: RetryConfig = {
    retry: 3,
  };
  return instance
    .get<T>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      ...retryConfig,
    })
    .then((res) => res.data);
};

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

export const fetchConversationsTyped = async (
  channel: string,
  token: string,
  cursor: string | null = null, // Example "dXNlcjpVMDYxTkZUVDI="
  oldest: string | null = null // Example "1234567890.123456"
) => {
  const url = `/api/conversations.history?${qs({
    channel,
    cursor,
    oldest,
  })}`;

  return callApi<ConversationHistoryBody>(url, token);
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
  const url = `https://slack.com/api/conversations.replies?channel=${channel}&ts=${threadTs}`;
  return callApi<FetchRepliesResponseType>(url, token);
};

export const fetchFile = async (fileUrl: string, token: string) => {
  if (!token) return await request.get(fileUrl);

  const response = await request
    .get(fileUrl)
    .set('Authorization', 'Bearer ' + token);
  return response;
};

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

export const getSlackBot = async (
  botId: string,
  token: string
): Promise<BotInfo> => {
  const url = 'https://slack.com/api/bots.info?';

  const response = await request
    .get(url + 'bot=' + botId)
    .set('Authorization', 'Bearer ' + token);

  return response.body.ok === true ? response.body.bot : {};
};
