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
    console.error(error.config);
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

  constructor(apiKey: string, linenUrl: string = 'https://main.linendev.com') {
    this.instance = axios.create({
      baseURL: `${linenUrl}/api/integrations`,
      headers: { 'x-api-internal': apiKey },
    });
  }

  // channels ----

  getChannel({
    integrationId,
  }: {
    integrationId: string;
  }): Promise<{ id: string; accountId: string } | null> {
    return this.get(`/channels?${qs({ integrationId })}`);
  }

  // threads -----

  getThread({
    externalThreadId,
    channelId,
    threadId,
  }: LinenTypes.threadFindType): Promise<LinenTypes.threadFindResponseType> {
    return this.get(
      `/threads?${qs({ externalThreadId, channelId, threadId })}`
    );
  }

  createNewThread(thread: LinenTypes.threadPostType) {
    return this.post(`/threads`, thread);
  }

  updateThread(thread: LinenTypes.threadPutType) {
    return this.put(`/threads`, thread);
  }

  // messages ----

  createNewMessage(message: LinenTypes.messagePostType) {
    return this.post(`/messages`, message);
  }

  findMessage(
    search: LinenTypes.messageFindType
  ): Promise<LinenTypes.messageFindResponseType> {
    return this.get(`/messages?${qs(search)}`);
  }

  getMessage({
    messageId,
  }: LinenTypes.messageGetType): Promise<LinenTypes.messageGetResponseType> {
    return this.get(`/messages/${messageId}`);
  }

  updateMessage(message: LinenTypes.messagePutType) {
    return this.put(`/messages`, message);
  }

  // users ----

  findOrCreateUser(user: LinenTypes.userPostType): Promise<{ id: string }> {
    return this.post(`/users`, user);
  }
}
