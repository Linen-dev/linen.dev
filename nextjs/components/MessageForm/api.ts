import { get } from 'utilities/http';
import debounce from 'awesome-debounce-promise';

const debouncedFetchMentions = debounce(
  (term: string) => get(`/api/mentions?term=${term}`),
  100,
  { leading: true }
);

export function fetchMentions(term: string) {
  return debouncedFetchMentions(term);
}
