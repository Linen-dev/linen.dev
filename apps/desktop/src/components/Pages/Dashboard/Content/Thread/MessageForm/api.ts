import { get } from '../../../../../../utilities/http';
import axios, { AxiosRequestConfig } from 'axios';
import debounce from '@linen/utilities/debounce';

// TODO add /api/v2/mentions
const debouncedFetchMentions = debounce(
  (term: string, communityId: string) =>
    get(`/api/mentions?$term=${term}&communityId=${communityId}`).then(
      (response) => response.data
    ),
  100
);

export function fetchMentions(term: string, communityId: string) {
  return debouncedFetchMentions(term, communityId);
}

// TODO add /api/v2/upload
// refactor to use tauri post
export function upload(
  { communityId, data }: { communityId: string; data: FormData },
  options: AxiosRequestConfig
) {
  return axios.post(`/api/upload?communityId=${communityId}`, data, options);
}
