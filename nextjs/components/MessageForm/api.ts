import { get } from 'utilities/http';
import debounce from 'awesome-debounce-promise';
import { qs } from 'utilities/url';

const debouncedFetchMentions = debounce(
  (term: string, communityId: string) =>
    get(`/api/mentions?${qs({ term, communityId })}`),
  100,
  { leading: true }
);

export function fetchMentions(term: string, communityId: string) {
  return debouncedFetchMentions(term, communityId);
}
