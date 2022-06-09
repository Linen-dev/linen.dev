import axios from 'axios';
import useSWR from 'swr';
import isBrowser from '../utils/isBrowser';
import * as Sentry from '@sentry/nextjs';

// const baseUrl = 'https://papercups-io.linen.dev/api'; // set this
const baseUrl = '/api/'; // set this

const catchError = (e: { response: any }) => {
  const { response } = e;
  Sentry.captureException(e);
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
  request.baseURL = baseUrl;
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
      await patch(url, updates);
      mutate();
    },
    mutate,
    isLoading: isBrowser() && !error && !data,
  };
};
