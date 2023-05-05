import ApiClient from '@linen/api-client';

export const api = new ApiClient({
  baseURL: '/',
  // customInterceptor: No need for interceptor since it will use the cookie
});
