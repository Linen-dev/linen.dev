import { SerializedThread, Settings } from '@linen/types';
import { LINEN_URL } from 'config';

export function buildUrl(
  isSubDomainRouting: boolean,
  settings: Settings,
  thread: SerializedThread
) {
  let url = isSubDomainRouting
    ? `https://${settings.redirectDomain}/t/${thread.incrementId}`
    : `${LINEN_URL}/${settings.prefix}/${settings.communityName}/t/${thread.incrementId}`;

  if (thread.slug) {
    url += '/' + thread.slug.toLowerCase();
  }
  return url;
}
