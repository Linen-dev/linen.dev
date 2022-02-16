import axios from 'axios';
import useSWR from 'swr';

const baseURL = 'https://localhost:1234'; // set this

const catchError = (e) => {
  const { response } = e;
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

export const get = (path) => axios.get(path).then((res) => res.data);

export const post = (path, data = {}) =>
  axios
    .post(path, data)
    .then((res) => res.data)
    .catch(catchError);

export const patch = (path, data = {}) =>
  axios
    .patch(path, data)
    .then((res) => res.data)
    .catch(catchError);

export const put = (path, data = {}) =>
  axios
    .put(path, data)
    .then((res) => res.data)
    .catch(catchError);

// Delete is a reserved term
export const deleteReq = (path) =>
  axios
    .delete(path)
    .then((res) => res.data)
    .catch(catchError);

export const useRequest = (url) => {
  const { data, mutate, error } = useSWR(url, get, {
    revalidateOnReconnect: true,
    revalidateIfStale: true,
    revalidateOnMount: true,
  });

  return {
    data,
    error,
    update: async (updates) => {
      mutate((prevData) => ({ ...prevData, ...updates }), false);
      await patch(url, updates);
      mutate();
    },
    mutate,
    isLoading: isBrowser() && !error && !data,
  };
};
