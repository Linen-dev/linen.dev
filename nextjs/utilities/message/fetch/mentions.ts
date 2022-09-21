import { fetcher } from 'utilities/fetcher';

export function fetchMentions(query?: string) {
  let params = '';
  if (query) params = '?q=' + query;
  return fetcher('/api/users/mentions' + params);
}
