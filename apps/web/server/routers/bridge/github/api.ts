import axios from 'axios';
import * as LinenTypes from '@linen/types';
import env from './config';
import { getLinenUrl } from 'utilities/domain';
import { appendProtocol } from 'utilities/url';

const instance = axios.create({
  baseURL: `${appendProtocol(getLinenUrl())}/api/integrations`,
  headers: { 'x-api-internal': env.INTERNAL_API_KEY },
});

function catchError(error: any) {
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
}

const get = (path: string) =>
  instance
    .get(path)
    .then((res) => res.data)
    .catch(catchError);

const post = (path: string, data = {}) =>
  instance
    .post(path, data)
    .then((res) => res.data)
    .catch(catchError);

const put = (path: string, data = {}) =>
  instance
    .put(path, data)
    .then((res) => res.data)
    .catch(catchError);

export default class Api {
  static getChannel(
    installationId: number
  ): Promise<{ id: string; accountId: string } | null> {
    return get(`/channels?installationId=${installationId}`);
  }

  static getThread(
    externalThreadId: string,
    channelId: string
  ): Promise<{ id: string } | null> {
    return get(
      `/threads?externalThreadId=${externalThreadId}&channelId=${channelId}`
    );
  }

  static findOrCreateUser(
    user: LinenTypes.userPostType
  ): Promise<{ id: string }> {
    return post(`/users`, user);
  }

  static createNewThread(thread: LinenTypes.threadPostType) {
    return post(`/threads`, thread);
  }

  static updateThread(thread: LinenTypes.threadPutType) {
    return put(`/threads`, thread);
  }

  static createNewMessage(message: LinenTypes.messagePostType) {
    return post(`/messages`, message);
  }
}
