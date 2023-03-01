import axios from 'axios';
import { qs } from '@linen/utilities/url';
import useSWR from 'swr';
import isBrowser from './isBrowser';
import type {
  SerializedMessage,
  SerializedThread,
  createChannelType,
  bulkHideChannelsType,
  setDefaultChannelType,
  SerializedChannel,
  getChannelIntegrationsType,
  postChannelIntegrationsType,
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

export const useRequest = (url: string) => {
  const { data, mutate, error } = useSWR(url, get, {
    revalidateOnReconnect: true,
    revalidateIfStale: true,
    revalidateOnMount: true,
  });

  return {
    data,
    error,
    update: async (updates: any) => {
      mutate((prevData: any) => ({ ...prevData, ...updates }), false);
      await put(url, updates);
      mutate();
    },
    mutate,
    isLoading: isBrowser() && !error && !data,
  };
};

export const getAccounts = () => get('/api/accounts');

export const createAccount = (
  props: AccountsTypes.createAccountType
): Promise<{ id: string }> => post('/api/accounts', props);

export const updateAccount = (props: AccountsTypes.updateAccountType) =>
  put('/api/accounts', props);

export const setDiscordIntegrationCustomBot = (
  props: AccountsTypes.integrationDiscordType
) => post('/api/accounts/integration/discord', props);

export const getThreads = (
  props: ThreadsTypes.findType
): Promise<channelNextPageType> => get(`/api/threads?${qs(props)}`);

export const getThread = (
  props: ThreadsTypes.getType
): Promise<SerializedThread> => get(`/api/threads/${props.id}`);

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
}): Promise<
  {
    stats: string;
    id: string;
  }[]
> => get(`/api/channels/stats?${qs(props)}`);

export const postChannelIntegrations = ({
  channelId,
  ...props
}: postChannelIntegrationsType): Promise<{
  id: string;
}> => post(`/api/channels/${channelId}/integrations`, props);
