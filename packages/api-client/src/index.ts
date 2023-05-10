import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { qs } from '@linen/utilities/url';
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
  UploadedFile,
  SerializedReadStatus,
  ReminderTypes,
} from '@linen/types';
export { AxiosRequestConfig };

export default class ApiClient {
  instance: AxiosInstance;

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

  get = <T>(path: string) =>
    this.instance
      .get<T>(path)
      .then((res) => res.data)
      .catch(this.catchError);

  post = <T>(path: string, data = {}) =>
    this.instance
      .post<T>(path, data)
      .then((res) => res.data)
      .catch(this.catchError);

  postWithOptions = <T>(path: string, data = {}, options: AxiosRequestConfig) =>
    this.instance
      .post<T>(path, data, options)
      .then((res) => res.data)
      .catch(this.catchError);

  patch = <T>(path: string, data = {}) =>
    this.instance
      .patch<T>(path, data)
      .then((res) => res.data)
      .catch(this.catchError);

  put = <T>(path: string, data = {}) =>
    this.instance
      .put<T>(path, data)
      .then((res) => res.data)
      .catch(this.catchError);

  // Delete is a reserved term
  deleteReq = <T>(path: string) =>
    this.instance
      .delete<T>(path)
      .then((res) => res.data)
      .catch(this.catchError);

  getAccounts = <T>() => this.get<T>('/api/accounts');

  createAccount = (props: createAccountType) =>
    this.post<{ id: string }>('/api/accounts', props);

  updateAccount = <T>(props: updateAccountType) =>
    this.put<T>('/api/accounts', props);

  getThreads = (props: findThreadType) =>
    this.get<channelNextPageType>(`/api/threads?${qs(props)}`);

  getThread = ({ id, ...props }: getThreadType) =>
    this.get<SerializedThread>(`/api/threads/${id}?${qs(props)}`);

  updateThread = (props: putThreadType) =>
    this.put<SerializedThread>(`/api/threads/${props.id}`, props);

  createThread = (props: postThreadType) =>
    this.post<{ thread: SerializedThread; imitationId: string }>(
      `/api/threads`,
      props
    );

  starThread = (props: { communityId: string; threadId: string }) =>
    this.post('/api/starred', props);

  threadIncrementView = ({ incrementId }: { incrementId: number }) =>
    this.put(`/api/count?${qs({ incrementId })}`);

  deleteMessage = (props: deleteMessageType) =>
    this.deleteReq<{ ok: boolean }>(
      `/api/messages/${props.id}?accountId=${props.accountId}`
    );

  createMessage = (props: postMessageType) =>
    this.post<{ message: SerializedMessage; imitationId: string }>(
      `/api/messages`,
      props
    );

  updateMessage = (props: putMessageType) =>
    this.put<SerializedMessage>(`/api/messages/${props.id}`, props);

  highlight = (props: { input: string }) =>
    this.post<{ output: string }>('/api/highlight', props);

  createChannel = (props: createChannelType) =>
    this.post<SerializedChannel>(`/api/channels`, props);

  updateChannel = ({
    accountId,
    channelId,
    channelName,
    channelPrivate,
  }: {
    accountId: string;
    channelId: string;
    channelName: string;
    channelPrivate: boolean;
  }) =>
    this.put(`/api/channels/${channelId}`, {
      accountId,
      channelId,
      channelName,
      channelPrivate,
    });

  setDefaultChannel = (props: setDefaultChannelType) =>
    this.post<{}>(`/api/channels/default`, props);

  hideChannels = (props: bulkHideChannelsType) =>
    this.post<{}>(`/api/channels/hide`, props);

  hideChannel = ({
    accountId,
    channelId,
  }: {
    accountId: string;
    channelId: string;
  }) =>
    this.post<any>(`/api/channels/hide?${qs({ accountId })}`, {
      channelId,
      hidden: true,
    });

  getChannelIntegrations = ({
    channelId,
    ...props
  }: getChannelIntegrationsType) =>
    this.get<{ data: any; type: string; externalId: string }>(
      `/api/channels/${channelId}/integrations?${qs(props)}`
    );

  getChannelsStats = (props: { accountId: string }) =>
    this.get<findChannelsWithStats>(`/api/channels/stats?${qs(props)}`);

  postChannelIntegrations = ({
    channelId,
    ...props
  }: postChannelIntegrationsType) =>
    this.post<{ id: string }>(`/api/channels/${channelId}/integrations`, props);

  createDm = (props: createDmType) =>
    this.post<SerializedChannel>(`/api/channels/dm`, props);

  archiveChannel = (props: archiveChannelType) =>
    this.post<{}>(`/api/channels/archive`, props);

  getChannelMembers = ({ channelId, ...props }: getChannelMembersType) =>
    this.get<SerializedUser[]>(
      `/api/channels/${channelId}/members?${qs(props)}`
    );

  updateChannelMembers = ({ channelId, ...props }: putChannelMembersType) =>
    this.put<SerializedUser[]>(`/api/channels/${channelId}/members`, props);

  deleteUser = (props: deleteUserType) =>
    this.deleteReq<{}>(`/api/users?${qs(props)}`);

  deleteAccount = (props: { accountId: string }) =>
    this.deleteReq<{}>(`/api/accounts/${props.accountId}`);

  postReaction = <T>(params: {
    communityId: string;
    messageId: string;
    type: string;
    action: string;
  }) => this.post<T>('/api/reactions', params);

  mergeThreadsRequest = <T>(params: {
    from: string;
    to: string;
    communityId: string;
  }) => this.post<T>('/api/merge', params);

  moveMessageToThreadRequest = <T>(params: {
    messageId: string;
    threadId: string;
    communityId: string;
  }) => this.post<T>('/api/move/message/thread', params);

  moveMessageToChannelRequest = (params: {
    messageId: string;
    channelId: string;
    communityId: string;
  }) => this.post<SerializedThread>('/api/move/message/channel', params);

  moveThreadToChannelRequest = <T>(params: {
    threadId: string;
    channelId: string;
    communityId: string;
  }) => this.post<T>('/api/move/thread/channel', params);

  fetchMentions = (term: string, communityId: string) =>
    this.get<SerializedUser[]>(`/api/mentions?${qs({ term, communityId })}`);

  upload = (
    { communityId, data }: { communityId: string; data: FormData },
    options: AxiosRequestConfig
  ) =>
    this.postWithOptions<{ files: UploadedFile[] }>(
      `/api/upload?communityId=${communityId}`,
      data,
      options
    );

  getReadStatus = (channelId: string) =>
    this.get<SerializedReadStatus>(`/api/read-status/${channelId}`);

  postReadStatus = ({ channelIds }: { channelIds: string[] }) =>
    this.post<{ readStatuses: SerializedReadStatus[] }>('/api/read-status', {
      channelIds,
    });

  updateReadStatus = (channelId: string, timestamp: number) =>
    this.put<SerializedReadStatus>(`/api/read-status/${channelId}`, {
      timestamp,
    });

  upsertUserThreadStatus = (params: {
    communityId: string;
    threadIds: string[];
    muted: boolean;
    read: boolean;
    reminder: boolean;
    reminderType?: ReminderTypes;
  }) => this.post('/api/user-thread-status', params);

  notificationsMark = ({ threadId }: { threadId: string }) =>
    this.put('/api/notifications/mark', { threadId });

  notificationSettings = () =>
    this.get<{
      notificationsByEmail: boolean;
    }>('/api/notifications/settings');

  updateNotificationSettings = ({
    notificationsByEmail,
  }: {
    notificationsByEmail: boolean;
  }) =>
    this.put('/api/notifications/settings', {
      notificationsByEmail,
    });

  uploadAvatar = (data: FormData, options: AxiosRequestConfig = {}) =>
    this.postWithOptions('/api/profile/avatar', data, options);

  updateProfile = ({ displayName }: { displayName: string }) =>
    this.put('/api/profile', {
      displayName,
    });

  fetchInbox = ({
    communityName,
    page,
    limit,
    channelIds,
  }: {
    communityName: string;
    page: number;
    limit: number;
    channelIds: string[];
  }) =>
    this.post<{
      threads: SerializedThread[];
      total: number;
    }>('/api/inbox', {
      communityName,
      page,
      limit,
      channelIds,
    });
}

export { type ApiClient };
