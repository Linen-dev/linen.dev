import { capitalize, normalize } from '@linen/utilities/string';
import { Settings } from '@linen/types';
import { SerializedMessage } from '@linen/types';
import { LINEN_URL } from 'secrets';

export function buildThreadSeo({
  isSubDomainRouting,
  channelName,
  messages,
  settings,
  incrementId,
  slug,
}: {
  isSubDomainRouting: boolean;
  channelName: string;
  messages: SerializedMessage[];
  settings: Settings;
  incrementId: number;
  slug: string;
}) {
  const cleanBody = normalize(messages?.[0]?.body || slug);
  const title = [
    cleanBody.slice(0, 60),
    capitalize(channelName),
    capitalize(settings.communityName),
  ]
    .filter(Boolean)
    .join(' | ');

  let url = isSubDomainRouting
    ? `https://${settings.redirectDomain}/t/${incrementId}`
    : `${LINEN_URL}/${settings.prefix}/${settings.communityName}/t/${incrementId}`;

  if (slug) {
    url += '/' + slug.toLowerCase();
  }

  return {
    title,
    description: cleanBody.slice(0, 200),
    image: settings.logoUrl,
    url,
  };
}
