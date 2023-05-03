import axios, { AxiosRequestConfig } from 'axios';
import { qs } from '@linen/utilities/url';
import debounce from '@linen/utilities/debounce';
import type {
  SerializedMessage,
  SerializedThread,
  createChannelType,
  bulkHideChannelsType,
  setDefaultChannelType,
  SerializedChannel,
  getChannelIntegrationsType,
  postChannelIntegrationsType,
  createDmType,
  archiveChannelType,
  getChannelMembersType,
  SerializedUser,
  putChannelMembersType,
  findChannelsWithStats,
  deleteUserType,
} from '@linen/types';
import type * as AccountsTypes from 'server/routers/accounts.types';
import type * as ThreadsTypes from 'server/routers/threads/types';
import type * as MessagesTypes from 'server/routers/messages/types';
import { channelNextPageType } from 'services/channels/channelNextPage';

const catchError = (e: { response: any }) => {
  const { response } = e;
  console.error(e);
  if (!response || response.status >= 500) {
    throw new Error('An internal error occurred. Please try again');
  } else {
    if (response.data?.message?.includes('missing or invalid')) {
      throw new Error('Request failed: incomplete data.');
    } else {
      throw new Error(response.data?.message || e);
    }
  }
};

axios.interceptors.request.use(async (request) => {
  request.headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  return request;
});

export const get = (path: string) => axios.get(path).then((res) => res.data);

export const post = (path: string, data = {}) =>
  axios
    .post(path, data)
    .then((res) => res.data)
    .catch(catchError);

export const patch = (path: string, data = {}) =>
  axios
    .patch(path, data)
    .then((res) => res.data)
    .catch(catchError);

export const put = (path: string, data = {}) =>
  axios
    .put(path, data)
    .then((res) => res.data)
    .catch(catchError);

// Delete is a reserved term
export const deleteReq = (path: string) =>
  axios
    .delete(path)
    .then((res) => res.data)
    .catch(catchError);

export const getAccounts = () => get('/api/accounts');

export const createAccount = (
  props: AccountsTypes.createAccountType
): Promise<{ id: string }> => post('/api/accounts', props);

export const updateAccount = (props: AccountsTypes.updateAccountType) =>
  put('/api/accounts', props);

export const getThreads = (
  props: ThreadsTypes.findType
): Promise<channelNextPageType> => get(`/api/threads?${qs(props)}`);

export const getThread = ({
  id,
  ...props
}: ThreadsTypes.getType): Promise<SerializedThread> =>
  get(`/api/threads/${id}?${qs(props)}`);

export const updateThread = (
  props: ThreadsTypes.putType
): Promise<SerializedThread> => put(`/api/threads/${props.id}`, props);

export const createThread = (
  props: ThreadsTypes.postType
): Promise<{ thread: SerializedThread; imitationId: string }> =>
  post(`/api/threads`, props);

// export const getMessage = (
//   props: MessagesTypes.getType
// ): Promise<SerializedMessage> => get(`/api/messages/${props.id}`);

export const deleteMessage = (
  props: MessagesTypes.deleteType
): Promise<{ ok: boolean }> =>
  deleteReq(`/api/messages/${props.id}?accountId=${props.accountId}`);

export const createMessage = (
  props: MessagesTypes.postType
): Promise<{ message: SerializedMessage; imitationId: string }> =>
  post(`/api/messages`, props);

export const updateMessage = (
  props: MessagesTypes.putType
): Promise<SerializedMessage> => put(`/api/messages/${props.id}`, props);

export const createChannel = (
  props: createChannelType
): Promise<SerializedChannel> => post(`/api/channels`, props);

export const setDefaultChannel = (props: setDefaultChannelType): Promise<{}> =>
  post(`/api/channels/default`, props);

export const hideChannels = (props: bulkHideChannelsType): Promise<{}> =>
  post(`/api/channels/hide`, props);

export const getChannelIntegrations = ({
  channelId,
  ...props
}: getChannelIntegrationsType): Promise<{
  data: any;
  type: string;
  externalId: string;
}> => get(`/api/channels/${channelId}/integrations?${qs(props)}`);

export const getChannelsStats = (props: {
  accountId: string;
}): Promise<findChannelsWithStats> => get(`/api/channels/stats?${qs(props)}`);

export const postChannelIntegrations = ({
  channelId,
  ...props
}: postChannelIntegrationsType): Promise<{
  id: string;
}> => post(`/api/channels/${channelId}/integrations`, props);

export const createDm = (props: createDmType): Promise<SerializedChannel> =>
  post(`/api/channels/dm`, props);

export const archiveChannel = (props: archiveChannelType): Promise<{}> =>
  post(`/api/channels/archive`, props);

export const getChannelMembers = ({
  channelId,
  ...props
}: getChannelMembersType): Promise<SerializedUser[]> =>
  get(`/api/channels/${channelId}/members?${qs(props)}`);

export const updateChannelMembers = ({
  channelId,
  ...props
}: putChannelMembersType): Promise<SerializedUser[]> =>
  put(`/api/channels/${channelId}/members`, props);

export const deleteUser = ({ ...props }: deleteUserType): Promise<{}> =>
  deleteReq(`/api/users?${qs(props)}`);

export const deleteAccount = (props: { accountId: string }): Promise<{}> =>
  deleteReq(`/api/accounts/${props.accountId}`);

export const postReaction = debounce(
  (params: {
    communityId: string;
    messageId: string;
    type: string;
    action: string;
  }) => {
    return post('/api/reactions', params);
  }
);

export const mergeThreadsRequest = debounce(
  (params: { from: string; to: string }) => {
    return post('/api/merge', params);
  }
);

export const moveMessageToThreadRequest = debounce(
  (params: { messageId: string; threadId: string }) => {
    return post('/api/move/message/thread', params);
  }
);

export const moveMessageToChannelRequest = debounce(
  (params: { messageId: string; threadId: string }) => {
    return post('/api/move/message/channel', params);
  }
);

export const moveThreadToChannelRequest = debounce(
  (params: { threadId: string; channelId: string }) => {
    return post('/api/move/thread/channel', params);
  }
);

const debouncedFetchMentions = debounce(
  (term: string, communityId: string) =>
    get(`/api/mentions?${qs({ term, communityId })}`),
  100
);

export function fetchMentions(term: string, communityId: string) {
  return debouncedFetchMentions(term, communityId);
}

export function upload(
  { communityId, data }: { communityId: string; data: FormData },
  options: AxiosRequestConfig
): Promise<any> {
  return axios.post(`/api/upload?communityId=${communityId}`, data, options);
}
