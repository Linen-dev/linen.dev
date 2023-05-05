import { baseLinen } from './config';
import { getJwtToken } from '@linen/auth/client';
import ApiClient, { type AxiosRequestConfig } from '@linen/api-client';

export const api = new ApiClient({
  baseURL: baseLinen,
  customInterceptor: async (request: AxiosRequestConfig<any>) => {
    const token = getJwtToken();
    request.headers = {
      ...request.headers,
      Authorization: `Bearer ${token}`,
    };
    return request;
  },
});

if (typeof window !== 'undefined') {
  const { fetch: originalFetch } = window;

  window.fetch = async (...args) => {
    let [resource, config = {}] = args;

    const token = getJwtToken();

    if (!!token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    if (resource.toString().startsWith('/')) {
      resource = baseLinen + resource;
    }
    // request interceptor here
    const response = await originalFetch(resource, config);
    // response interceptor here
    return response;
  };
}
