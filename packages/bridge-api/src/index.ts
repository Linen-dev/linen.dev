import axios, { Axios } from 'axios';
import * as LinenTypes from '@linen/types';
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

  constructor(apiKey: string, linenUrl: string = 'https://linen.dev') {
    this.instance = axios.create({
      baseURL: `${linenUrl}/api/integrations`,
      headers: { 'x-api-internal': apiKey },
    });
  }

  // appendProtocol(getLinenUrl())

  getChannel(
    integrationId: string
  ): Promise<{ id: string; accountId: string } | null> {
    return this.get(`/channels?integrationId=${integrationId}`);
  }

  getThread(
    externalThreadId: string,
    channelId: string
  ): Promise<{ id: string } | null> {
    return this.get(
      `/threads?externalThreadId=${externalThreadId}&channelId=${channelId}`
    );
  }

  findOrCreateUser(user: LinenTypes.userPostType): Promise<{ id: string }> {
    return this.post(`/users`, user);
  }

  createNewThread(thread: LinenTypes.threadPostType) {
    return this.post(`/threads`, thread);
  }

  updateThread(thread: LinenTypes.threadPutType) {
    return this.put(`/threads`, thread);
  }

  createNewMessage(message: LinenTypes.messagePostType) {
    return this.post(`/messages`, message);
  }
}
