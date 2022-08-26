import { capitalize, cleanUpStringForSeo } from 'utilities/string';
import { Settings } from 'services/accountSettings';
import { SerializedMessage } from 'serializers/thread';

export function buildThreadSeo({
  isSubDomainRouting,
  channelName,
  messages,
  settings,
  threadId,
  slug,
}: {
  isSubDomainRouting: boolean;
  channelName: string;
  messages: SerializedMessage[];
  settings: Settings;
  threadId: string;
  slug: string;
}) {
  const cleanBody = cleanUpStringForSeo(messages?.[0]?.body || slug);
  const title = [
    cleanBody.slice(0, 60),
    capitalize(channelName),
    capitalize(settings.communityName),
  ]
    .filter(Boolean)
    .join(' | ');

  let url = isSubDomainRouting
    ? `https://${settings.redirectDomain}/t/${threadId}`
    : `https://linen.dev/${settings.prefix}/${settings.communityName}/t/${threadId}`;

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
