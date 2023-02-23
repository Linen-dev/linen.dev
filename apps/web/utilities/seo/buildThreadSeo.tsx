import { normalize } from '@linen/utilities/string';
import { SerializedThread, Settings } from '@linen/types';
import { LINEN_URL } from 'secrets';

export function buildThreadSeo({
  isSubDomainRouting,
  channelName,
  settings,
  thread,
}: {
  isSubDomainRouting: boolean;
  channelName: string;
  settings: Settings;
  thread: SerializedThread;
}) {
  const cleanBody = normalize(thread.messages?.[0]?.body || thread.slug);
  const title = [
    thread.title || cleanBody.slice(0, 60),
    settings.communityName,
    '#' + channelName,
  ]
    .filter(Boolean)
    .join(' ');

  let url = isSubDomainRouting
    ? `https://${settings.redirectDomain}/t/${thread.incrementId}`
    : `${LINEN_URL}/${settings.prefix}/${settings.communityName}/t/${thread.incrementId}`;

  if (thread.slug) {
    url += '/' + thread.slug.toLowerCase();
  }

  return {
    title,
    description: cleanBody.slice(0, 200),
    image: settings.logoUrl,
    url,
  };
}
