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
  channelNextPageType,
  createAccountType,
  updateAccountType,
  findThreadType,
  getThreadType,
  putThreadType,
  postThreadType,
  deleteMessageType,
  postMessageType,
  putMessageType,
} from '@linen/types';
export { AxiosRequestConfig };

export default class ApiClient {
  instance;

  constructor({
    baseURL = '/',
    customInterceptor,
  }: { baseURL?: string; customInterceptor?: any } = {}) {
    this.instance = axios.create({
      baseURL,
    });
    this.instance.interceptors.request.use(async (request) => {
      request.headers = {
        ...request.headers,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };
      return request;
    });
    customInterceptor &&
      this.instance.interceptors.request.use(customInterceptor);
  }

  catchError = (e: { response: any }) => {
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

  get = (path: string) =>
    this.instance
      .get(path)
      .then((res) => res.data)
      .catch(this.catchError);

  post = (path: string, data = {}) =>
    this.instance
      .post(path, data)
      .then((res) => res.data)
      .catch(this.catchError);

  patch = (path: string, data = {}) =>
    this.instance
      .patch(path, data)
      .then((res) => res.data)
      .catch(this.catchError);

  put = (path: string, data = {}) =>
    this.instance
      .put(path, data)
      .then((res) => res.data)
      .catch(this.catchError);

  // Delete is a reserved term
  deleteReq = (path: string) =>
    this.instance
      .delete(path)
      .then((res) => res.data)
      .catch(this.catchError);

  getAccounts = () => this.get('/api/accounts');

  createAccount = (props: createAccountType): Promise<{ id: string }> =>
    this.post('/api/accounts', props);

  updateAccount = (props: updateAccountType) =>
    this.put('/api/accounts', props);

  getThreads = (props: findThreadType): Promise<channelNextPageType> =>
    this.get(`/api/threads?${qs(props)}`);

  getThread = ({ id, ...props }: getThreadType): Promise<SerializedThread> =>
    this.get(`/api/threads/${id}?${qs(props)}`);

  updateThread = (props: putThreadType): Promise<SerializedThread> =>
    this.put(`/api/threads/${props.id}`, props);

  createThread = (
    props: postThreadType
  ): Promise<{ thread: SerializedThread; imitationId: string }> =>
    this.post(`/api/threads`, props);

  deleteMessage = (props: deleteMessageType): Promise<{ ok: boolean }> =>
    this.deleteReq(`/api/messages/${props.id}?accountId=${props.accountId}`);

  createMessage = (
    props: postMessageType
  ): Promise<{ message: SerializedMessage; imitationId: string }> =>
    this.post(`/api/messages`, props);

  updateMessage = (props: putMessageType): Promise<SerializedMessage> =>
    this.put(`/api/messages/${props.id}`, props);

  createChannel = (props: createChannelType): Promise<SerializedChannel> =>
    this.post(`/api/channels`, props);

  setDefaultChannel = (props: setDefaultChannelType): Promise<{}> =>
    this.post(`/api/channels/default`, props);

  hideChannels = (props: bulkHideChannelsType): Promise<{}> =>
    this.post(`/api/channels/hide`, props);

  getChannelIntegrations = ({
    channelId,
    ...props
  }: getChannelIntegrationsType): Promise<{
    data: any;
    type: string;
    externalId: string;
  }> => this.get(`/api/channels/${channelId}/integrations?${qs(props)}`);

  getChannelsStats = (props: {
    accountId: string;
  }): Promise<findChannelsWithStats> =>
    this.get(`/api/channels/stats?${qs(props)}`);

  postChannelIntegrations = ({
    channelId,
    ...props
  }: postChannelIntegrationsType): Promise<{
    id: string;
  }> => this.post(`/api/channels/${channelId}/integrations`, props);

  createDm = (props: createDmType): Promise<SerializedChannel> =>
    this.post(`/api/channels/dm`, props);

  archiveChannel = (props: archiveChannelType): Promise<{}> =>
    this.post(`/api/channels/archive`, props);

  getChannelMembers = ({
    channelId,
    ...props
  }: getChannelMembersType): Promise<SerializedUser[]> =>
    this.get(`/api/channels/${channelId}/members?${qs(props)}`);

  updateChannelMembers = ({
    channelId,
    ...props
  }: putChannelMembersType): Promise<SerializedUser[]> =>
    this.put(`/api/channels/${channelId}/members`, props);

  deleteUser = ({ ...props }: deleteUserType): Promise<{}> =>
    this.deleteReq(`/api/users?${qs(props)}`);

  deleteAccount = (props: { accountId: string }): Promise<{}> =>
    this.deleteReq(`/api/accounts/${props.accountId}`);

  postReaction = debounce(
    (params: {
      communityId: string;
      messageId: string;
      type: string;
      action: string;
    }) => {
      return this.post('/api/reactions', params);
    }
  );

  mergeThreadsRequest = debounce((params: { from: string; to: string }) => {
    return this.post('/api/merge', params);
  });

  moveMessageToThreadRequest = debounce(
    (params: { messageId: string; threadId: string }) => {
      return this.post('/api/move/message/thread', params);
    }
  );

  moveMessageToChannelRequest = debounce(
    (params: { messageId: string; threadId: string }) => {
      return this.post('/api/move/message/channel', params);
    }
  );

  moveThreadToChannelRequest = debounce(
    (params: { threadId: string; channelId: string }) => {
      return this.post('/api/move/thread/channel', params);
    }
  );

  fetchMentions(term: string, communityId: string) {
    return debounce(
      (term: string, communityId: string) =>
        this.get(`/api/mentions?${qs({ term, communityId })}`),
      100
    );
  }

  upload(
    { communityId, data }: { communityId: string; data: FormData },
    options: AxiosRequestConfig
  ): Promise<any> {
    return this.instance.post(
      `/api/upload?communityId=${communityId}`,
      data,
      options
    );
  }
}
