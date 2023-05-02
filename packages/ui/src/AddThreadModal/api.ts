import debounce from '@linen/utilities/debounce';
import { qs } from '@linen/utilities/url';

const debouncedFetchMentions = debounce(
  (term: string, communityId: string) =>
    fetch(`/api/mentions?${qs({ term, communityId })}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }).then((response) => response.json()),
  100
);

export function fetchMentions(term: string, communityId: string) {
  return debouncedFetchMentions(term, communityId);
}
