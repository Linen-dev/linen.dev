import axios, { Axios } from 'axios';
import * as LinenTypes from '@linen/types';
import { qs } from '@linen/utilities/url';
export { integrationMiddleware } from './middleware';

export default class Api {
  private instance: Axios;

  private catchError = (error: any) => {
    if (error.response) {
      console.error(error.response.data);
      console.error(error.response.status);
      console.error(error.response.headers);
    } else if (error.request) {
      console.error(error.request);
    } else {
      console.error(error.message);
    }
    throw error;
  };

  private get = (path: string) =>
    this.instance
      .get(path)
      .then((res) => res.data)
      .catch(this.catchError);

  private post = (path: string, data = {}) =>
    this.instance
      .post(path, data)
      .then((res) => res.data)
      .catch(this.catchError);

  private put = (path: string, data = {}) =>
    this.instance
      .put(path, data)
      .then((res) => res.data)
      .catch(this.catchError);

  constructor({
    apiKey,
    type = 'external',
    linenUrl = 'https://main.linendev.com',
  }: {
    apiKey: string;
    type?: 'internal' | 'external';
    linenUrl?: string;
  }) {
    const key = type === 'internal' ? 'x-api-internal' : 'x-api-key';
    this.instance = axios.create({
      baseURL: `${linenUrl}`,
      headers: { [key]: apiKey },
    });
  }

  whoAmI(): Promise<{ accountId: string } | null> {
    return this.get(`/api/integrations/me`);
  }

  // channels ----

  getChannel(
    search: LinenTypes.channelGetType
  ): Promise<{ id: string; accountId: string } | null> {
    return this.get(`/api/integrations/channels?${qs(search)}`);
  }

  findOrCreateChannel(
    props: LinenTypes.channelFindOrCreateType
  ): Promise<{ id: string }> {
    return this.post(`/api/integrations/channels`, props);
  }

  getChannelIntegration(
    search: LinenTypes.channelGetIntegrationType
  ): Promise<LinenTypes.ChannelsIntegration | null> {
    return this.get(`/api/integrations/channels/integration?${qs(search)}`);
  }

  updateChannelIntegration(
    data: LinenTypes.channelPutIntegrationType
  ): Promise<{ data: any } | null> {
    return this.put(`/api/integrations/channels/integration`, data);
  }

  // threads -----

  getThread({
    externalThreadId,
    channelId,
    threadId,
  }: LinenTypes.threadFindType): Promise<LinenTypes.threadFindResponseType> {
    return this.get(
      `/api/integrations/threads?${qs({
        externalThreadId,
        channelId,
        threadId,
      })}`
    );
  }

  createNewThread(thread: LinenTypes.threadPostType) {
    return this.post(`/api/integrations/threads`, thread);
  }

  updateThread(thread: LinenTypes.threadPutType) {
    return this.put(`/api/integrations/threads`, thread);
  }

  // messages ----

  createNewMessage(message: LinenTypes.messagePostType) {
    return this.post(`/api/integrations/messages`, message);
  }

  findMessage(
    search: LinenTypes.messageFindType
  ): Promise<LinenTypes.messageFindResponseType> {
    return this.get(`/api/integrations/messages?${qs(search)}`);
  }

  getMessage({
    messageId,
  }: LinenTypes.messageGetType): Promise<LinenTypes.messageGetResponseType> {
    return this.get(`/api/integrations/messages/${messageId}`);
  }

  updateMessage(message: LinenTypes.messagePutType) {
    return this.put(`/api/integrations/messages`, message);
  }

  // users ----
  findUser(search: LinenTypes.userGetType): Promise<{ id: string }> {
    return this.get(`/api/integrations/users?${qs(search)}`);
  }

  findOrCreateUser(user: LinenTypes.userPostType): Promise<{ id: string }> {
    return this.post(`/api/integrations/users`, user);
  }
}
