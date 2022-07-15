export const fetcher = (url: string) => fetch(url).then((r) => r.json());

export const qsBuilder = (params?: any) =>
  !!params &&
  Object.keys(params)
    .map((key: any) => `${key}=${params[key]}`)
    .join('&');
