import { get } from 'utilities/requests';
import axios, { AxiosRequestConfig } from 'axios';
import debounce from '@linen/utilities/debounce';
import { qs } from '@linen/utilities/url';

const debouncedFetchMentions = debounce(
  (term: string, communityId: string) =>
    get(`/api/mentions?${qs({ term, communityId })}`),
  100
);

export function fetchMentions(term: string, communityId: string) {
  return debouncedFetchMentions(term, communityId);
}

export function upload(
  { communityId, data }: { communityId: string; data: FormData },
  options: AxiosRequestConfig
): Promise<any> {
  return axios.post(`/api/upload?communityId=${communityId}`, data, options);
}
